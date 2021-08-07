import { BigNumber, Contract } from "ethers"
import { ethers, network } from "hardhat"
import abi from "../abi.json"
import dexs from "../dexs.json"


// const DEX = dexByNetwork(network.name)
const DEX = dexs.pancakeswapTestnet
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

  const router = await ethers.getContractAt(abi.uniRouter, DEX.router)
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
  
  // TODO: throw on failed txs
  // approve token transfer first
  await token.approve(router.address, amountTokenDesired)
  // add liquidity
  const tx = await router.addLiquidityETH(
    token.address, amountTokenDesired, amountTokenMin, amountETHMin, sender, deadline, params
  )
  

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





// // select DEX based on network
// function dexByNetwork(network: string) {
//   switch(network) {
//     case 'ethereum':
//     case 'ropsten':
//       return dexs.uniswap
//     case 'bsc':
//       return dexs.pancakeswap
//     default:
//       throw new Error(`No DEX for ${network} network`)
//   }
// }
 