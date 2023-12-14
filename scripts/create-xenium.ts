import { ethers, network, upgrades } from "hardhat";
import type { Contract } from "ethers";
import { config } from "../hardhat.config";

require("dotenv").config();

const VOTE_MANAGER_ADDRESS = process.env.VOTE_MANAGER_ADDRESS;

export async function main(voteManagerAddress: string): Promise<Contract> {
  const [deployerAccount] = await ethers.getSigners();

  const Xenium = await ethers.getContractFactory("Xenium");
  const xenium = await upgrades.deployProxy(Xenium, [
    deployerAccount.address,
    voteManagerAddress,
  ]);
  await xenium.waitForDeployment();
  const xeniumAddress = await xenium.getAddress();
  console.log("Xenium deployed to:", xeniumAddress);

  if (config.etherscan.apiKey[network.name]) {
    await hre.run("verify:verify", {
      address: xeniumAddress,
    });
  }

  return xenium;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(VOTE_MANAGER_ADDRESS).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
