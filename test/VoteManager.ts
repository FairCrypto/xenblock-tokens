import assert from "assert";

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { randomBytes } from "crypto";
import { DeployedContracts, deployTokenFixture } from "./_fixtures";
import { ethers, upgrades } from "hardhat";
import { VoteManager } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("VoteManager", function () {
  it("should deploy", async () => {
    const { voteManager, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);

    expect(await voteManager.owner()).to.equal(owner.address);
    expect(await voteManager.sfc()).to.not.be.null;
    expect(await voteManager.blockStorage()).to.not.be.null;
  });

  it("should update block storage address", async () => {
    const { voteManager, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);

    const blockStorage = await ethers.deployContract("MockedBlockStorage", [1, 100_000, 20]);
    await blockStorage.waitForDeployment();

    const addr = await blockStorage.getAddress();
    await voteManager.updateBlockStorageAddress(addr);
    expect(await voteManager.blockStorage()).to.equal(addr);
  });

  it("should not update block storage address with non-owner account", async () => {
    const { voteManager, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);

    const blockStorage = await ethers.deployContract("MockedBlockStorage", [1, 100_000, 20]);
    await blockStorage.waitForDeployment();

    const addr = await blockStorage.getAddress();
    await expect(voteManager.connect(nonValidator1).updateBlockStorageAddress(addr)).to.revertedWithCustomError(voteManager, "OwnableUnauthorizedAccount");
  });

  it("should update sfc address", async () => {
    const { voteManager, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);

    const sfc = await ethers.deployContract("MockedSFC");
    await sfc.waitForDeployment();

    const addr = await sfc.getAddress();
    await voteManager.updateSfcAddress(addr);
    expect(await voteManager.sfc()).to.equal(addr);
  });

  it("should not update sfc address with non-owner account", async () => {
    const { voteManager, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);

    const sfc = await ethers.deployContract("MockedSFC");
    await sfc.waitForDeployment();

    const addr = await sfc.getAddress();
    await expect(voteManager.connect(nonValidator1).updateSfcAddress(addr)).to.revertedWithCustomError(voteManager, "OwnableUnauthorizedAccount");
  });

  it("should update token registry address", async () => {
    const { voteManager, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);

    const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
    const tokenRegistry = await upgrades.deployProxy(TokenRegistry, [owner.address]);
    await tokenRegistry.waitForDeployment();

    const addr = await tokenRegistry.getAddress();
    await voteManager.updateSfcAddress(addr);
    expect(await voteManager.sfc()).to.equal(addr);
  });

  it("should not update token registry address with non-owner", async () => {
    const { voteManager, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);

    const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
    const tokenRegistry = await upgrades.deployProxy(TokenRegistry, [owner.address]);
    await tokenRegistry.waitForDeployment();

    const addr = await tokenRegistry.getAddress();
    await expect(voteManager.connect(nonValidator1).updateTokenRegistryAddress(addr)).to.revertedWithCustomError(voteManager, "OwnableUnauthorizedAccount");
  });

  it("should update the percentage of validators required to vote", async () => {
    const { sfcLib, voteManager, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);

    await voteManager.updateVotePercentage(50);
    expect(await voteManager.votePercentage()).to.equal(50);
    expect(await voteManager.requiredNumOfValidators()).to.equal(1);

    await voteManager.updateVotePercentage(100);
    expect(await voteManager.votePercentage()).to.equal(100);
    expect(await voteManager.requiredNumOfValidators()).to.equal(3);

    // add more validators
    const [validator4, validator5, validator6, validator7, validator8]: HardhatEthersSigner[] = await ethers.getSigners();
    await sfcLib.addValidatorID(validator4, 4);
    await sfcLib.addValidatorID(validator5, 5);
    await sfcLib.addValidatorID(validator6, 6);
    await sfcLib.addValidatorID(validator7, 7);
    await sfcLib.addValidatorID(validator8, 8);

    expect(await voteManager.requiredNumOfValidators()).to.equal(8);
    expect(await voteManager.requiredNumOfVotes()).to.equal(8);

    await voteManager.updateVotePercentage(67);
    expect(await voteManager.requiredNumOfValidators()).to.equal(6);
    expect(await voteManager.requiredNumOfVotes()).to.equal(5);

    await voteManager.updateVoteBufferPercentage(50);
    expect(await voteManager.requiredNumOfValidators()).to.equal(7);
    expect(await voteManager.requiredNumOfVotes()).to.equal(5);

    await voteManager.updateVoteBufferPercentage(80);
    expect(await voteManager.requiredNumOfValidators()).to.equal(8);
    expect(await voteManager.requiredNumOfVotes()).to.equal(5);

    await voteManager.updateVotePercentage(1);
    expect(await voteManager.requiredNumOfValidators()).to.equal(1);
    expect(await voteManager.requiredNumOfVotes()).to.equal(1);
  });

  it("should not allow update vote percentage under 1 or over 100", async () => {
    const { voteManager, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(voteManager.updateVotePercentage(0)).to.revertedWith("Percentage must be between 1 and 100.");
    await expect(voteManager.updateVotePercentage(101)).to.revertedWith("Percentage must be between 1 and 100.");
  });

  it("should not allow non owner to update vote percentage", async () => {
    const { voteManager, owner, validator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(voteManager.connect(validator1).updateVotePercentage(50)).to.revertedWithCustomError(voteManager, "OwnableUnauthorizedAccount");
  });

  it("Should not allow non validator to vote", async () => {
    const { voteManager, blockStorage, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(voteManager.connect(nonValidator1).voteBatch([])).to.be.revertedWithCustomError(voteManager, "NotAValidator");
  });

  it("shouldVote should return true for validators", async () => {
    const { voteManager, blockStorage, validator1, validator2, validator3, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await voteManager.shouldVote(1, 1, 1)).to.be.true;
    expect(await voteManager.shouldVote(1, 2, 1)).to.be.true;
    expect(await voteManager.shouldVote(1, 3, 1)).to.be.true;
  });

  it("shouldVote should return false for non-validators", async () => {
    const { voteManager, blockStorage, validator1, validator2, validator3, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await voteManager.shouldVote(1, 5, 1)).to.be.false;
  });

  it("should allow validator to batch vote", async () => {
    const { voteManager, blockStorage, xenium, xuni, superBlock, validator1, validator2, validator3, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));

    const votes: VoteManager.VotePayloadStruct[] = [
      {
        hashId: 1,
        currencyType: 1,
        mintedBlockNumber: 1,
        version: 1,
      },
      {
        hashId: 2,
        currencyType: 1,
        mintedBlockNumber: 1,
        version: 1,
      },
      {
        hashId: 3,
        currencyType: 1,
        mintedBlockNumber: 1,
        version: 1,
      },
      {
        hashId: 4,
        currencyType: 2,
        mintedBlockNumber: 1,
        version: 1,
      },
      {
        hashId: 5,
        currencyType: 3,
        mintedBlockNumber: 1,
        version: 1,
      },
    ];

    await voteManager.connect(validator1).voteBatch(votes);
    const tx = await voteManager.connect(validator2).voteBatch(votes);

    expect(tx).to.emit(voteManager, "MintToken").withArgs(1, 1);
    expect(tx).to.emit(voteManager, "MintToken").withArgs(2, 1);
    expect(tx).to.emit(voteManager, "MintToken").withArgs(3, 1);
    expect(tx).to.emit(voteManager, "MintToken").withArgs(4, 2);
    expect(tx).to.emit(voteManager, "MintToken").withArgs(5, 3);

    expect(await voteManager.mintedByHashIdAndCurrencyType(1, 1)).to.be.true;
    expect(await voteManager.mintedByHashIdAndCurrencyType(2, 1)).to.be.true;
    expect(await voteManager.mintedByHashIdAndCurrencyType(3, 1)).to.be.true;
    expect(await voteManager.mintedByHashIdAndCurrencyType(4, 2)).to.be.true;
    expect(await voteManager.mintedByHashIdAndCurrencyType(5, 3)).to.be.true;

    expect(await xenium.balanceOf(nonValidator1.address)).to.equal(ethers.parseEther("30"));
    expect(await superBlock.balanceOf(nonValidator1.address)).to.equal(ethers.parseEther("10"));
    expect(await xuni.balanceOf(nonValidator1.address)).to.equal(ethers.parseEther("1"));
  });

  it("should allow validator to batch vote ignoring already minted", async () => {
    const { voteManager, blockStorage, xenium, xuni, superBlock, validator1, validator2, validator3, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));

    const votes: VoteManager.VotePayloadStruct[] = [
      {
        hashId: 1,
        currencyType: 1,
        mintedBlockNumber: 1,
        version: 1,
      },
      {
        hashId: 2,
        currencyType: 1,
        mintedBlockNumber: 1,
        version: 1,
      },
      {
        hashId: 3,
        currencyType: 1,
        mintedBlockNumber: 1,
        version: 1,
      },
      {
        hashId: 4,
        currencyType: 2,
        mintedBlockNumber: 1,
        version: 1,
      },
      {
        hashId: 5,
        currencyType: 3,
        mintedBlockNumber: 1,
        version: 1,
      },
    ];

    await voteManager.connect(validator1).voteBatch(votes);

    // vote again. these should be ignored
    await voteManager.connect(validator1).voteBatch(votes);

    await voteManager.connect(validator2).voteBatch(votes);

    // vote again after minted. these should be ignored
    await voteManager.connect(validator1).voteBatch(votes);
    await voteManager.connect(validator2).voteBatch(votes);

    expect(await xenium.balanceOf(nonValidator1.address)).to.equal(ethers.parseEther("30"));
    expect(await superBlock.balanceOf(nonValidator1.address)).to.equal(ethers.parseEther("10"));
    expect(await xuni.balanceOf(nonValidator1.address)).to.equal(ethers.parseEther("1"));
  });

  it("vote should fail if version mismatch", async () => {
    const { voteManager, blockStorage, xenium, xuni, superBlock, validator1, validator2, validator3, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));

    const votes: VoteManager.VotePayloadStruct[] = [
      {
        hashId: 1,
        currencyType: 1,
        mintedBlockNumber: 1,
        version: 2,
      },
    ];

    await expect(voteManager.connect(validator1).voteBatch(votes)).to.be.revertedWithCustomError(voteManager, "VersionMismatch");
  });

  it("should batch vote 100 hashes", async () => {
    const { voteManager, blockStorage, validator1, validator2, validator3, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);

    const votes: VoteManager.VotePayloadStruct[] = [];
    for (let i = 0; i < 100; i++) {
      await blockStorage.storeNewRecordData(nonValidator1.address, 1, 1, 1, 1, randomBytes(32), randomBytes(34));
      votes.push({
        hashId: i + 1,
        currencyType: 1,
        mintedBlockNumber: 1,
        version: 1,
      });
    }

    await voteManager.connect(validator1).voteBatch(votes);
    await voteManager.connect(validator2).voteBatch(votes);

    for (let i = 0; i < 100; i++) {
      expect(await voteManager.mintedByHashIdAndCurrencyType(i + 1, 1)).to.be.true;
    }
  });
});
