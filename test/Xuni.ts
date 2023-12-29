import assert from "assert";

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { randomBytes } from "crypto";
import { DeployedContracts, deployTokenFixture } from "./_fixtures";

describe("Xuni", function () {
  it("should deploy", async () => {
    const { xuni, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await xuni.owner()).to.equal(owner.address);
    expect(await xuni.name()).to.equal("Xuni");
    expect(await xuni.symbol()).to.equal("XUNI");
  });

  it("should not allow non-owner to update enforcement of timestamp check", async () => {
    const { xuni, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(xuni.connect(nonValidator1).updateEnforceTimestampCheck(true)).to.be.revertedWithCustomError(xuni, "OwnableUnauthorizedAccount");
  });

  it("Should validate hashes", async () => {
    const { xuni, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 5; j++) {
        let ts = Math.round(new Date().setUTCMinutes(j, 0, 0) / 1000);
        let ts2 = Math.round(new Date().setUTCMinutes(5 - j, 0, 0) / 1000);

        expect(await xuni.validateArgon2Hash(`aaaaaXUNI${i}sdf34sdfsdfwef`, ts)).deep.equal([true, 1n]);
        expect(await xuni.validateArgon2Hash(`aaaaaXUNI${i}sdf34sdfsdfwef`, ts2)).deep.equal([true, 1n]);
      }
    }
  });

  it("Should validate hashes with timestamp enforcement enabled", async () => {
    const { xuni, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);

    await xuni.updateEnforceTimestampCheck(true);

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 5; j++) {
        let ts = Math.round(new Date().setUTCMinutes(j, 0, 0) / 1000);
        let ts2 = Math.round(new Date().setUTCMinutes(5 - j, 0, 0) / 1000);

        expect(await xuni.validateArgon2Hash(`aaaaaXUNI${i}sdf34sdfsdfwef`, ts)).deep.equal([true, 1n]);
        expect(await xuni.validateArgon2Hash(`aaaaaXUNI${i}sdf34sdfsdfwef`, ts2)).deep.equal([true, 1n]);
      }
    }
  });

  it("Should not validate hashes", async () => {
    const { xuni, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await xuni.validateArgon2Hash("aaaaaXEN1aaaaa", 0)).deep.equal([false, 1n]);
    expect(await xuni.validateArgon2Hash("aaaaaaaaaaxen11", 0)).deep.equal([false, 1n]);
    expect(await xuni.validateArgon2Hash("XEN21aaaaaaaaaa", 0)).deep.equal([false, 1n]);
    expect(await xuni.validateArgon2Hash("XUNIaaaaaaaaaa", 0)).deep.equal([false, 1n]);
    expect(await xuni.validateArgon2Hash("xUNI1aaaaaaaaaa", 0)).deep.equal([false, 1n]);
    expect(await xuni.validateArgon2Hash("", 0)).deep.equal([false, 1n]);

    // wrong timestamp
    await xuni.updateEnforceTimestampCheck(true);
    for (let j = 6; j <= 49; j++) {
      let ts = Math.round(new Date().setUTCMinutes(j, 0, 0) / 1000);
      expect(await xuni.validateArgon2Hash(`aaaaaXUNI1sdf34sdfsdfwef`, ts)).deep.equal([false, 1n]);
    }
  });

  it("Should not allow non-VoteManager to mint", async () => {
    const { xuni, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(xuni.mint(nonValidator1, 1)).to.be.revertedWith("Only vote manager can call this function.");
  });
});
