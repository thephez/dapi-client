const jsutil = require('@dashevo/dashcore-lib').util.js;
const preconditionsUtil = require('@dashevo/dashcore-lib').util.preconditions;
const cbor = require('cbor');

const {
  CorePromiseClient,
  PlatformPromiseClient,
  TransactionsFilterStreamPromiseClient,
  TransactionsWithProofsRequest,
  BloomFilter: BloomFilterMessage,
  ApplyStateTransitionRequest,
  GetIdentityRequest,
  GetDataContractRequest,
  GetDocumentsRequest,
  GetBlockRequest,
  GetStatusRequest,
  GetTransactionRequest,
  SendTransactionRequest,
} = require('@dashevo/dapi-grpc');

const DPP = require('@dashevo/dpp');
const MNDiscovery = require('./MNDiscovery/index');
const rpcClient = require('./RPCClient');
const config = require('./config');
const { responseErrorCodes } = require('./constants');

class DAPIClient {
  /**
   * @param options
   * @param {Array<object>} [options.seeds] - seeds. If no seeds provided
   * default seed will be used.
   * @param {number} [options.port=3000] - default port for connection to the DAPI
   * @param {number} [options.nativeGrpcPort=3010] - Native GRPC port for connection to the DAPI
   * @param {number} [options.timeout=2000] - timeout for connection to the DAPI
   * @param {number} [options.retries=3] - num of retries if there is no response from DAPI node
   */
  constructor(options = {}) {
    this.MNDiscovery = new MNDiscovery(options.seeds, options.port);
    this.DAPIPort = options.port || config.Api.port;
    this.nativeGrpcPort = options.nativeGrpcPort || config.grpc.nativePort;
    this.timeout = options.timeout || 2000;
    preconditionsUtil.checkArgument(jsutil.isUnsignedInteger(this.timeout),
      'Expect timeout to be an unsigned integer');
    this.retries = options.retries ? options.retries : 3;
    preconditionsUtil.checkArgument(jsutil.isUnsignedInteger(this.retries),
      'Expect retries to be an unsigned integer');
    this.dpp = new DPP();
  }

  /**
   * @private
   * @param {string} method
   * @param {object} params
   * @param {string[]} [excludedIps]
   * @returns {Promise<*>}
   */
  async makeRequestToRandomDAPINode(method, params, excludedIps = []) {
    this.makeRequest.callCount = 0;

    return this.makeRequestWithRetries(method, params, this.retries, excludedIps);
  }

  async makeRequest(method, params, excludedIps) {
    this.makeRequest.callCount += 1;
    const randomMasternode = await this.MNDiscovery.getRandomMasternode(excludedIps);
    return rpcClient.request({
      host: randomMasternode.service.split(':')[0],
      port: this.DAPIPort,
    }, method, params, { timeout: this.timeout });
  }

  async makeRequestWithRetries(method, params, retriesCount = 0, excludedIps) {
    try {
      return await this.makeRequest(method, params, excludedIps);
    } catch (err) {
      if (err.code !== 'ECONNABORTED' && err.code !== 'ECONNREFUSED') {
        throw err;
      }
      if (retriesCount > 0) {
        let excludedOnNextTry = [];
        if (err.address) {
          excludedOnNextTry = Array.isArray(excludedIps)
            ? excludedIps.slice().push(err.address) : excludedOnNextTry.push(err.address);
        }
        return this.makeRequestWithRetries(method, params, retriesCount - 1, excludedOnNextTry);
      }
      throw new Error('max retries to connect to DAPI node reached');
    }
  }

  /* Layer 1 commands */
  /**
   * ONLY FOR TESTING PURPOSES WITH REGTEST. WILL NOT WORK ON TESTNET/LIVENET.
   *
   * @param {number} blocksNumber - Number of blocks to generate
   * @param {string} address - The address that will receive the newly generated Dash
   * @returns {Promise<string[]>} - block hashes
   */
  generateToAddress(blocksNumber, address) { return this.makeRequestToRandomDAPINode('generateToAddress', { blocksNumber, address }); }

