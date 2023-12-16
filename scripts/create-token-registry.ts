import { ethers, network, upgrades } from "hardhat";
import type { Contract } from "ethers";
import { config } from "../hardhat.config";

require("dotenv").config();

export async function main(): Promise<Contract> {
  const [deployerAccount] = await ethers.getSigners();

  const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
  const tokenRegistry = await upgrades.deployProxy(TokenRegistry, [
    deployerAccount.address,
  ]);
  await tokenRegistry.waitForDeployment();
  const tokenRegistryAddress = await tokenRegistry.getAddress();
  console.log("TokenRegistry deployed to:", tokenRegistryAddress);

  return tokenRegistry;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
