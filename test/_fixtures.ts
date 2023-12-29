import { ethers, upgrades } from "hardhat";
import { MockedBlockStorage, MockedSFC, SuperBlock, TokenRegistry, VoteManager, Xenium, Xuni } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

export interface DeployedContracts {
  sfcLib: MockedSFC;
  blockStorage: MockedBlockStorage;
  voteManager: VoteManager;
  tokenRegistry: TokenRegistry;
  xenium: Xenium;
  xuni: Xuni;
  superBlock: SuperBlock;
  owner: HardhatEthersSigner;
  validator1: HardhatEthersSigner;
  validator2: HardhatEthersSigner;
  validator3: HardhatEthersSigner;
  nonValidator1: HardhatEthersSigner;
}

export async function deployTokenFixture(): Promise<DeployedContracts> {
  const [owner, validator1, validator2, validator3, nonValidator1]: HardhatEthersSigner[] = await ethers.getSigners();

  // TODO: use npm package once available
  const blockStorage = (await ethers.deployContract("MockedBlockStorage", [1, 100_000, 20])) as unknown as MockedBlockStorage;
  await blockStorage.waitForDeployment();

  const sfcLib = (await ethers.deployContract("MockedSFC")) as unknown as MockedSFC;
  await sfcLib.waitForDeployment();
  await sfcLib.updateCurrentSealedEpoch(1);
  await sfcLib.addValidatorID(validator1.address, 1);
  await sfcLib.addValidatorID(validator2.address, 2);
  await sfcLib.addValidatorID(validator3.address, 3);

  const VoteManager = await ethers.getContractFactory("VoteManager");
  const voteManager = (await upgrades.deployProxy(VoteManager, [owner.address, await sfcLib.getAddress(), await blockStorage.getAddress(), 67, 20])) as unknown as VoteManager;

  await voteManager.waitForDeployment();
  const vmAddr = await voteManager.getAddress();

  const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
  const tokenRegistry = (await upgrades.deployProxy(TokenRegistry, [owner.address])) as unknown as TokenRegistry;

  await tokenRegistry.waitForDeployment();
  const trAddr = await tokenRegistry.getAddress();

  const Xenium = await ethers.getContractFactory("Xenium");
  const xenium = (await upgrades.deployProxy(Xenium, [owner.address, vmAddr, trAddr])) as unknown as Xenium;
  await xenium.waitForDeployment();
  await tokenRegistry.registerToken(await xenium.getAddress(), false);

  const Xuni = await ethers.getContractFactory("Xuni");
  const xuni = (await upgrades.deployProxy(Xuni, [owner.address, vmAddr, trAddr])) as unknown as Xuni;
  await xuni.waitForDeployment();
  await tokenRegistry.registerToken(await xuni.getAddress(), true);

  const SuperBlock = await ethers.getContractFactory("SuperBlock");
  const superBlock = (await upgrades.deployProxy(SuperBlock, [owner.address, vmAddr, trAddr])) as unknown as SuperBlock;
  await superBlock.waitForDeployment();
  await tokenRegistry.registerToken(await superBlock.getAddress(), false);

  await voteManager.updateTokenRegistryAddress(trAddr);
  return {
    sfcLib,
    blockStorage,
    voteManager,
    tokenRegistry,
    xenium,
    xuni,
    superBlock,
    owner,
    validator1,
    validator2,
    validator3,
    nonValidator1,
  };
}