  /**
   * Returns block hash of chaintip
   *
   * @returns {Promise<string>}
   */
  getBestBlockHash() { return this.makeRequestToRandomDAPINode('getBestBlockHash', {}); }

  /**
   * Returns block hash for the given height
   *
   * @param {number} height
   * @returns {Promise<string>} - block hash
   */
  getBlockHash(height) { return this.makeRequestToRandomDAPINode('getBlockHash', { height }); }

  /**
   * Get deterministic masternodelist diff
   *
   * @param {string} baseBlockHash - hash or height of start block
   * @param {string} blockHash - hash or height of end block
   * @returns {Promise<object>}
   */
  getMnListDiff(baseBlockHash, blockHash) { return this.makeRequestToRandomDAPINode('getMnListDiff', { baseBlockHash, blockHash }); }

  /**
   * Returns a summary (balance, txs) for a given address
   *
   * @param {string|string[]} address or array of addresses
   * @param {boolean} [noTxList=false] - true if a list of all txs should NOT be included in result
   * @param {number} [from] - start of range for the tx to be included in the tx list
   * @param {number} [to] - end of range for the tx to be included in the tx list
   * @param {number} [fromHeight] - which height to start from (optional, overriding from/to)
   * @param {number} [toHeight] - on which height to end (optional, overriding from/to)
   * @returns {Promise<object>} - an object with basic address info
   */
  getAddressSummary(address, noTxList, from, to, fromHeight, toHeight) {
    return this.makeRequestToRandomDAPINode('getAddressSummary',
      {
        address, noTxList, from, to, fromHeight, toHeight,
      });
  }

  /**
   * Get block by height
   *
   * @param {number} height
   * @returns {Promise<null|Buffer>}
   */
  async getBlockByHeight(height) {
    const getBlockRequest = new GetBlockRequest();
    getBlockRequest.setHeight(height);

    const urlToConnect = await this.getGrpcUrl();

    const client = new CorePromiseClient(urlToConnect);

    let response;
    try {
      response = await client.getBlock(getBlockRequest);
    } catch (e) {
      if (e.code === responseErrorCodes.NOT_FOUND) {
        return null;
      }

      throw e;
    }

    const blockBinaryArray = response.getBlock();

    return Buffer.from(blockBinaryArray);
  }

  /**
   * Get block by hash
   *
   * @param {string} hash
   * @returns {Promise<null|Buffer>}
   */
  async getBlockByHash(hash) {
    const getBlockRequest = new GetBlockRequest();
    getBlockRequest.setHash(hash);

    const urlToConnect = await this.getGrpcUrl();

    const client = new CorePromiseClient(urlToConnect);

    let response;
    try {
      response = await client.getBlock(getBlockRequest);
    } catch (e) {
      if (e.code === responseErrorCodes.NOT_FOUND) {
        return null;
      }

      throw e;
    }

    const blockBinaryArray = response.getBlock();

    return Buffer.from(blockBinaryArray);
  }

  /**
   * Get Core chain status
   *
   * @returns {Promise<object>}
   */
  async getStatus() {
    const getStatusRequest = new GetStatusRequest();

    const urlToConnect = await this.getGrpcUrl();

    const client = new CorePromiseClient(urlToConnect);

    const response = await client.getStatus(getStatusRequest);

    return response.toObject();
  }

  /**
   * Get Transaction by ID
   *
   * @param {string} id
   * @returns {Promise<null|Buffer>}
   */
  async getTransaction(id) {
    const getTransactionRequest = new GetTransactionRequest();
    getTransactionRequest.setId(id);

    const urlToConnect = await this.getGrpcUrl();

    const client = new CorePromiseClient(urlToConnect);

    let response;
    try {
      response = await client.getTransaction(getTransactionRequest);
    } catch (e) {
      if (e.code === responseErrorCodes.NOT_FOUND) {
        return null;
      }

      throw e;
    }

    const transactionBinaryArray = response.getTransaction();

    let transaction = null;
    if (transactionBinaryArray) {
      transaction = Buffer.from(transactionBinaryArray);
    }

    return transaction;
  }

