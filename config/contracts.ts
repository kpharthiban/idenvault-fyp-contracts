export const contracts = {
  issuerRegistry: {
    address: '0x3e769cDDbC015179C283B6E94E85135845B4022d',
    abi: [
        {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
        },
        {
        "anonymous": false,
        "inputs": [
            {
            "indexed": true,
            "internalType": "address",
            "name": "issuer",
            "type": "address"
            }
        ],
        "name": "IssuerRegistered",
        "type": "event"
        },
        {
        "anonymous": false,
        "inputs": [
            {
            "indexed": true,
            "internalType": "address",
            "name": "issuer",
            "type": "address"
            }
        ],
        "name": "IssuerRevoked",
        "type": "event"
        },
        {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
            "internalType": "address",
            "name": "",
            "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
        },
        {
        "inputs": [
            {
            "internalType": "address",
            "name": "issuer",
            "type": "address"
            }
        ],
        "name": "isIssuerTrusted",
        "outputs": [
            {
            "internalType": "bool",
            "name": "",
            "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
        },
        {
        "inputs": [
            {
            "internalType": "address",
            "name": "issuer",
            "type": "address"
            }
        ],
        "name": "registerIssuer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
        },
        {
        "inputs": [
            {
            "internalType": "address",
            "name": "issuer",
            "type": "address"
            }
        ],
        "name": "revokeIssuer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
        },
        {
        "inputs": [
            {
            "internalType": "address",
            "name": "",
            "type": "address"
            }
        ],
        "name": "trustedIssuers",
        "outputs": [
            {
            "internalType": "bool",
            "name": "",
            "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
        }
    ]
  },
  credentialAnchor: {
    address: '0x48E772116389005FbeB7808b66fB63a73f9f264f',
    abi: [
        {
        "inputs": [
            {
            "internalType": "address",
            "name": "registryAddress",
            "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
        },
        {
        "anonymous": false,
        "inputs": [
            {
            "indexed": true,
            "internalType": "string",
            "name": "refId",
            "type": "string"
            },
            {
            "indexed": true,
            "internalType": "address",
            "name": "issuer",
            "type": "address"
            },
            {
            "indexed": false,
            "internalType": "bytes32",
            "name": "dataHash",
            "type": "bytes32"
            }
        ],
        "name": "CredentialAnchored",
        "type": "event"
        },
        {
        "anonymous": false,
        "inputs": [
            {
            "indexed": true,
            "internalType": "string",
            "name": "refId",
            "type": "string"
            },
            {
            "indexed": true,
            "internalType": "address",
            "name": "issuer",
            "type": "address"
            }
        ],
        "name": "CredentialRevoked",
        "type": "event"
        },
        {
        "inputs": [
            {
            "internalType": "string",
            "name": "refId",
            "type": "string"
            },
            {
            "internalType": "bytes32",
            "name": "dataHash",
            "type": "bytes32"
            }
        ],
        "name": "anchorCredential",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
        },
        {
        "inputs": [
            {
            "internalType": "string[]",
            "name": "refIds",
            "type": "string[]"
            },
            {
            "internalType": "bytes32[]",
            "name": "dataHashes",
            "type": "bytes32[]"
            }
        ],
        "name": "batchAnchorCredentials",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
        },
        {
        "inputs": [
            {
            "internalType": "string",
            "name": "",
            "type": "string"
            }
        ],
        "name": "credentials",
        "outputs": [
            {
            "internalType": "bytes32",
            "name": "dataHash",
            "type": "bytes32"
            },
            {
            "internalType": "address",
            "name": "issuer",
            "type": "address"
            },
            {
            "internalType": "uint256",
            "name": "issuedAt",
            "type": "uint256"
            },
            {
            "internalType": "bool",
            "name": "revoked",
            "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
        },
        {
        "inputs": [],
        "name": "registry",
        "outputs": [
            {
            "internalType": "contract IssuerRegistry",
            "name": "",
            "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
        },
        {
        "inputs": [
            {
            "internalType": "string",
            "name": "refId",
            "type": "string"
            }
        ],
        "name": "revokeCredential",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
        },
        {
        "inputs": [
            {
            "internalType": "string",
            "name": "refId",
            "type": "string"
            },
            {
            "internalType": "bytes32",
            "name": "dataHash",
            "type": "bytes32"
            }
        ],
        "name": "verifyCredential",
        "outputs": [
            {
            "internalType": "bool",
            "name": "valid",
            "type": "bool"
            },
            {
            "internalType": "bool",
            "name": "revoked",
            "type": "bool"
            },
            {
            "internalType": "address",
            "name": "issuer",
            "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
        }
    ]
  }
};