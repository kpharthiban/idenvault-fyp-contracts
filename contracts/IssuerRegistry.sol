// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IssuerRegistry {
    address public admin;
    mapping(address => bool) public trustedIssuers;

    event IssuerRegistered(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    constructor() { admin = msg.sender; }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function registerIssuer(address issuer) external onlyAdmin {
        trustedIssuers[issuer] = true;
        emit IssuerRegistered(issuer);
    }

    function revokeIssuer(address issuer) external onlyAdmin {
        trustedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    function isIssuerTrusted(address issuer) external view returns (bool) {
        return trustedIssuers[issuer];
    }
}