  /**
   * Send Transaction
   *
   * @param {Buffer} transaction
   * @param {object} [options]
   * @param {object} [options.allowHighFees=false]
   * @param {object} [options.bypassLimits=false]
   * @returns {string}
   */
  async sendTransaction(transaction, options = {}) {
    const sendTransactionRequest = new SendTransactionRequest();
    sendTransactionRequest.setTransaction(transaction);
    sendTransactionRequest.setAllowHighFees(options.allowHighFees || false);
    sendTransactionRequest.setBypassLimits(options.bypassLimits || false);

    const urlToConnect = await this.getGrpcUrl();

    const client = new CorePromiseClient(urlToConnect);

    const response = await client.sendTransaction(sendTransactionRequest);

    return response.getTransactionId();
  }

  /**
   * Returns UTXO for a given address or multiple addresses (max result 1000)
   *
   * @param {string|string[]} address or array of addresses
   * @param {number} [from] - start of range in the ordered list of latest UTXO (optional)
   * @param {number} [to] - end of range in the ordered list of latest UTXO (optional)
   * @param {number} [fromHeight] - which height to start from (optional, overriding from/to)
   * @param {number} [toHeight] - on which height to end (optional, overriding from/to)
   * @returns {Promise<object>} - Object with pagination info and array of unspent outputs
   */
  getUTXO(address, from, to, fromHeight, toHeight) {
    return this.makeRequestToRandomDAPINode('getUTXO',
      {
        address, from, to, fromHeight, toHeight,
      });
  }

  /* gRPC methods */

  /* txFilterStream methods */
  /**
   * @param {object} bloomFilter
   * @param {Uint8Array|Array} bloomFilter.vData - The filter itself is simply a bit
   * field of arbitrary byte-aligned size. The maximum size is 36,000 bytes.
   * @param {number} bloomFilter.nHashFuncs - The number of hash functions to use in this filter.
   * The maximum value allowed in this field is 50.
   * @param {number} bloomFilter.nTweak - A random value to add to the seed value in the
   * hash function used by the bloom filter.
   * @param {number} bloomFilter.nFlags - A set of flags that control how matched items
   * are added to the filter.
   * @param {object} [options]
   * @param {string} [options.fromBlockHash] - Specifies block hash to start syncing from
   * @param {number} [options.fromBlockHeight] - Specifies block height to start syncing from
   * @param {number} [options.count=0] - Number of blocks to sync,
   * if set to 0 syncing is continuously sends new data as well
   * @returns {
   *    Promise<EventEmitter>|!grpc.web.ClientReadableStream<!TransactionsWithProofsResponse>
   * }
   */
  async subscribeToTransactionsWithProofs(bloomFilter, options = { count: 0 }) {
    const bloomFilterMessage = new BloomFilterMessage();

    let { vData } = bloomFilter;
    if (Array.isArray(vData)) {
      vData = new Uint8Array(vData);
    }

    bloomFilterMessage.setVData(vData);
    bloomFilterMessage.setNHashFuncs(bloomFilter.nHashFuncs);
    bloomFilterMessage.setNTweak(bloomFilter.nTweak);
    bloomFilterMessage.setNFlags(bloomFilter.nFlags);

    const request = new TransactionsWithProofsRequest();
    request.setBloomFilter(bloomFilterMessage);

    if (options.fromBlockHeight) {
      request.setFromBlockHeight(options.fromBlockHeight);
    }

    if (options.fromBlockHash) {
      request.setFromBlockHash(
        Buffer.from(options.fromBlockHash, 'hex'),
      );
    }

    request.setCount(options.count);

    const urlToConnect = await this.getGrpcUrl();

    const client = new TransactionsFilterStreamPromiseClient(urlToConnect);

    return client.subscribeToTransactionsWithProofs(request);
  }

  /* Platform gRPC methods */

  /**
   * Send State Transition to machine
   *
   * @param {AbstractStateTransition} stateTransition
   * @returns {Promise<!ApplyStateTransitionResponse>}
   */
  async applyStateTransition(stateTransition) {
    const applyStateTransitionRequest = new ApplyStateTransitionRequest();
    applyStateTransitionRequest.setStateTransition(stateTransition.serialize());

    const urlToConnect = await this.getGrpcUrl();

    const client = new PlatformPromiseClient(urlToConnect);

    return client.applyStateTransition(applyStateTransitionRequest);
  }

