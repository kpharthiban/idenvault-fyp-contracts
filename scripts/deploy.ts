import { ethers } from "hardhat";

async function main() {
  // IssuerRegistry already deployed
  const registryAddress = "0x3e769cDDbC015179C283B6E94E85135845B4022d";
  console.log("Using existing IssuerRegistry at:", registryAddress);

  // Deploy CredentialAnchor, passing registry address to constructor
  const CredentialAnchor = await ethers.getContractFactory("CredentialAnchor");
  const anchor = await CredentialAnchor.deploy(registryAddress);
  await anchor.waitForDeployment();
  const anchorAddress = await anchor.getAddress();
  console.log("CredentialAnchor deployed to:", anchorAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});