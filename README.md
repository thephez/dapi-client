<h1 align="center">DAPI-CLIENT V.1.1.0</h1>

<div align="center">
  <strong>A Dash Library to work with the DAPI on a Javascript landscape.</strong>
  <p>It wraps all the work needed to answer to your real need (Tx, Blocks, Balance, UTXO..) and provide easy to use Promise-based method.</p>
</div>
<br />
<div align="center">
  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg?style=flat-square"
      alt="API stability" />
  </a>
  <!-- Build Status -->
  <a href="https://travis-ci.com/dashevo/dapi-client">
    <img src="https://img.shields.io/travis/dashevo/dapi-client/master.svg?style=flat-square" alt="Build Status" />
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/dapi-client">
    <img src="https://img.shields.io/npm/v/dapi-client.svg?style=flat-square" alt="NPM version" />
  </a>
</div>

#### Note on software compatibility:
This package requires the use of Node >= 8.0.0 and is broadly compatible with modern browsers implementing the ECMAScript 2015 standard or better.

## Table of Content
- [Features](#features)
- [Getting Started](#getting-started)
    - [Install DAPI-SDK](#install-dapi-sdk)
- [Uses](#uses-)
    - [Import the package](#import-the-package-)
    - [Add Specific Insight-API node](#add-specific-insight-api-node)
    - [Api Documentation](#api-documentation-)
    - [Components](#components-)
- [Use cases](https://github.com/dashevo/dapi-sdk/blob/master/USECASES.md)
- [License](https://github.com/dashevo/dapi-sdk/blob/master/LICENSE)

## Features :
- Provide accounts registration/authentication (using OP_RETURN for now).
- Basic discovery mode and request balancing.
- Explorer API (connector with Insight-API)
- Blockchain/SPV validation (blockheaders)
- TX/Blocks events (whenever a new block/tx is found emit the data).


## Getting Started
### Install DAPI-SDK
* npm : `npm i -S @dashevo/dapi-client`
* github : `npm i -S github:dashevo/dapi-client`

### Uses : 

You can check our [test folder](https://github.com/dashevo/dapi-sdk/tree/master/test) to see some usage examples.

##### Import the package :
```js

//import package
const DAPISDK = require('dapi-sdk');

//Quiter version of possibles options.
const options = {
    debug:false,
    verbose:false,
    errors:false,
    warnings:false
};
let SDK = DAPISDK(options);
```

Where theses options can be (in parenthesis,the default value) : 

- debug(false) : Bool - When activated, returns utils logs (methods called, uris...)
- verbose(false) : Bool - Will talk. A lot. Emitted events, received stuff...
- warnings(true) : Bool - When activated, log errors received/handled.
- errors(true) : Bool - When activated, log errors received/handled.
- DISCOVER: Object - 
	- INSIGHT_SEEDS : Array of insight-api uri metadata endpoints (temporary step - see below an example)
		
```json
{
"INSIGHT_SEEDS": [
           {
                "protocol": "http",
                "path": "insight-api-dash",
                "base": "51.15.5.18",
                "port": 3001
            }
        ]
}
```


Most of the SDK methods will returns you a Promise.

Therefore depending on your specific needs you can init or call methods of the SDK in a async way :

```js
let API = SDK.Explorer.API;

API
	.getLastBlockHeight()
	.then(function (height) {
        console.log(`last height is ${height}`);
    });

API
	.getLastBlockHeight(API.getHashFromHeight)
	.then(function(hash){
		console.log(`Last hash is ${hash}`);
	});
});
```

or using async/await features provided in last NodeJS version :

```js
let height = await SDK.Explorer.API.getLastBlockHeight();
console.log(`last height is ${height}`);
```

On the API documentation below, and for readability reasons, await will mostly be used.

#### Add specific insight-api node

During development phase, you might need to have access to the website you want to call your data from.
Therefore you have the possibility to add your seed yourself (we might bring default stable server later). 

Example : 

```js
const options = {
   STUFF:stuff,
   DISCOVER:{
           INSIGHT_SEEDS:[{
               protocol:"https",
               path:'api',
               base:"insight.dash.siampm.com",
               port: 443
           }]
       }
};
let SDK = await DAPISDK(options);
```

#### API Documentation : 
<!-- - [Accounts](https://github.com/dashevo/dapi-sdk/tree/master/Accounts/README.md) -->
- [Blockchain](https://github.com/dashevo/dapi-sdk/tree/master/Blockchain/README.md)
<!-- - [Discover](https://github.com/dashevo/dapi-sdk/tree/master/Discover/README.md) -->
<!-- - [Explorer](https://github.com/dashevo/dapi-sdk/tree/master/Explorer/README.md) -->
<!-- - [Wallet](https://github.com/dashevo/dapi-sdk/tree/master/Wallet/README.md) -->
- [Util](https://github.com/snogcel/dash-util)


#### Components : 

After having initiate DAPI-SDK, you will then have access to differents components (à-la framework). 

- `Explorer` will allow you to perform some commands on the Insight-API of a masternode (chosen randomly on a validated list).
As it will use some `Discover` methods in order to get the Insight Candidate, calling an Explorer call will first perform an init of Discover (and therefore will fetch and validate the list) before returning the value.
Make a note that this will be performed only once.

- `Blockchain` will allow you to have access to some components such as: getting an object stored in your in-mem db, or validate multiple blocks, calculate the next difficulty.
The initialization must be done by yourself using: `await SDK.Blockchain.init()` in order to beneficiate theses function.
Make note that by default it will connect to a randomly selected insight-api by websocket and will listen to all blocks. When a block is emitter by the API, it will add it in the blockchain.
This comportement can be disable by passing to init the corresponding options (see below).
Using `SDK.Blockchain.chain` enable you to use the [blockchain-spv-dash](https://github.com/dashevo/blockchain-spv-dash) methods

- `tools` will allow to access to some of the dependencies of the SDK. Most notably, you have access to:
    - `SDK.tools.util` which corresponds to a library of handy stuff such as toHash(hex), compressTarget, expandTarget. API here: [dash-util](https://github.com/snogcel/dash-util)
    - `SDK.tools.bitcore` which corresponds to a library used in insight-api, see API here: [bitcore-dash-library](https://github.com/dashpay/bitcore-lib-dash). Contains elements that allow to generate address, sign/verify a message...
