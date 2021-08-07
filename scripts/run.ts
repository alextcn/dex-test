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
  const sender = await ethers.provider.getSigner().getAddress()

  const router = await ethers.getContractAt(abi.uniRouter, routerAddress)
  const WETH = await router.WETH()
  
  // deploy USDX token (initial supply is minted to sender)
  const token = await deployToken()
  const symbol = await token.symbol()
  const decimals = await token.decimals()
  
  console.log(`sender: ${sender}`)
  console.log(`WETH: ${WETH}`)
  console.log(`${await token.symbol()}: ${token.address}`)
  console.log('------')

  console.log(`ETH balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(sender))}`)
  console.log(`${symbol} balance: ${ethers.utils.formatUnits(await token.balanceOf(sender), decimals)}`)
  console.log('------')
  
  // create pair and add liquidity 
  // (if a pool for the passed token and WETH does not exists, one is created automatically, 
  // and exactly amountTokenDesired/msg.value tokens are added)
  const amountTokenDesired = ethers.utils.parseUnits('50', decimals)
  const amountETHDesired = ethers.utils.parseEther('1')
  const amountTokenMin = amountTokenDesired
  const amountETHMin = amountETHDesired
  const blockNumber = await ethers.provider.getBlockNumber()
  const deadline = (await ethers.provider.getBlock(blockNumber)).timestamp + (60 * 60)
  let params = { value: amountETHDesired }
  
  // approve token transfer first
  await token.approve(router.address, amountTokenDesired)
  // TODO: throw on failed tx

  // add liquidity
  const tx = await router.addLiquidityETH(
    token.address, amountTokenDesired, amountTokenMin, amountETHMin, sender, deadline, params
  )
  
  // TODO: log and check price
  console.log(`ETH balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(sender))}`)
  console.log(`${symbol} balance: ${ethers.utils.formatUnits(await token.balanceOf(sender), decimals)}`)
  // console.log(`tx = ${JSON.stringify(await tx.wait())}`)

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })