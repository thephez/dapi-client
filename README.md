# DAPI Client

[![Build Status](https://travis-ci.com/dashevo/dapi-client.svg?branch=master)](https://travis-ci.com/dashevo/dapi-client)
[![GitHub Current Tag](https://img.shields.io/github/tag-date/dashevo/dapi-client.svg)](https://github.com/dashevo/dapi-client/tags)
[![npm](https://img.shields.io/npm/v/@dashevo/dapi-client.svg)](https://www.npmjs.com/package/@dashevo/dapi-client)

Client library used to access Dash DAPI endpoints

This library enables HTTP-based interaction with the Dash blockchain and Dash
Platform via the decentralized API ([DAPI](https://github.com/dashevo/dapi))
hosted on Dash masternodes.

 - `DAPI-Client` provides automatic server (masternode) discovery using either a default seed node or a user-supplied one
 - `DAPI-Client` maps to DAPI's [RPC](https://github.com/dashevo/dapi/tree/master/lib/rpcServer/commands) and [gRPC](https://github.com/dashevo/dapi/tree/master/lib/grpcServer/handlers) endpoints

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Install

```sh
npm install @dashevo/dapi-client
```

## Usage

### Basic

```javascript
const DAPIClient = require('@dashevo/dapi-client');
var client = new DAPIClient();

client.getBestBlockHash();
```

### Custom seed node

Custom seed nodes are necessary for connecting the client to devnets since the client library is unaware of them otherwise.

```javascript
const DAPIClient = require('@dashevo/dapi-client');

var client = new DAPIClient({
  seeds: [{
    service: 'seed-1.evonet.networks.dash.org',
    port: 3000
  }],
});

client.getBestBlockHash().then((r) => {
  console.log(r);
});

```

**Note**: The seed node shown above (`seed-1.evonet.networks.dash.org`) is for the Dash Evonet testing network.

## Documentation

More extensive documentation available at https://dashevo.github.io/dapi-client/.


## Contributing

Feel free to dive in! [Open an issue](https://github.com/dashevo/dapi-client/issues/new) or submit PRs.

## License

[MIT](LICENSE) &copy; Dash Core Group, Inc.
