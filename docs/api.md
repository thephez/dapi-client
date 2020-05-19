<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [constructor][1]
    -   [Parameters][2]
-   [generateToAddress][3]
    -   [Parameters][4]
-   [getBestBlockHash][5]
-   [getBlockHash][6]
    -   [Parameters][7]
-   [getMnListDiff][8]
    -   [Parameters][9]
-   [getAddressSummary][10]
    -   [Parameters][11]
-   [getBlockByHeight][12]
    -   [Parameters][13]
-   [getBlockByHash][14]
    -   [Parameters][15]
-   [getStatus][16]
-   [getTransaction][17]
    -   [Parameters][18]
-   [sendTransaction][19]
    -   [Parameters][20]
-   [getUTXO][21]
    -   [Parameters][22]
-   [subscribeToTransactionsWithProofs][23]
    -   [Parameters][24]
-   [applyStateTransition][25]
    -   [Parameters][26]
-   [getIdentity][27]
    -   [Parameters][28]
-   [getDataContract][29]
    -   [Parameters][30]
-   [getDocuments][31]
    -   [Parameters][32]

## constructor

[src/index.js:37-48][33]

### Parameters

-   `options`   (optional, default `{}`)
    -   `options.seeds` **[Array][34]&lt;[Object][35]>?** seeds. If no seeds provided
        default seed will be used.
    -   `options.port` **[number][36]** default port for connection to the DAPI (optional, default `3000`)
    -   `options.nativeGrpcPort` **[number][36]** Native GRPC port for connection to the DAPI (optional, default `3010`)
    -   `options.timeout` **[number][36]** timeout for connection to the DAPI (optional, default `2000`)
    -   `options.retries` **[number][36]** num of retries if there is no response from DAPI node (optional, default `3`)

## generateToAddress

[src/index.js:98-98][37]

ONLY FOR TESTING PURPOSES WITH REGTEST. WILL NOT WORK ON TESTNET/LIVENET.

### Parameters

-   `blocksNumber` **[number][36]** Number of blocks to generate
-   `address` **[string][38]** The address that will receive the newly generated Dash

Returns **[Promise][39]&lt;[Array][34]&lt;[string][38]>>** block hashes

## getBestBlockHash

[src/index.js:104-104][40]

Returns block hash of chaintip

Returns **[Promise][39]&lt;[string][38]>** 

## getBlockHash

[src/index.js:111-111][41]

Returns block hash for the given height

### Parameters

-   `height` **[number][36]** 

Returns **[Promise][39]&lt;[string][38]>** block hash

## getMnListDiff

[src/index.js:119-119][42]

Get deterministic masternodelist diff

### Parameters

-   `baseBlockHash` **[string][38]** hash or height of start block
-   `blockHash` **[string][38]** hash or height of end block

Returns **[Promise][39]&lt;[object][35]>** 

## getAddressSummary

[src/index.js:131-136][43]

Returns a summary (balance, txs) for a given address

### Parameters

-   `address` **([string][38] \| [Array][34]&lt;[string][38]>)** or array of addresses
-   `noTxList` **[boolean][44]** true if a list of all txs should NOT be included in result (optional, default `false`)
-   `from` **[number][36]?** start of range for the tx to be included in the tx list
-   `to` **[number][36]?** end of range for the tx to be included in the tx list
-   `fromHeight` **[number][36]?** which height to start from (optional, overriding from/to)
-   `toHeight` **[number][36]?** on which height to end (optional, overriding from/to)

Returns **[Promise][39]&lt;[Object][35]>** an object with basic address info

## getBlockByHeight

[src/index.js:144-166][45]

Get block by height

### Parameters

-   `height` **[number][36]** 

Returns **[Promise][39]&lt;(null | [Buffer][46])>** 

## getBlockByHash

[src/index.js:174-196][47]

Get block by hash

### Parameters

-   `hash` **[string][38]** 

Returns **[Promise][39]&lt;(null | [Buffer][46])>** 

## getStatus

[src/index.js:203-213][48]

Get Core chain status

Returns **[Promise][39]&lt;[Object][35]>** 

## getTransaction

[src/index.js:221-248][49]

Get Transaction by ID

### Parameters

-   `id` **[string][38]** 

Returns **[Promise][39]&lt;(null | [Buffer][46])>** 

## sendTransaction

[src/index.js:259-272][50]

Send Transaction

### Parameters

-   `transaction` **[Buffer][46]** 
-   `options` **[Object][35]?**  (optional, default `{}`)
    -   `options.allowHighFees` **[Object][35]**  (optional, default `false`)
    -   `options.bypassLimits` **[Object][35]**  (optional, default `false`)

Returns **[string][38]** 

## getUTXO

[src/index.js:283-288][51]

Returns UTXO for a given address or multiple addresses (max result 1000)

### Parameters

