import { ethers, network, upgrades } from "hardhat";
import { config } from "../hardhat.config";

require("dotenv").config();

const VOTE_MANAGER_ADDRESS = process.env.VOTE_MANAGER_ADDRESS;

async function main() {
  const [deployerAccount] = await ethers.getSigners();

  const VoteManager = await ethers.getContractFactory("VoteManager");
  const voteManager = await upgrades.upgradeProxy(
    VOTE_MANAGER_ADDRESS,
    VoteManager,
  );
  await voteManager.waitForDeployment();
  const voteManagerAddress = await voteManager.getAddress();
  console.log("VoteManager deployed to:", voteManagerAddress);

  if (config.etherscan.apiKey[network.name]) {
    await hre.run("verify:verify", {
      address: voteManagerAddress,
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
