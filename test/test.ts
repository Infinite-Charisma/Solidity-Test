import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, BigNumber } from "ethers";
import { TestToken, TestToken__factory } from "../typechain-types";
import { getAddress } from "ethers/lib/utils";

const web3 = require("web3");

describe("Create and Transfer NFT", function () {
  let token: TestToken;
  let account0: Signer, account1: Signer

  let mintFee: BigNumber

  beforeEach(async function () {
    [account0, account1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("TestToken");
    token = await Token.deploy();
  })

  it("Should toeknId start from 1 and auto increment", async function () {
    const address0 = await account0.getAddress()
    mintFee = await token.getMintFee(1)

    // web3.eth.sendTransaction({ from: address0, to: '0x5fbdb2315678afecb367f032d93f642f64180aa3', value: web3.utils.toWei("1", "ether") })

    await token.mintToken(1, { value: mintFee })
    expect(await token.ownerOf(1)).to.equal(address0)

    await token.mintToken(1, { value: mintFee })
    expect(await token.ownerOf(2)).to.equal(address0)
    expect(await token.balanceOf(address0)).to.equal(2)
  })

  it("Should mint up to 10 NFT per wallet", async function () {
    const address0 = await account0.getAddress()
    mintFee = await token.getMintFee(10)

    await token.mintToken(10, { value: mintFee })
    expect(await token.ownerOf(10)).to.equal(address0)
    expect(await token.balanceOf(address0)).to.equal(10)
  })

  it("Should buy NFT if the seller allow", async function () {
    const address0 = await account0.getAddress()
    const address1 = await account1.getAddress()
    mintFee = await token.getMintFee(1)

    await token.mintToken(1, { value: mintFee })
    const price = ethers.utils.parseUnits('100', 'ether');
    await token.allowBuy(1, price)
    await token.connect(account1).buy(1, { value: web3.utils.toWei("100", "ether") })

    expect(await token.ownerOf(1)).to.equal(address1)
    expect(await token.balanceOf(address1)).to.equal(1)
  })

  it("Should not buy NFT if te seller doesn't allow", async function () {
    const address0 = await account0.getAddress()
    const address1 = await account1.getAddress()
    mintFee = await token.getMintFee(1)

    await token.mintToken(1, { value: mintFee })
    await token.disallowBuy(1);

    await expect(token.connect(account1).buy(1, { value: web3.utils.toWei("100", "ether") })).to.be.reverted
  })
});
