// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ResearchIPNFT
 * @dev Smart contract for tokenizing research intellectual property in the ResearchGraph AI ecosystem
 * Enables researchers to mint NFTs for their work, set licensing terms, and track citations
 * Part of the ResearchGraph AI decentralized science platform
 */
contract ResearchIPNFT is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    uint256 private _nextTokenId = 1;

    struct ResearchIP {
        string title;
        string ipfsHash; // Metadata stored on IPFS
        address[] contributors;
        uint256[] contributionShares; // Basis points (10000 = 100%)
        uint256 licensePrice; // Price in wei for licensing
        bool isOpenAccess;
        string ontologyCategory; // e.g., "biology", "chemistry", "physics"
        uint256 createdAt;
        uint256 validatedAt;
        bool isValidated;
        string doi; // Digital Object Identifier
    }

    struct License {
        address licensee;
        uint256 tokenId;
        uint256 paidAmount;
        uint256 licensedAt;
        string licenseType; // "commercial", "academic", "open"
    }

    struct Citation {
        uint256 citingTokenId;
        uint256 citedTokenId;
        uint256 citedAt;
        string citationType; // "reference", "builds_upon", "contradicts"
    }

    // Mappings
    mapping(uint256 => ResearchIP) public researchIPs;
    mapping(uint256 => License[]) public licenses;
    mapping(uint256 => Citation[]) public citations;
    mapping(uint256 => uint256[]) public citationGraph; // tokenId => array of cited tokenIds
    mapping(address => uint256[]) public researcherWorks;
    mapping(string => uint256) public doiToTokenId;

    // Events
    event ResearchIPMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        string ipfsHash
    );
    
    event ResearchIPValidated(
        uint256 indexed tokenId,
        address indexed validator
    );
    
    event LicenseGranted(
        uint256 indexed tokenId,
        address indexed licensee,
        uint256 amount,
        string licenseType
    );
    
    event CitationAdded(
        uint256 indexed citingTokenId,
        uint256 indexed citedTokenId,
        string citationType
    );

    constructor() ERC721("ResearchIP", "RIP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new research IP NFT
     * @param to Address to mint the NFT to
     * @param title Title of the research
     * @param ipfsHash IPFS hash containing metadata
     * @param contributors Array of contributor addresses
     * @param shares Array of contribution shares (must sum to 10000)
     * @param licensePrice Price for licensing in wei
     * @param isOpenAccess Whether the research is open access
     * @param ontologyCategory Category of research
     * @param doi Digital Object Identifier
     */
    function mintResearchIP(
        address to,
        string memory title,
        string memory ipfsHash,
        address[] memory contributors,
        uint256[] memory shares,
        uint256 licensePrice,
        bool isOpenAccess,
        string memory ontologyCategory,
        string memory doi
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(contributors.length == shares.length, "Contributors and shares length mismatch");
        require(_validateShares(shares), "Shares must sum to 10000");
        require(bytes(doi).length > 0, "DOI cannot be empty");
        require(doiToTokenId[doi] == 0, "DOI already exists");

        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);

        researchIPs[tokenId] = ResearchIP({
            title: title,
            ipfsHash: ipfsHash,
            contributors: contributors,
            contributionShares: shares,
            licensePrice: licensePrice,
            isOpenAccess: isOpenAccess,
            ontologyCategory: ontologyCategory,
            createdAt: block.timestamp,
            validatedAt: 0,
            isValidated: false,
            doi: doi
        });

        doiToTokenId[doi] = tokenId;

        // Add to each contributor's works
        for (uint256 i = 0; i < contributors.length; i++) {
            researcherWorks[contributors[i]].push(tokenId);
        }

        emit ResearchIPMinted(tokenId, to, title, ipfsHash);
        return tokenId;
    }

    /**
     * @dev Validate a research IP NFT
     * @param tokenId Token ID to validate
     */
    function validateResearchIP(uint256 tokenId) external onlyRole(VALIDATOR_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!researchIPs[tokenId].isValidated, "Already validated");

        researchIPs[tokenId].isValidated = true;
        researchIPs[tokenId].validatedAt = block.timestamp;

        emit ResearchIPValidated(tokenId, msg.sender);
    }

    /**
     * @dev License a research IP NFT
     * @param tokenId Token ID to license
     * @param licenseType Type of license
     */
    function licenseTo(
        uint256 tokenId,
        string memory licenseType
    ) external payable nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        ResearchIP memory research = researchIPs[tokenId];
        
        if (!research.isOpenAccess) {
            require(msg.value >= research.licensePrice, "Insufficient payment");
        }

        licenses[tokenId].push(License({
            licensee: msg.sender,
            tokenId: tokenId,
            paidAmount: msg.value,
            licensedAt: block.timestamp,
            licenseType: licenseType
        }));

        // Distribute payments to contributors
        if (msg.value > 0) {
            _distributePayments(tokenId, msg.value);
        }

        emit LicenseGranted(tokenId, msg.sender, msg.value, licenseType);
    }

    /**
     * @dev Add a citation relationship between two research IPs
     * @param citingTokenId Token ID that is citing
     * @param citedTokenId Token ID being cited
     * @param citationType Type of citation
     */
    function addCitation(
        uint256 citingTokenId,
        uint256 citedTokenId,
        string memory citationType
    ) external {
        require(_ownerOf(citingTokenId) != address(0), "Citing token does not exist");
        require(_ownerOf(citedTokenId) != address(0), "Cited token does not exist");
        require(citingTokenId != citedTokenId, "Cannot cite self");
        
        // Only token owner or approved can add citations
        require(
            ownerOf(citingTokenId) == msg.sender || 
            getApproved(citingTokenId) == msg.sender || 
            isApprovedForAll(ownerOf(citingTokenId), msg.sender),
            "Not authorized to add citation"
        );

        citations[citingTokenId].push(Citation({
            citingTokenId: citingTokenId,
            citedTokenId: citedTokenId,
            citedAt: block.timestamp,
            citationType: citationType
        }));

        citationGraph[citingTokenId].push(citedTokenId);

        emit CitationAdded(citingTokenId, citedTokenId, citationType);
    }

    /**
     * @dev Get research IP details
     * @param tokenId Token ID to query
     */
    function getResearchIP(uint256 tokenId) external view returns (ResearchIP memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return researchIPs[tokenId];
    }

    /**
     * @dev Get licenses for a token
     * @param tokenId Token ID to query
     */
    function getLicenses(uint256 tokenId) external view returns (License[] memory) {
        return licenses[tokenId];
    }

    /**
     * @dev Get citations for a token
     * @param tokenId Token ID to query
     */
    function getCitations(uint256 tokenId) external view returns (Citation[] memory) {
        return citations[tokenId];
    }

    /**
     * @dev Get citation graph for a token
     * @param tokenId Token ID to query
     */
    function getCitationGraph(uint256 tokenId) external view returns (uint256[] memory) {
        return citationGraph[tokenId];
    }

    /**
     * @dev Get all works by a researcher
     * @param researcher Address of researcher
     */
    function getResearcherWorks(address researcher) external view returns (uint256[] memory) {
        return researcherWorks[researcher];
    }

    /**
     * @dev Get token ID by DOI
     * @param doi Digital Object Identifier
     */
    function getTokenByDOI(string memory doi) external view returns (uint256) {
        return doiToTokenId[doi];
    }

    /**
     * @dev Calculate citation impact score for a token
     * @param tokenId Token ID to calculate score for
     */
    function getCitationImpact(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        uint256 directCitations = 0;
        uint256 indirectCitations = 0;
        
        // Count how many times this token is cited
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (_ownerOf(i) != address(0)) {
                uint256[] memory cited = citationGraph[i];
                for (uint256 j = 0; j < cited.length; j++) {
                    if (cited[j] == tokenId) {
                        directCitations++;
                        // Add weight for citations of citing papers
                        indirectCitations += citationGraph[i].length;
                    }
                }
            }
        }
        
        return directCitations * 100 + indirectCitations * 10;
    }

    // Internal functions

    function _validateShares(uint256[] memory shares) internal pure returns (bool) {
        uint256 total = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            total += shares[i];
        }
        return total == 10000;
    }

    function _distributePayments(uint256 tokenId, uint256 amount) internal {
        ResearchIP memory research = researchIPs[tokenId];
        
        for (uint256 i = 0; i < research.contributors.length; i++) {
            uint256 share = (amount * research.contributionShares[i]) / 10000;
            if (share > 0) {
                payable(research.contributors[i]).transfer(share);
            }
        }
    }

    // Override functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 