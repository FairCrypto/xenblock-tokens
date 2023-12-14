import { ethers, network, upgrades } from "hardhat";
import type { Contract } from "ethers";
import { config } from "../hardhat.config";

require("dotenv").config();

const VOTE_MANAGER_ADDRESS = process.env.VOTE_MANAGER_ADDRESS;

export async function main(voteManagerAddress: string): Promise<Contract> {
  const [deployerAccount] = await ethers.getSigners();

  const SuperBlock = await ethers.getContractFactory("SuperBlock");
  const superBlock = await upgrades.deployProxy(SuperBlock, [
    deployerAccount.address,
    voteManagerAddress,
  ]);
  await superBlock.waitForDeployment();
  const superBlockAddress = await superBlock.getAddress();
  console.log("SuperBlock deployed to:", superBlockAddress);

  if (config.etherscan.apiKey[network.name]) {
    await hre.run("verify:verify", {
      address: superBlockAddress,
    });
  }

  return superBlock;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(VOTE_MANAGER_ADDRESS).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
