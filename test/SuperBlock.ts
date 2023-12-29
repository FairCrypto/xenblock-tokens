import assert from "assert";

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { randomBytes } from "crypto";
import { DeployedContracts, deployTokenFixture } from "./_fixtures";

describe("SuperBlock", function () {
  it("should deploy", async () => {
    const { superBlock, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await superBlock.owner()).to.equal(owner.address);
    expect(await superBlock.name()).to.equal("SuperBlock");
    expect(await superBlock.symbol()).to.equal("XBLK");
  });

  it("Should validate tokens", async () => {
    const { superBlock, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await superBlock.validateArgon2Hash(`aaaaaXEN11aaaaaJKLIRWONFVXSMYXJHDGZKQCUEAPBFCQWEDRXTLMVBNOIHGF`, 0)).deep.equal([true, 1n]);
  });

  it("Should not validate tokens", async () => {
    const { superBlock, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await superBlock.validateArgon2Hash("aaaaaXEN1aaaaaJKLIRWONFVXSMYXJHDGZKQCUEAPBFCQWEDRXTLMVBNOIHG", 0)).deep.equal([false, 1n]);
    expect(await superBlock.validateArgon2Hash("aaaaaXEN01aaaaaJKLIRWONFVXSMYXJHDGZKQCUEAPBFCQWEDRXTLMVBNOIHG", 0)).deep.equal([false, 1n]);
    expect(await superBlock.validateArgon2Hash("aaaaaXEn11aaaaaJKLIRWONFVXSMYXJHDGZKQCUEAPBFCQWEDRXTLMVBNOIHG", 0)).deep.equal([false, 1n]);
    expect(await superBlock.validateArgon2Hash(`aaaaaXEN11aaaaaJKLIRWONFVXSMYXJHDGZKQCUEAPBFCQWEDRXTLMVBNOI`, 0)).deep.equal([false, 1n]);
  });

  it("Should not allow non-VoteManager to mint", async () => {
    const { superBlock, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(superBlock.mint(nonValidator1, 1)).to.be.revertedWith("Only vote manager can call this function.");
  });
});
