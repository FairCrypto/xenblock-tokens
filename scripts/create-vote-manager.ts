import { ethers, network, upgrades } from "hardhat";
import type { Contract } from "ethers";
import { config } from "../hardhat.config";

require("dotenv").config();

const BLOCK_STORAGE_ADDRESS = process.env.BLOCK_STORAGE_ADDRESS;
const SFC_LIB_ADDRESS = process.env.SFC_LIB_ADDRESS;
const PERCENTAGE = process.env.PERCENTAGE;

export async function main(
  blockStorageAddress: string,
  sfcLibAddress: string,
  percentage: string,
): Promise<Contract> {
  const [deployerAccount] = await ethers.getSigners();

  const VoteManager = await ethers.getContractFactory("VoteManager");
  const voteManager = await upgrades.deployProxy(VoteManager, [
    deployerAccount.address,
    sfcLibAddress,
    blockStorageAddress,
    percentage,
  ]);
  await voteManager.waitForDeployment();
  const voteManagerAddress = await voteManager.getAddress();
  console.log("VoteManager deployed to:", voteManagerAddress);

  if (config.etherscan.apiKey[network.name]) {
    await hre.run("verify:verify", {
      address: voteManagerAddress,
    });
  }

  return voteManager;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(BLOCK_STORAGE_ADDRESS, SFC_LIB_ADDRESS, PERCENTAGE).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
