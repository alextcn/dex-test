import { BigNumber, Contract } from "ethers"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import abi from "../abi.json"
import dexs from "../dexs.json"
import { logBalance } from "./utils"


const USDX_SUPPLY = BigNumber.from(1000).mul(BigNumber.from(10).pow(18))

// select DEX for network
function dexByNetwork(network: string) {
  switch(network) {
    case 'ethereum':
    case 'ropsten':
      return dexs.uniswap
    case 'bsc':
      return dexs.pancakeswap
    case 'bscTestnet':
      return dexs.pancakeswapTestnet
    case 'polygon':
      return dexs.quickswap
    case 'heco':
      return dexs.mdex
    default:
      throw new Error(`No DEX for ${network} network`)
  }
}

// deploys new ERC20 token and returns it's address
async function deployToken(ethers: any): Promise<Contract> {
  const f = await ethers.getContractFactory('USDXToken')
  const token = await f.deploy(USDX_SUPPLY)
  await token.deployed()
  return token
}

// 1. Deploys new USDX token, mints tokens to sender
// 2. Creates new USDX/WETH pair on UniswapV2-like DEX
// 3. Adds liquidity to USDX/WETH pair
// 4. Swaps ETH for USDX on USDX/WETH pair
export async function testDEX(hre: HardhatRuntimeEnvironment, network: string) {
  const ethers = hre.ethers

  const sender = await ethers.provider.getSigner().getAddress()
  const DEX = dexByNetwork(network)

  const router = await ethers.getContractAt(abi.uniRouter, DEX.router)
  const factory = await ethers.getContractAt(abi.uniFactory, DEX.factory)
  
  let WETH: string
  if (network === 'heco') {
    // not actually a WETH
    WETH = await router.WHT() as string
  } else {
    WETH = await router.WETH() as string
  }
  console.log(`sender: ${sender}`)
  console.log(`WETH: ${WETH}`)
  console.log('------')

  // deploy USDX token (initial supply is minted to sender)
  console.log('Deploying USDX token...')
  const token = await deployToken(ethers)
  console.log(`USDX token deployed at ${token.address}`)
  await logBalance(ethers.provider, sender, [token])
  
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
  await logBalance(ethers.provider, sender, [token, pair])
  

  // swap
  const amountInETH = ethers.utils.parseEther('1')
  console.log(`Swapping ${ethers.utils.formatEther(amountInETH)} ETH ...`)
  await router.swapExactETHForTokens('0', [WETH, token.address], sender, deadline, { value: amountInETH })
  console.log('Swap succeeded')
  await logBalance(ethers.provider, sender, [token, pair])
}