  /**
   * Fetch the identity by id
   *
   * @param {string} id
   * @returns {Promise<!Buffer|null>}
   */
  async getIdentity(id) {
    const getIdentityRequest = new GetIdentityRequest();
    getIdentityRequest.setId(id);

    const urlToConnect = await this.getGrpcUrl();

    const client = new PlatformPromiseClient(urlToConnect);

    let getIdentityResponse;
    try {
      getIdentityResponse = await client.getIdentity(getIdentityRequest);
    } catch (e) {
      if (e.code === responseErrorCodes.NOT_FOUND) {
        return null;
      }

      throw e;
    }

    const serializedIdentityBinaryArray = getIdentityResponse.getIdentity();
    let identity = null;

    if (serializedIdentityBinaryArray) {
      identity = Buffer.from(serializedIdentityBinaryArray);
    }

    return identity;
  }

  /**
   * Fetch Data Contract by id
   *
   * @param {string} contractId
   * @returns {Promise<Buffer>}
   */
  async getDataContract(contractId) {
    const getDataContractRequest = new GetDataContractRequest();

    getDataContractRequest.setId(contractId);

    const urlToConnect = await this.getGrpcUrl();

    const client = new PlatformPromiseClient(urlToConnect);

    let getDataContractResponse;
    try {
      getDataContractResponse = await client.getDataContract(getDataContractRequest);
    } catch (e) {
      if (e.code === responseErrorCodes.NOT_FOUND) {
        return null;
      }

      throw e;
    }

    const serializedDataContractBinaryArray = getDataContractResponse.getDataContract();

    let dataContract = null;

    if (serializedDataContractBinaryArray) {
      dataContract = Buffer.from(serializedDataContractBinaryArray);
    }

    return dataContract;
  }

  /**
   * Fetch Documents from Drive
   *
   * @param {string} contractId
   * @param {string} type - Dap objects type to fetch
   * @param options
   * @param {object} options.where - Mongo-like query
   * @param {object} options.orderBy - Mongo-like sort field
   * @param {number} options.limit - how many objects to fetch
   * @param {number} options.startAt - number of objects to skip
   * @param {number} options.startAfter - exclusive skip
   * @returns {Promise<Buffer[]>}
   */
  async getDocuments(contractId, type, options) {
    const {
      where,
      orderBy,
      limit,
      startAt,
      startAfter,
    } = options;

    let whereSerialized;
    if (where) {
      whereSerialized = cbor.encode(where);
    }

    let orderBySerialized;
    if (orderBy) {
      orderBySerialized = cbor.encode(orderBy);
    }

    const getDocumentsRequest = new GetDocumentsRequest();
    getDocumentsRequest.setDataContractId(contractId);
    getDocumentsRequest.setDocumentType(type);
    getDocumentsRequest.setWhere(whereSerialized);
    getDocumentsRequest.setOrderBy(orderBySerialized);
    getDocumentsRequest.setLimit(limit);
    getDocumentsRequest.setStartAfter(startAfter);
    getDocumentsRequest.setStartAt(startAt);

    const urlToConnect = await this.getGrpcUrl();

    const client = new PlatformPromiseClient(urlToConnect);

    const getDocumentsResponse = await client.getDocuments(getDocumentsRequest);

    return getDocumentsResponse.getDocumentsList().map((document) => Buffer.from(document));
  }

  /**
   * Get gRPC url to connect
   *
   * @private
   * @returns {Promise<string>}
   */
  async getGrpcUrl() {
    const nodeToConnect = await this.MNDiscovery.getRandomMasternode();

    if (typeof process !== 'undefined'
      && process.versions != null
      && process.versions.node != null) {
      return `${nodeToConnect.getIp()}:${this.nativeGrpcPort}`;
    }

    return `http://${nodeToConnect.getIp()}:${this.DAPIPort}`;
  }
}

module.exports = DAPIClient;
