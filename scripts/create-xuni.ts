import { ethers, network, upgrades } from "hardhat";
import { config } from "../hardhat.config";
import { Contract } from "ethers";

require("dotenv").config();

const VOTE_MANAGER_ADDRESS = process.env.VOTE_MANAGER_ADDRESS;
const TOKEN_REGISTRY_ADDRESS  = process.env.TOKEN_REGISTRY_ADDRESS;

export async function main(voteManagerAddress: string, tokenRegistryAddress: string): Promise<Contract> {
  const [deployerAccount] = await ethers.getSigners();

  const Xuni = await ethers.getContractFactory("Xuni");
  const xuni = await upgrades.deployProxy(Xuni, [
    deployerAccount.address,
    voteManagerAddress,
    tokenRegistryAddress
  ]);
  await xuni.waitForDeployment();
  const xuniAddress = await xuni.getAddress();
  console.log("Xuni deployed to:", xuniAddress);

  return xuni;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main(VOTE_MANAGER_ADDRESS, TOKEN_REGISTRY_ADDRESS).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
