import { ethers, network, upgrades } from "hardhat";
import type { Contract } from "ethers";
import { config } from "../hardhat.config";

require("dotenv").config();

const VOTE_MANAGER_ADDRESS = process.env.VOTE_MANAGER_ADDRESS || "";
const TOKEN_REGISTRY_ADDRESS  = process.env.TOKEN_REGISTRY_ADDRESS || "";

export async function main(voteManagerAddress: string, tokenRegistryAddress: string): Promise<Contract> {
  const [deployerAccount] = await ethers.getSigners();

  const SuperBlock = await ethers.getContractFactory("SuperBlock");
  const superBlock = await upgrades.deployProxy(SuperBlock, [
    deployerAccount.address,
    voteManagerAddress,
    tokenRegistryAddress
  ]);
  await superBlock.waitForDeployment();
  const superBlockAddress = await superBlock.getAddress();
  console.log("SuperBlock deployed to:", superBlockAddress);

  return superBlock;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main(VOTE_MANAGER_ADDRESS, TOKEN_REGISTRY_ADDRESS).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
