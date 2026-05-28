import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("CredentialAnchor V2 - batchAnchorCredentials", function () {
  async function deployFixture() {
    const [admin, issuer, nonIssuer] = await ethers.getSigners();

    const IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
    const registry = await IssuerRegistry.deploy();

    const CredentialAnchor = await ethers.getContractFactory("CredentialAnchor");
    const anchor = await CredentialAnchor.deploy(await registry.getAddress());

    await registry.registerIssuer(issuer.address);

    return { registry, anchor, admin, issuer, nonIssuer };
  }

  it("should batch anchor 3 credentials", async function () {
    const { anchor, issuer } = await loadFixture(deployFixture);

    const refIds = ["cred-1", "cred-2", "cred-3"];
    const dataHashes = [
      ethers.keccak256(ethers.toUtf8Bytes("data1")),
      ethers.keccak256(ethers.toUtf8Bytes("data2")),
      ethers.keccak256(ethers.toUtf8Bytes("data3")),
    ];

    const tx = await anchor.connect(issuer).batchAnchorCredentials(refIds, dataHashes);
    const receipt = await tx.wait();

    for (const refId of refIds) {
      const cred = await anchor.credentials(refId);
      expect(cred.issuer).to.equal(issuer.address);
      expect(cred.issuedAt).to.be.greaterThan(0);
      expect(cred.revoked).to.be.false;
    }
  });

  it("should revert on mismatched array lengths", async function () {
    const { anchor, issuer } = await loadFixture(deployFixture);

    const refIds = ["cred-1", "cred-2"];
    const dataHashes = [ethers.keccak256(ethers.toUtf8Bytes("data1"))];

    await expect(
      anchor.connect(issuer).batchAnchorCredentials(refIds, dataHashes)
    ).to.be.revertedWith("Arrays must be same length");
  });

  it("should revert on duplicate refId within batch", async function () {
    const { anchor, issuer } = await loadFixture(deployFixture);

    const hash = ethers.keccak256(ethers.toUtf8Bytes("data1"));
    const refIds = ["cred-dup", "cred-dup"];
    const dataHashes = [hash, hash];

    await expect(
      anchor.connect(issuer).batchAnchorCredentials(refIds, dataHashes)
    ).to.be.revertedWith("Credential already exists");
  });

  it("should revert when called by non-trusted issuer", async function () {
    const { anchor, nonIssuer } = await loadFixture(deployFixture);

    const refIds = ["cred-1"];
    const dataHashes = [ethers.keccak256(ethers.toUtf8Bytes("data1"))];

    await expect(
      anchor.connect(nonIssuer).batchAnchorCredentials(refIds, dataHashes)
    ).to.be.revertedWith("Not a trusted issuer");
  });

  it("should still allow individual anchorCredential", async function () {
    const { anchor, issuer } = await loadFixture(deployFixture);

    const refId = "single-cred";
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("single-data"));

    await anchor.connect(issuer).anchorCredential(refId, dataHash);

    const cred = await anchor.credentials(refId);
    expect(cred.issuer).to.equal(issuer.address);
    expect(cred.issuedAt).to.be.greaterThan(0);
  });
});
