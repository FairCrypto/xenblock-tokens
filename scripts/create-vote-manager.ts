import { ethers, network, upgrades } from "hardhat";
import type { Contract } from "ethers";
import { config } from "../hardhat.config";

require("dotenv").config();

const BLOCK_STORAGE_ADDRESS = process.env.BLOCK_STORAGE_ADDRESS || "";
const SFC_LIB_ADDRESS = process.env.SFC_LIB_ADDRESS || "";
const PERCENTAGE = process.env.PERCENTAGE || "67";
const BUFFER_PERCENTAGE = process.env.BUFFER_PERCENTAGE || "20";

if (!BLOCK_STORAGE_ADDRESS) {
  throw new Error("BLOCK_STORAGE_ADDRESS is not set");
}

if (!SFC_LIB_ADDRESS) {
  throw new Error("SFC_LIB_ADDRESS is not set");
}

export async function main(
  blockStorageAddress: string,
  sfcLibAddress: string,
  percentage: string,
  bufferPercentage: string,
): Promise<Contract> {
  const [deployerAccount] = await ethers.getSigners();

  const VoteManager = await ethers.getContractFactory("VoteManager");
  const voteManager = await upgrades.deployProxy(VoteManager, [
    deployerAccount.address,
    sfcLibAddress,
    blockStorageAddress,
    percentage,
    bufferPercentage
  ]);
  await voteManager.waitForDeployment();
  const voteManagerAddress = await voteManager.getAddress();
  console.log("VoteManager deployed to:", voteManagerAddress);

  return voteManager;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main(BLOCK_STORAGE_ADDRESS, SFC_LIB_ADDRESS, PERCENTAGE, BUFFER_PERCENTAGE).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
