import { BigNumber, Contract } from "ethers"
import { isAddress } from "ethers/lib/utils"
import { ethers, network } from "hardhat"
import abi from "../abi.json"
import dexs from "../dexs.json"


// const DEX = dexByNetwork(network.name)
const DEX = dexs.mdex
const USDX_SUPPLY = BigNumber.from(1000).mul(BigNumber.from(10).pow(18))


// deploys new ERC20 token and returns it's address
async function deployToken(): Promise<Contract> {
  const f = await ethers.getContractFactory('USDXToken')
  const token = await f.deploy(USDX_SUPPLY)
  await token.deployed()
  return token
}

async function logBalance(address: string, tokens: Contract[]) {
  console.log(`balance:`)
  console.log(`- ${ethers.utils.formatEther(await ethers.provider.getBalance(address))} WETH`)
  for (const token of tokens) {
    console.log(`- ${ethers.utils.formatUnits(await token.balanceOf(address), await token.decimals())} ${await token.symbol()}`)
  }
}

async function main() {
  const sender = await ethers.provider.getSigner().getAddress()

  const router = await ethers.getContractAt(abi.uniRouter, DEX.router)
  const factory = await ethers.getContractAt(abi.uniFactory, DEX.factory)
  const WETH = await router.WHT() as string

  console.log(`sender: ${sender}`)
  console.log(`WETH: ${WETH}`)
  console.log('------')

  // deploy USDX token (initial supply is minted to sender)
  console.log('Deploying USDX token...')
  const token = await deployToken()
  console.log(`USDX token deployed at ${token.address}`)
  await logBalance(sender, [token])
  
  // create pair and add liquidity
  // if a pool for the passed token and WETH does not exists, one is created automatically, 
  // and exactly amountTokenDesired/msg.value tokens are added
  console.log('Creating pair with liquidity...')
  const amountTokenDesired = ethers.utils.parseUnits('500', 18)
  const amountETHDesired = ethers.utils.parseEther('10')
  const amountTokenMin = amountTokenDesired
  const amountETHMin = amountETHDesired
  const blockNumber = await ethers.provider.getBlockNumber()
  const deadline = (await ethers.provider.getBlock(blockNumber)).timestamp + (60 * 60)
  let params = { value: amountETHDesired }
  await token.approve(router.address, amountTokenDesired) // approve token transfer first
  await router.addLiquidityETH(token.address, amountTokenDesired, amountTokenMin, amountETHMin, sender, deadline, params)
  console.log('Pair with liquidity created')

  // get LP token balance
  const pairAddress = await factory.getPair(WETH, token.address)
  const pair = await ethers.getContractAt('ERC20', pairAddress) // get as LP token only
  await logBalance(sender, [token, pair])
  

  // swap
  const amountInETH = ethers.utils.parseEther('1')
  console.log(`Swapping ${ethers.utils.formatEther(amountInETH)} ETH ...`)
  await router.swapExactETHForTokens('0', [WETH, token.address], sender, deadline, { value: amountInETH })
  console.log('Swap succeeded')
  await logBalance(sender, [token, pair])
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
//     case 'bscTestnet':
//       return dexs.pancakeswapTestnet
//     case 'polygon':
//       return dexs.quickswap
//     case 'heco':
//       return dexs.mdex
//     default:
//       throw new Error(`No DEX for ${network} network`)
//   }
// }