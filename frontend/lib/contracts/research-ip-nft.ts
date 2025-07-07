export const RESEARCH_IP_NFT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "contributors",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "shares",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256",
        "name": "licensePrice",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isOpenAccess",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "ontologyCategory",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "doi",
        "type": "string"
      }
    ],
    "name": "mintResearchIP",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "citingTokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "citedTokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "citationType",
        "type": "string"
      }
    ],
    "name": "addCitation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "licenseType",
        "type": "string"
      }
    ],
    "name": "licenseTo",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "validateResearchIP",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "researchIPs",
    "outputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "contributors",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "contributionShares",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256",
        "name": "licensePrice",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isOpenAccess",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "ontologyCategory",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "validatedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isValidated",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "doi",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "citations",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "citingTokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "citedTokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "citedAt",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "citationType",
            "type": "string"
          }
        ],
        "internalType": "struct ResearchIPNFT.Citation[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "researcher",
        "type": "address"
      }
    ],
    "name": "researcherWorks",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "name": "ResearchIPMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "citingTokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "citedTokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "citationType",
        "type": "string"
      }
    ],
    "name": "CitationAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "licensee",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "licenseType",
        "type": "string"
      }
    ],
    "name": "LicenseGranted",
    "type": "event"
  }
] as const; 