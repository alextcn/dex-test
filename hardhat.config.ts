import * as dotenv from 'dotenv'
import '@nomiclabs/hardhat-waffle'
import { HardhatUserConfig, task } from "hardhat/config";
import { testDEX } from './scripts/testdex';

dotenv.config()


const networkURLs = {
  'ethereum': `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
  'ropsten': `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
  'polygon': 'https://matic-mainnet.chainstacklabs.com',
  'polygonTestnet': 'https://rpc-mumbai.maticvigil.com',
  'bsc': 'https://bsc-dataseed.binance.org/', //  causes missing trie node error
  'bscTestnet': 'https://data-seed-prebsc-1-s1.binance.org:8545',
  'heco': "https://http-mainnet-node.huobichain.com"
}


task('testdex', 'Launches a local forked node')
  .addParam('chain', 'Name of supported EMV-based network')
  .setAction(async (args, hre) => {
    await testDEX(hre, args.chain)
  })

const config: HardhatUserConfig = {
  networks: {
    ethereum: {
      url: networkURLs.ethereum,
      accounts: [ process.env.PRIVATE_KEY! ],
      gas: 400000,
      gasPrice: 40
    },
    ropsten: {
      url: networkURLs.ropsten,
      accounts: [ process.env.PRIVATE_KEY! ]
    },
    polygon: {
      url: networkURLs.polygon,
      accounts: [ process.env.PRIVATE_KEY! ]
    },
    polygonTestnet: {
      url: networkURLs.polygonTestnet,
      accounts: [ process.env.PRIVATE_KEY! ]
    },
    bsc: {
      url: networkURLs.bsc,
      accounts: [ process.env.PRIVATE_KEY! ]
    },
    bscTestnet: {
      url: networkURLs.bscTestnet,
      accounts: [ process.env.PRIVATE_KEY! ]
    },
    heco: {
      url: networkURLs.heco,
      accounts: [ process.env.PRIVATE_KEY! ]
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4"
      }
    ]
  }
}

export default config