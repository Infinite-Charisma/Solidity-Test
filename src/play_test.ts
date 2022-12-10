import { Signer } from "ethers"
import { ethers } from "hardhat"
import { TestToken } from "../typechain-types"

async function main() {
    let account0: Signer, account1: Signer
    [account0, account1] = await ethers.getSigners()
    const address0 = await account0.getAddress()
    const address1 = await account1.getAddress()

    const Token = await ethers.getContractFactory("TestToken")
    const token: TestToken = await Token.deploy()
    await token.deployed()
    const contractAddress = token.address

    console.log("TestToken Contract Address: ", contractAddress)

    const mintFee = await token.getMintFee(6)
    await token.mintToken(6, { value: mintFee })
    console.log("==Minted 6 NFTs by A==")

    const price = ethers.utils.parseUnits('100', 'ether');
    await token.allowBuy(2, price)
    await token.allowBuy(3, price)
    console.log("==A allow Test#2 and Test#3 NFTs to be purchased==")

    await token.connect(account1).buy(2, { value: price })
    await token.connect(account1).buy(3, { value: price })
    console.log("==B purchased Test#2 and Test#3 NFTs==")

    // await token.disallowBuy(4)
    // console.log("==A disallow Test#4 NFT to be purchased==")

    // await token.connect(account1).buy(4, { value: price })

    console.log("The number of NFT A has: ", (await token.balanceOf(address0)).toNumber())
    console.log("The number of NFT B has: ", (await token.balanceOf(address1)).toNumber())
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})