-   `address` **([string][38] \| [Array][34]&lt;[string][38]>)** or array of addresses
-   `from` **[number][36]?** start of range in the ordered list of latest UTXO (optional)
-   `to` **[number][36]?** end of range in the ordered list of latest UTXO (optional)
-   `fromHeight` **[number][36]?** which height to start from (optional, overriding from/to)
-   `toHeight` **[number][36]?** on which height to end (optional, overriding from/to)

Returns **[Promise][39]&lt;[object][35]>** Object with pagination info and array of unspent outputs

## subscribeToTransactionsWithProofs

[src/index.js:312-345][52]

### Parameters

-   `bloomFilter` **[Object][35]** 
    -   `bloomFilter.vData` **([Uint8Array][53] \| [Array][34])** The filter itself is simply a bit
        field of arbitrary byte-aligned size. The maximum size is 36,000 bytes.
    -   `bloomFilter.nHashFuncs` **[number][36]** The number of hash functions to use in this filter.
        The maximum value allowed in this field is 50.
    -   `bloomFilter.nTweak` **[number][36]** A random value to add to the seed value in the
        hash function used by the bloom filter.
    -   `bloomFilter.nFlags` **[number][36]** A set of flags that control how matched items
        are added to the filter.
-   `options` **[Object][35]?**  (optional, default `{count:0}`)
    -   `options.fromBlockHash` **[string][38]?** Specifies block hash to start syncing from
    -   `options.fromBlockHeight` **[number][36]?** Specifies block height to start syncing from
    -   `options.count` **[number][36]** Number of blocks to sync,
        if set to 0 syncing is continuously sends new data as well (optional, default `0`)

Returns **([Promise][39]&lt;EventEmitter> | !grpc.web.ClientReadableStream&lt;!TransactionsWithProofsResponse>)** 

## applyStateTransition

[src/index.js:355-364][54]

Send State Transition to machine

### Parameters

-   `stateTransition` **AbstractStateTransition** 

Returns **[Promise][39]&lt;!ApplyStateTransitionResponse>** 

## getIdentity

[src/index.js:371-398][55]

Fetch the identity by id

### Parameters

-   `id` **[string][38]** 

Returns **[Promise][39]&lt;(![Buffer][46] | null)>** 

## getDataContract

[src/index.js:405-434][56]

Fetch Data Contract by id

### Parameters

-   `contractId` **[string][38]** 

Returns **[Promise][39]&lt;[Buffer][46]>** 

## getDocuments

[src/index.js:448-483][57]

Fetch Documents from Drive

### Parameters

-   `contractId` **[string][38]** 
-   `type` **[string][38]** Dap objects type to fetch
-   `options`  
    -   `options.where` **[Object][35]** Mongo-like query
    -   `options.orderBy` **[Object][35]** Mongo-like sort field
    -   `options.limit` **[number][36]** how many objects to fetch
    -   `options.startAt` **[number][36]** number of objects to skip
    -   `options.startAfter` **[number][36]** exclusive skip

Returns **[Promise][39]&lt;[Array][34]&lt;[Buffer][46]>>** 

[1]: #constructor

[2]: #parameters

[3]: #generatetoaddress

[4]: #parameters-1

[5]: #getbestblockhash

[6]: #getblockhash

[7]: #parameters-2

[8]: #getmnlistdiff

[9]: #parameters-3

[10]: #getaddresssummary

[11]: #parameters-4

[12]: #getblockbyheight

[13]: #parameters-5

[14]: #getblockbyhash

[15]: #parameters-6

[16]: #getstatus

[17]: #gettransaction

[18]: #parameters-7

[19]: #sendtransaction

[20]: #parameters-8

[21]: #getutxo

[22]: #parameters-9

[23]: #subscribetotransactionswithproofs

[24]: #parameters-10

[25]: #applystatetransition

[26]: #parameters-11

[27]: #getidentity

[28]: #parameters-12

[29]: #getdatacontract

[30]: #parameters-13

[31]: #getdocuments

[32]: #parameters-14

[33]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L37-L48 "Source code on GitHub"

[34]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[35]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[36]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[37]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L98-L98 "Source code on GitHub"

[38]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[39]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise

[40]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L104-L104 "Source code on GitHub"

[41]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L111-L111 "Source code on GitHub"

[42]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L119-L119 "Source code on GitHub"

[43]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L131-L136 "Source code on GitHub"

[44]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[45]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L144-L166 "Source code on GitHub"

[46]: https://nodejs.org/api/buffer.html

[47]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L174-L196 "Source code on GitHub"

[48]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L203-L213 "Source code on GitHub"

[49]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L221-L248 "Source code on GitHub"

[50]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L259-L272 "Source code on GitHub"

[51]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L283-L288 "Source code on GitHub"

[52]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L312-L345 "Source code on GitHub"

[53]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array

[54]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L355-L364 "Source code on GitHub"

[55]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L371-L398 "Source code on GitHub"

[56]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L405-L434 "Source code on GitHub"

[57]: https://github.com/thephez/dapi-client/blob/29753656dc685db2bd5eefd6c19ebbd86285bb5e/src/index.js#L448-L483 "Source code on GitHub"