# Test DEX

### Install

#### 1. Add to `.env` account private key and Alchemy API key
`PRIVATE_KEY=[PRIVATE_KEY]`  
`ALCHEMY_API_KEY=[ETH_API_KEY]`

#### 2. Install dependencies, compile contracts
`npm install`  
`npx hardhat compile`

### Usage

1. Fork a node on localhost: `npx hardhat node --fork [CHAIN_RPC_URL]`
2. Run script (in a new window): `npx hardhat testdex --network localhost --chain [CHAIN_NAME]`

### Chains

| Chain name     | DEX                | RPC URL                                                |
| -------------- | ------------------ | ------------------------------------------------------ | 
| ethereum       | Uniswap            | https://eth-mainnet.alchemyapi.io/v2/[ALCHEMY_API_KEY] |
| ropsten        | Uniswap            | https://eth-ropsten.alchemyapi.io/v2/[ALCHEMY_API_KEY] |
| polygon        | Quickswap          | https://matic-mainnet.chainstacklabs.com               |
| polygonTestnet | -                  | https://rpc-mumbai.maticvigil.com                      |
| bsc            | Pancakeswap        | https://bsc-dataseed.binance.org                       |
| bscTestnet     | Pancakeswap (test) | https://data-seed-prebsc-1-s1.binance.org:8545         |
| heco           | MDEX               | https://http-mainnet-node.huobichain.com               |
