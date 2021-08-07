import { BigNumber, Contract } from "ethers"
import { ethers, artifacts } from "hardhat"
import abi from "../abi.json"


const factoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

const USDX_SUPPLY = BigNumber.from(1000).mul(BigNumber.from(10).pow(18))


// deploys new ERC20 token and returns it's address
async function deployToken(): Promise<Contract> {
  const f = await ethers.getContractFactory('USDXToken')
  const token = await f.deploy(USDX_SUPPLY)
  await token.deployed()
  return token
}


async function main() {
  const senderAddress = await ethers.provider.getSigner().getAddress()

  const router = await ethers.getContractAt(abi.uniRouter, routerAddress)
  const WETH = await router.WETH()
  console.log(`WETH: ${WETH}`)

  const token = await deployToken()
  console.log(`${await token.symbol()} deployed at ${token.address}`)

  const balance = await token.balanceOf(senderAddress)
  console.log(`balanceOf(${senderAddress}): ${ethers.utils.formatUnits(balance, await token.decimals())}`)
  
  // const factory = await ethers.getContractAt(abi.uniFactory, factoryAddress)
  // const pair = await factory.getPair(WETH, token.address)
  // if (pair == '0x0000000000000000000000000000000000000000') {
  //   throw new Error(`No pair for ${token.address}`)
  // }


  // addLiquidityETH
  // If a pool for the passed token and WETH does not exists, one is created automatically, 
  // and exactly amountTokenDesired/msg.value tokens are added.
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })