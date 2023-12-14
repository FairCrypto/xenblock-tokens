import { ethers, network, upgrades } from "hardhat";
import type { Contract } from "ethers";
import { config } from "../hardhat.config";

require("dotenv").config();

const XENIUM_ADDRESS = process.env.XENIUM_ADDRESS;
const XUNI_ADDRESS = process.env.XUNI_ADDRESS;
const SUPER_BLOCK_ADDRESS = process.env.SUPER_BLOCK_ADDRESS;

export async function main(
  xeniumAddress: string,
  xuniAddress: string,
  superBlockAddress: string,
): Promise<Contract> {
  const [deployerAccount] = await ethers.getSigners();

  const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
  const tokenRegistry = await upgrades.deployProxy(TokenRegistry, [
    deployerAccount.address,
  ]);
  await tokenRegistry.waitForDeployment();
  const tokenRegistryAddress = await tokenRegistry.getAddress();
  console.log("TokenRegistry deployed to:", tokenRegistryAddress);

  if (config.etherscan.apiKey[network.name]) {
    await hre.run("verify:verify", {
      address: tokenRegistryAddress,
    });
  }

  return tokenRegistry;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(XENIUM_ADDRESS, XUNI_ADDRESS, SUPER_BLOCK_ADDRESS).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
