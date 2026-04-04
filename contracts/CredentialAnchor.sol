// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IssuerRegistry.sol";

contract CredentialAnchor {
    IssuerRegistry public registry;

    struct Credential {
        bytes32 dataHash;     // keccak256 of credential JSON
        address issuer;
        uint256 issuedAt;
        bool revoked;
    }

    mapping(string => Credential) public credentials; // refId → Credential

    event CredentialAnchored(string indexed refId, address indexed issuer, bytes32 dataHash);
    event CredentialRevoked(string indexed refId, address indexed issuer);

    constructor(address registryAddress) {
        registry = IssuerRegistry(registryAddress);
    }

    function anchorCredential(string memory refId, bytes32 dataHash) external {
        require(registry.isIssuerTrusted(msg.sender), "Not a trusted issuer");
        require(credentials[refId].issuedAt == 0, "Credential already exists");
        credentials[refId] = Credential(dataHash, msg.sender, block.timestamp, false);
        emit CredentialAnchored(refId, msg.sender, dataHash);
    }

    function revokeCredential(string memory refId) external {
        require(credentials[refId].issuer == msg.sender, "Not the issuer");
        credentials[refId].revoked = true;
        emit CredentialRevoked(refId, msg.sender);
    }

    function verifyCredential(string memory refId, bytes32 dataHash) external view
        returns (bool valid, bool revoked, address issuer) {
        Credential memory c = credentials[refId];
        return (c.dataHash == dataHash && c.issuedAt != 0, c.revoked, c.issuer);
    }
}