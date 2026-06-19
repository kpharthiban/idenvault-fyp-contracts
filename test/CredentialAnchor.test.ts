import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("CredentialAnchor", function () {
  async function deployFixture() {
    const [admin, issuer, otherIssuer, nonIssuer] = await ethers.getSigners();

    const IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
    const registry = await IssuerRegistry.deploy();

    const CredentialAnchor = await ethers.getContractFactory("CredentialAnchor");
    const anchor = await CredentialAnchor.deploy(await registry.getAddress());

    // signers[1] is the only trusted issuer; signers[2] and signers[3] are not
    await registry.registerIssuer(issuer.address);

    return { registry, anchor, admin, issuer, otherIssuer, nonIssuer };
  }

  // ─── anchorCredential() ──────────────────────────────────────────────────────

  describe("anchorCredential()", function () {
    it("SC-CA-01: trusted issuer - credential stored on-chain and CredentialAnchored emitted", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      const refId = "cred-001";
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("credential-data"));

      await expect(anchor.connect(issuer).anchorCredential(refId, dataHash))
        .to.emit(anchor, "CredentialAnchored")
        .withArgs(refId, issuer.address, dataHash);

      const cred = await anchor.credentials(refId);
      expect(cred.issuer).to.equal(issuer.address);
      expect(cred.dataHash).to.equal(dataHash);
      expect(cred.issuedAt).to.be.greaterThan(0);
      expect(cred.revoked).to.be.false;
    });

    it("SC-CA-02: duplicate refId - reverts with 'Credential already exists'", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      const refId = "cred-002";
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("credential-data"));

      await anchor.connect(issuer).anchorCredential(refId, dataHash);

      await expect(
        anchor.connect(issuer).anchorCredential(refId, dataHash)
      ).to.be.revertedWith("Credential already exists");
    });

    it("SC-CA-03: untrusted wallet - reverts with 'Not a trusted issuer'", async function () {
      const { anchor, nonIssuer } = await loadFixture(deployFixture);

      const refId = "cred-003";
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("credential-data"));

      await expect(
        anchor.connect(nonIssuer).anchorCredential(refId, dataHash)
      ).to.be.revertedWith("Not a trusted issuer");
    });
  });

  // ─── batchAnchorCredentials() ────────────────────────────────────────────────

  describe("batchAnchorCredentials()", function () {
    it("SC-CA-04: batch of 3 valid credentials - all stored on-chain and 3 CredentialAnchored events emitted", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      const refIds = ["batch-001", "batch-002", "batch-003"];
      const dataHashes = [
        ethers.keccak256(ethers.toUtf8Bytes("data1")),
        ethers.keccak256(ethers.toUtf8Bytes("data2")),
        ethers.keccak256(ethers.toUtf8Bytes("data3")),
      ];

      const tx = await anchor.connect(issuer).batchAnchorCredentials(refIds, dataHashes);
      const receipt = await tx.wait();

      // Verify all 3 credentials are stored with correct values
      for (let i = 0; i < refIds.length; i++) {
        const cred = await anchor.credentials(refIds[i]);
        expect(cred.issuer).to.equal(issuer.address);
        expect(cred.dataHash).to.equal(dataHashes[i]);
        expect(cred.issuedAt).to.be.greaterThan(0);
        expect(cred.revoked).to.be.false;
      }

      // Verify exactly 3 CredentialAnchored events were emitted
      const anchoredEvents = receipt!.logs.filter((log) => {
        try {
          return (
            anchor.interface.parseLog({
              topics: Array.from(log.topics),
              data: log.data,
            })?.name === "CredentialAnchored"
          );
        } catch {
          return false;
        }
      });
      expect(anchoredEvents.length).to.equal(3);
    });

    it("SC-CA-05: mismatched array lengths - reverts with 'Arrays must be same length'", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      const refIds = ["batch-001", "batch-002"];
      const dataHashes = [ethers.keccak256(ethers.toUtf8Bytes("data1"))];

      await expect(
        anchor.connect(issuer).batchAnchorCredentials(refIds, dataHashes)
      ).to.be.revertedWith("Arrays must be same length");
    });

    it("SC-CA-06: empty arrays - reverts with 'Empty batch'", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      await expect(
        anchor.connect(issuer).batchAnchorCredentials([], [])
      ).to.be.revertedWith("Empty batch");
    });

    it("SC-CA-07: 51 entries exceeds limit - reverts with 'Batch too large'", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      const refIds = Array.from({ length: 51 }, (_, i) => `cred-${i}`);
      const dataHashes = Array.from({ length: 51 }, (_, i) =>
        ethers.keccak256(ethers.toUtf8Bytes(`data-${i}`))
      );

      await expect(
        anchor.connect(issuer).batchAnchorCredentials(refIds, dataHashes)
      ).to.be.revertedWith("Batch too large");
    });

    it("BONUS: duplicate refId within same batch - reverts with 'Credential already exists'", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      const hash = ethers.keccak256(ethers.toUtf8Bytes("data1"));
      const refIds = ["cred-dup", "cred-dup"];
      const dataHashes = [hash, hash];

      await expect(
        anchor.connect(issuer).batchAnchorCredentials(refIds, dataHashes)
      ).to.be.revertedWith("Credential already exists");
    });
  });

  // ─── revokeCredential() ──────────────────────────────────────────────────────

  describe("revokeCredential()", function () {
    it("SC-CA-08: original issuer revokes - revoked flag set to true and CredentialRevoked emitted", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      const refId = "cred-revoke";
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("credential-data"));

      await anchor.connect(issuer).anchorCredential(refId, dataHash);

      await expect(anchor.connect(issuer).revokeCredential(refId))
        .to.emit(anchor, "CredentialRevoked")
        .withArgs(refId, issuer.address);

      const cred = await anchor.credentials(refId);
      expect(cred.revoked).to.be.true;
    });

    it("SC-CA-09: different wallet attempts revocation - reverts with 'Not the issuer'", async function () {
      const { anchor, issuer, nonIssuer } = await loadFixture(deployFixture);

      const refId = "cred-revoke-auth";
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("credential-data"));

      await anchor.connect(issuer).anchorCredential(refId, dataHash);

      await expect(
        anchor.connect(nonIssuer).revokeCredential(refId)
      ).to.be.revertedWith("Not the issuer");
    });
  });

  // ─── verifyCredential() ──────────────────────────────────────────────────────

  describe("verifyCredential()", function () {
    it("SC-VC-01: correct hash on active credential - returns (valid: true, revoked: false, issuer: address)", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      const refId = "cred-verify-01";
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("credential-data"));

      await anchor.connect(issuer).anchorCredential(refId, dataHash);

      const [valid, revoked, returnedIssuer] = await anchor.verifyCredential(refId, dataHash);

      expect(valid).to.be.true;
      expect(revoked).to.be.false;
      expect(returnedIssuer).to.equal(issuer.address);
    });

    it("SC-VC-02: correct hash on revoked credential - returns (valid: true, revoked: true, issuer: address)", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      const refId = "cred-verify-02";
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("credential-data"));

      await anchor.connect(issuer).anchorCredential(refId, dataHash);
      await anchor.connect(issuer).revokeCredential(refId);

      const [valid, revoked, returnedIssuer] = await anchor.verifyCredential(refId, dataHash);

      // Hash still matches the stored hash, so valid is true
      // But the credential has been revoked, so revoked is also true
      expect(valid).to.be.true;
      expect(revoked).to.be.true;
      expect(returnedIssuer).to.equal(issuer.address);
    });

    it("SC-VC-03: wrong hash on active credential - returns (valid: false, revoked: false, issuer: address)", async function () {
      const { anchor, issuer } = await loadFixture(deployFixture);

      const refId = "cred-verify-03";
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("credential-data"));
      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("tampered-data"));

      await anchor.connect(issuer).anchorCredential(refId, dataHash);

      const [valid, revoked, returnedIssuer] = await anchor.verifyCredential(refId, wrongHash);

      expect(valid).to.be.false;
      expect(revoked).to.be.false;
      expect(returnedIssuer).to.equal(issuer.address);
    });

    it("SC-VC-04: non-existent refId - returns (valid: false, revoked: false, issuer: zero address)", async function () {
      const { anchor } = await loadFixture(deployFixture);

      const [valid, revoked, returnedIssuer] = await anchor.verifyCredential(
        "non-existent-ref",
        ethers.keccak256(ethers.toUtf8Bytes("any-data"))
      );

      expect(valid).to.be.false;
      expect(revoked).to.be.false;
      expect(returnedIssuer).to.equal(ethers.ZeroAddress);
    });
  });
});