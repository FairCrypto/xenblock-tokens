import { ethers, network, upgrades } from "hardhat";
import { config } from "../hardhat.config";

require("dotenv").config();

const SUPER_BLOCK_ADDRESS = process.env.SUPER_BLOCK_ADDRESS || "";

async function main() {
  const [deployerAccount] = await ethers.getSigners();

  const SuperBlock = await ethers.getContractFactory("SuperBlock");
  const superBlock = await upgrades.upgradeProxy(
    SUPER_BLOCK_ADDRESS,
    SuperBlock,
    {
      call: "incrementVersion",
    },
  );
  await superBlock.waitForDeployment();
  const superBlockAddress = await superBlock.getAddress();
  console.log("SuperBlock deployed to:", superBlockAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
