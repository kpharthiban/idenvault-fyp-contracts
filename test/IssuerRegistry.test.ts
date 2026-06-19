import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("IssuerRegistry", function () {
  async function deployFixture() {
    const [admin, issuer, nonAdmin] = await ethers.getSigners();

    const IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
    const registry = await IssuerRegistry.deploy();

    return { registry, admin, issuer, nonAdmin };
  }

  // ─── registerIssuer() ────────────────────────────────────────────────────────

  describe("registerIssuer()", function () {
    it("SC-IR-01: admin wallet registers issuer - isIssuerTrusted returns true and IssuerRegistered emitted", async function () {
      const { registry, issuer } = await loadFixture(deployFixture);

      await expect(registry.registerIssuer(issuer.address))
        .to.emit(registry, "IssuerRegistered")
        .withArgs(issuer.address);

      expect(await registry.isIssuerTrusted(issuer.address)).to.be.true;
    });

    it("SC-IR-03: non-admin wallet call reverts with 'Not admin'", async function () {
      const { registry, issuer, nonAdmin } = await loadFixture(deployFixture);

      await expect(
        registry.connect(nonAdmin).registerIssuer(issuer.address)
      ).to.be.revertedWith("Not admin");
    });
  });

  // ─── revokeIssuer() ──────────────────────────────────────────────────────────

  describe("revokeIssuer()", function () {
    it("SC-IR-02: admin wallet revokes issuer - isIssuerTrusted returns false and IssuerRevoked emitted", async function () {
      const { registry, issuer } = await loadFixture(deployFixture);

      await registry.registerIssuer(issuer.address);

      await expect(registry.revokeIssuer(issuer.address))
        .to.emit(registry, "IssuerRevoked")
        .withArgs(issuer.address);

      expect(await registry.isIssuerTrusted(issuer.address)).to.be.false;
    });

    it("SC-IR-04: non-admin wallet call reverts with 'Not admin'", async function () {
      const { registry, issuer, nonAdmin } = await loadFixture(deployFixture);

      await registry.registerIssuer(issuer.address);

      await expect(
        registry.connect(nonAdmin).revokeIssuer(issuer.address)
      ).to.be.revertedWith("Not admin");
    });
  });

  // ─── isIssuerTrusted() ───────────────────────────────────────────────────────

  describe("isIssuerTrusted()", function () {
    it("SC-IR-05: never-registered address returns false", async function () {
      const { registry, nonAdmin } = await loadFixture(deployFixture);

      expect(await registry.isIssuerTrusted(nonAdmin.address)).to.be.false;
    });
  });

  // ─── Re-registration lifecycle ───────────────────────────────────────────────

  describe("Re-registration lifecycle", function () {
    it("SC-IR-06: register then revoke then re-register - final state is trusted", async function () {
      const { registry, issuer } = await loadFixture(deployFixture);

      await registry.registerIssuer(issuer.address);
      expect(await registry.isIssuerTrusted(issuer.address)).to.be.true;

      await registry.revokeIssuer(issuer.address);
      expect(await registry.isIssuerTrusted(issuer.address)).to.be.false;

      await registry.registerIssuer(issuer.address);
      expect(await registry.isIssuerTrusted(issuer.address)).to.be.true;
    });
  });
});