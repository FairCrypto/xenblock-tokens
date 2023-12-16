import { ethers, network, upgrades } from "hardhat";
import type { Contract } from "ethers";
import { config } from "../hardhat.config";

require("dotenv").config();

const VOTE_MANAGER_ADDRESS = process.env.VOTE_MANAGER_ADDRESS;
const TOKEN_REGISTRY_ADDRESS  = process.env.TOKEN_REGISTRY_ADDRESS;

export async function main(voteManagerAddress: string, tokenRegistryAddress: string): Promise<Contract> {
  const [deployerAccount] = await ethers.getSigners();

  const Xenium = await ethers.getContractFactory("Xenium");
  const xenium = await upgrades.deployProxy(Xenium, [
    deployerAccount.address,
    voteManagerAddress,
    tokenRegistryAddress
  ]);
  await xenium.waitForDeployment();
  const xeniumAddress = await xenium.getAddress();
  console.log("Xenium deployed to:", xeniumAddress);

  return xenium;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main(VOTE_MANAGER_ADDRESS, TOKEN_REGISTRY_ADDRESS).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
