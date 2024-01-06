import { ethers, network, upgrades } from "hardhat";
import { config } from "../hardhat.config";

require("dotenv").config();

const XUNI_ADDRESS = process.env.XUNI_ADDRESS || "";

async function main() {
  const [deployerAccount] = await ethers.getSigners();

  const Xuni = await ethers.getContractFactory("Xuni");
  const xuni = await upgrades.upgradeProxy(XUNI_ADDRESS, Xuni, {
    call: "incrementVersion",
  });
  await xuni.waitForDeployment();
  const xuniAddress = await xuni.getAddress();
  console.log("Xuni deployed to:", xuniAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
