import * as dotenv from 'dotenv'
import '@nomiclabs/hardhat-waffle'
import { HardhatUserConfig, task } from "hardhat/config";

dotenv.config()

const config: HardhatUserConfig = {
  networks: {
    main: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [ process.env.PRIVATE_KEY! ],
      gas: 400000,
      gasPrice: 40
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [ process.env.PRIVATE_KEY! ]
    },
    polygon: {
      url: 'https://rpc-mumbai.maticvigil.com',
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