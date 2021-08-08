import { Contract, utils, providers } from "ethers"

export async function logBalance(provider: providers.JsonRpcProvider, address: string, tokens: Contract[]) {
    console.log(`balance:`)
    console.log(`- ${utils.formatEther(await provider.getBalance(address))} WETH`)
    for (const token of tokens) {
      console.log(`- ${utils.formatUnits(await token.balanceOf(address), await token.decimals())} ${await token.symbol()}`)
    }
}