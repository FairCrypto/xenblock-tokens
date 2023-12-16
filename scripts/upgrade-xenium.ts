import { ethers, network, upgrades } from "hardhat";
import { config } from "../hardhat.config";

require("dotenv").config();

const XENIUM_ADDRESS = process.env.XENIUM_ADDRESS;

async function main() {
  const [deployerAccount] = await ethers.getSigners();

  const Xenium = await ethers.getContractFactory("Xenium");
  const xenium = await upgrades.upgradeProxy(XENIUM_ADDRESS, Xenium);
  await xenium.waitForDeployment();
  const xeniumAddress = await xenium.getAddress();
  console.log("Xenium deployed to:", xeniumAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
