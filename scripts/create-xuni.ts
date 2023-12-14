import { ethers, network, upgrades } from "hardhat";
import { config } from "../hardhat.config";

require("dotenv").config();

const VOTE_MANAGER_ADDRESS = process.env.VOTE_MANAGER_ADDRESS;

export async function main(voteManagerAddress: string): Promise<Contract> {
  const [deployerAccount] = await ethers.getSigners();

  const Xuni = await ethers.getContractFactory("Xuni");
  const xuni = await upgrades.deployProxy(Xuni, [
    deployerAccount.address,
    voteManagerAddress,
  ]);
  await xuni.waitForDeployment();
  const xuniAddress = await xuni.getAddress();
  console.log("Xuni deployed to:", xuniAddress);

  if (config.etherscan.apiKey[network.name]) {
    await hre.run("verify:verify", {
      address: xuniAddress,
    });
  }

  return xuni;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(VOTE_MANAGER_ADDRESS).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
