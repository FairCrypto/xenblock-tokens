import assert from "assert";

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { DeployedContracts, deployTokenFixture } from "./_fixtures";
import { ethers } from "hardhat";
import { VoterToken } from "../typechain-types";

describe("TokenRegistry", function () {
  it("should deploy", async () => {
    const { tokenRegistry, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await tokenRegistry.owner()).to.equal(owner.address);
  });

  it("Should not allow non-owner to add token", async () => {
    const { tokenRegistry, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(tokenRegistry.connect(nonValidator1).registerToken("0xc0ffee254729296a45a3885639AC7E10F9d54979", true)).to.be.revertedWithCustomError(tokenRegistry, "OwnableUnauthorizedAccount");
  });

  it("Should not allow non-owner to update token", async () => {
    const { tokenRegistry, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(tokenRegistry.connect(nonValidator1).updateToken(1, "0xc0ffee254729296a45a3885639AC7E10F9d54979", true)).to.be.revertedWithCustomError(tokenRegistry, "OwnableUnauthorizedAccount");
  });

  it("Should not allow updating token id 0", async () => {
    const { tokenRegistry, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(tokenRegistry.updateToken(0, "0xc0ffee254729296a45a3885639AC7E10F9d54979", true)).to.be.revertedWith("Invalid token id");
  });

  it("Should not allow updating token id greater than 3", async () => {
    const { tokenRegistry, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(tokenRegistry.updateToken(4, "0xc0ffee254729296a45a3885639AC7E10F9d54979", true)).to.be.revertedWith("Invalid token id");
  });

  it("Should not allow non-owner to update vote manager address", async () => {
    const { tokenRegistry, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(tokenRegistry.connect(nonValidator1).updateVoteManagerAddress("0xc0ffee254729296a45a3885639AC7E10F9d54979")).to.be.revertedWithCustomError(
      tokenRegistry,
      "OwnableUnauthorizedAccount",
    );
  });

  it("should update vote manager address", async () => {
    const { voteManager, owner, tokenRegistry } = await loadFixture<DeployedContracts>(deployTokenFixture);

    const vm = await ethers.deployContract("VoteManager");
    await vm.waitForDeployment();

    const addr = await vm.getAddress();
    await tokenRegistry.updateVoteManagerAddress(addr);
    for (let i = 1; i <= 3; i++) {
      const tokenAddr = await tokenRegistry.getToken(i);
      const VT = await ethers.getContractFactory("Xenium");
      const vt = VT.attach(tokenAddr) as unknown as VoterToken;
      expect(await vt.voteManagerAddress()).to.equal(addr);
    }
  });

  it("should get token configs", async () => {
    const { tokenRegistry, xenium, xuni, superBlock} = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await tokenRegistry.getTokenConfigs()).deep.equal([
      [ 1n, await xenium.getAddress(), false ],
      [ 2n, await xuni.getAddress(), true ],
      [ 3n, await superBlock.getAddress(), false ]
    ]);
  });

  it("should update token", async () => {
    const { tokenRegistry, xenium} = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await tokenRegistry.getTokenConfig(1)).deep.equal([ 1n, await xenium.getAddress(), false ]);
    expect(await xenium.version()).to.equal(1);
    await tokenRegistry.updateToken(1, await xenium.getAddress(), true); // make exclusive
    expect(await tokenRegistry.getTokenConfig(1)).deep.equal([ 1n, await xenium.getAddress(), true ]);
    expect(await xenium.version()).to.equal(2);
  })

  it("should get xenium token config", async () => {
    const { tokenRegistry, xenium, xuni, superBlock} = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await tokenRegistry.getTokenConfig(1)).deep.equal([ 1n, await xenium.getAddress(), false ]);
  });

  it("should get xuni token config", async () => {
    const { tokenRegistry, xenium, xuni, superBlock} = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await tokenRegistry.getTokenConfig(2)).deep.equal([ 2n, await xuni.getAddress(), true ]);
  });

  it("should get superblock token config", async () => {
    const { tokenRegistry, xenium, xuni, superBlock} = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await tokenRegistry.getTokenConfig(3)).deep.equal([ 3n, await superBlock.getAddress(), false ]);
  });

  it("should find xenium token", async () => {
    const { tokenRegistry, blockStorage, validator1, validator2, validator3, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await tokenRegistry.findTokensFromArgon2Hash("aaaaaXEN11aaaaa", Date.now())).deep.equal([[1n, 1n]]);
    expect(await tokenRegistry.findTokensFromArgon2Hash("aaaaaaaaaaXEN11", Date.now())).deep.equal([[1n, 1n]]);
    expect(await tokenRegistry.findTokensFromArgon2Hash("XEN11aaaaaaaaaa", Date.now())).deep.equal([[1n, 1n]]);
    expect(await tokenRegistry.findTokensFromArgon2Hash("XEN11aaaaaaaaaaXEN11", Date.now())).deep.equal([[1n, 1n]]);
  });

  it("should find XUNI token", async () => {
    const { tokenRegistry, blockStorage, validator1, validator2, validator3, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await tokenRegistry.findTokensFromArgon2Hash("aaaaaXUNI1aaaaaJKLIRWONFVXSMYXJHDGZKQCUEAPBFCQWEDRXTLMVBNOIHGXEN11", Date.now())).deep.equal([[2n, 1n]]);
  });

  it("should find xenium and superblock token", async () => {
    const { tokenRegistry, blockStorage, validator1, validator2, validator3, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await tokenRegistry.findTokensFromArgon2Hash("aaaaaXEN11aaaaaJKLIRWONFVXSMYXJHDGZKQCUEAPBFCQWEDRXTLMVBNOIHGXEN11", Date.now())).deep.equal([[1n, 1n],[3n, 1n]]);
  });
});
