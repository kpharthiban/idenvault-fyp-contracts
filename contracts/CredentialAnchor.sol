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

    function batchAnchorCredentials(
        string[] memory refIds,
        bytes32[] memory dataHashes
    ) external {
        require(registry.isIssuerTrusted(msg.sender), "Not a trusted issuer");
        require(refIds.length == dataHashes.length, "Arrays must be same length");
        require(refIds.length > 0, "Empty batch");
        require(refIds.length <= 50, "Batch too large");

        for (uint256 i = 0; i < refIds.length; i++) {
            require(credentials[refIds[i]].issuedAt == 0, "Credential already exists");
            credentials[refIds[i]] = Credential(
                dataHashes[i],
                msg.sender,
                block.timestamp,
                false
            );
            emit CredentialAnchored(refIds[i], msg.sender, dataHashes[i]);
        }
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