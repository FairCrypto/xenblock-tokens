import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { DeployedContracts, deployTokenFixture } from "./_fixtures";
import {ethers, upgrades} from "hardhat";
import { TokenRegistry } from "../typechain-types";

describe("Xenium", function () {
  it("should deploy", async () => {
    const { xenium, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await xenium.owner()).to.equal(owner.address);
    expect(await xenium.name()).to.equal("Xenium");
    expect(await xenium.symbol()).to.equal("XNM");
  });

  it("Should validate tokens", async () => {
    const { xenium, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await xenium.validateArgon2Hash("aaaaaXEN11aaaaa", 0)).deep.equal([true, 1n]);
    expect(await xenium.validateArgon2Hash("aaaaaaaaaaXEN11", 0)).deep.equal([true, 1n]);
    expect(await xenium.validateArgon2Hash("XEN11aaaaaaaaaa", 0)).deep.equal([true, 1n]);
  });

  it("Should not validate tokens", async () => {
    const { xenium, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    expect(await xenium.validateArgon2Hash("aaaaaXEN1aaaaa", 0)).deep.equal([false, 1n]);
    expect(await xenium.validateArgon2Hash("aaaaaaaaaaxen11", 0)).deep.equal([false, 1n]);
    expect(await xenium.validateArgon2Hash("XEN21aaaaaaaaaa", 0)).deep.equal([false, 1n]);
    expect(await xenium.validateArgon2Hash("", 0)).deep.equal([false, 1n]);
  });

  it("Should not allow non-VoteManager to mint", async () => {
    const { xenium, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(xenium.mint(nonValidator1, 1)).to.be.revertedWith("Only vote manager can call this function.");
  });

  it("Should update the token registry", async () => {
    const { xenium, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
    const tokenRegistry = (await upgrades.deployProxy(TokenRegistry, [owner.address])) as unknown as TokenRegistry;
    await tokenRegistry.waitForDeployment();
    await xenium.updateTokenRegistryAddress(await tokenRegistry.getAddress());
    expect(await xenium.tokenRegistryAddress()).to.equal(await tokenRegistry.getAddress());
  });

  it("Should not allow non-owner to update the token registry", async () => {
    const { xenium, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
    const tokenRegistry = (await upgrades.deployProxy(TokenRegistry, [owner.address])) as unknown as TokenRegistry;
    await tokenRegistry.waitForDeployment();
    await expect(xenium.connect(nonValidator1).updateTokenRegistryAddress(await tokenRegistry.getAddress())).to.be.revertedWithCustomError(xenium, "OwnableUnauthorizedAccount");
  });

  it("should update the pattern", async () => {
    const { xenium, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await xenium.updatePattern("XEN1111");
    expect(await xenium.pattern()).to.equal("XEN1111");
    expect(await xenium.version()).to.equal(2);
    await expect(xenium.updatePattern("")).to.revertedWith("Pattern must be between 3 and 100 characters.")
    await expect(xenium.updatePattern("1")).to.revertedWith("Pattern must be between 3 and 100 characters.")
    await expect(xenium.updatePattern("f3")).to.revertedWith("Pattern must be between 3 and 100 characters.")
    await expect(xenium.updatePattern("ajshdkasdhkasjhdkajshdaskjhdkasjhskdhaskjdhaksjdhkksjdhflksdjhfdskjhfdskhfsdkfhksdjhfsdkhfsdklfhdkshfksdfhksashasdasdasdasdasdsadd")).to.revertedWith("Pattern must be between 3 and 100 characters.")
  })

  it("should not allow non-owner to update the pattern", async () => {
    const { xenium, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(xenium.connect(nonValidator1).updatePattern("XEN1111")).to.be.revertedWithCustomError(xenium, "OwnableUnauthorizedAccount");
  })

  it("should update amountPerHash", async () => {
    const { xenium, owner } = await loadFixture<DeployedContracts>(deployTokenFixture);

    await xenium.updateAmountPerHash(ethers.parseEther("100"));
    expect(await xenium.amountPerHash()).to.equal(ethers.parseEther("100"));
    expect(await xenium.version()).to.equal(2);

    await xenium.updateAmountPerHash(1);
    expect(await xenium.amountPerHash()).to.equal(1);

    await expect(xenium.updateAmountPerHash(0)).to.revertedWith("Amount per hash must be greater than 0.");
  })

  it("should not allow non-owner to update amountPerHash", async () => {
    const { xenium, owner, nonValidator1 } = await loadFixture<DeployedContracts>(deployTokenFixture);
    await expect(xenium.connect(nonValidator1).updateAmountPerHash(ethers.parseEther("100"))).to.be.revertedWithCustomError(xenium, "OwnableUnauthorizedAccount");
  })
});
