import { ethers, network, upgrades } from "hardhat";

require("dotenv").config();

const TOKEN_REGISTRY_ADDRESS = process.env.TOKEN_REGISTRY_ADDRESS || "";

async function main() {
  const [deployerAccount] = await ethers.getSigners();

  const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
  const tokenRegistry = await upgrades.upgradeProxy(
    TOKEN_REGISTRY_ADDRESS,
    TokenRegistry,
  );
  await tokenRegistry.waitForDeployment();
  const tokenRegistryAddress = await tokenRegistry.getAddress();

  console.log("TokenRegistry deployed to:", tokenRegistryAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
