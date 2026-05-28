import { ethers } from "hardhat";

async function main() {
  const ISSUER_REGISTRY_ADDRESS = "0x3e769cDDbC015179C283B6E94E85135845B4022d";

  const CredentialAnchor = await ethers.getContractFactory("CredentialAnchor");
  const anchor = await CredentialAnchor.deploy(ISSUER_REGISTRY_ADDRESS);
  await anchor.waitForDeployment();

  const address = await anchor.getAddress();
  console.log("CredentialAnchor V2 deployed to:", address);
  console.log("Points to IssuerRegistry at:", ISSUER_REGISTRY_ADDRESS);
  console.log("\nUpdate this address in:");
  console.log("  - Frontend: NEXT_PUBLIC_CREDENTIAL_ANCHOR_ADDRESS in .env.local");
  console.log("  - Frontend: src/config/contracts.ts → credentialAnchor.address");
  console.log("  - Backend: src/config/contracts.ts → credentialAnchor.address");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
