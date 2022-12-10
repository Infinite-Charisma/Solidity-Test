import { ethers } from "hardhat";

async function main() {
  const TestToken = await ethers.getContractFactory("TestToken")
  console.log("Deploying TestToken smart contract...")
  const token = await TestToken.deploy()

  await token.deployed()
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
