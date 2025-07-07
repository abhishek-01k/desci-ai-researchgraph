// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ResearchDAOSimple
 * @dev Simplified DAO for research funding and governance
 * Optimized for Filecoin EVM size constraints
 */
contract ResearchDAOSimple is Ownable, ReentrancyGuard {
    
    struct ResearchProposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 requestedAmount;
        uint256 duration;
        uint256 createdAt;
        uint256 votingEndTime;
        uint256 votesFor;
        uint256 votesAgainst;
        bool isExecuted;
        bool isActive;
        mapping(address => bool) hasVoted;
    }

    struct Researcher {
        string name;
        string institution;
        uint256 reputation;
        bool isVerified;
    }

    IERC721 public immutable researchNFT;
    
    mapping(uint256 => ResearchProposal) public proposals;
    mapping(address => Researcher) public researchers;
    mapping(address => uint256[]) public researcherProposals;
    
    uint256 public nextProposalId = 1;
    uint256 public votingPeriod = 7 days;
    uint256 public minimumAmount = 0.1 ether;
    uint256 public maximumAmount = 100 ether;
    uint256 public proposalFee = 0.01 ether;
    
    event ProposalCreated(uint256 indexed id, address indexed proposer, string title, uint256 amount);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool success);
    event ResearcherRegistered(address indexed researcher, string name);
    event FundsWithdrawn(uint256 indexed proposalId, address indexed recipient, uint256 amount);

    constructor(address _researchNFT) Ownable(msg.sender) {
        researchNFT = IERC721(_researchNFT);
    }

    function registerResearcher(string memory name, string memory institution) external {
        researchers[msg.sender] = Researcher({
            name: name,
            institution: institution,
            reputation: 0,
            isVerified: false
        });
        emit ResearcherRegistered(msg.sender, name);
    }

    function createProposal(
        string memory title,
        string memory description,
        uint256 requestedAmount,
        uint256 duration
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= proposalFee, "Insufficient proposal fee");
        require(requestedAmount >= minimumAmount, "Amount too low");
        require(requestedAmount <= maximumAmount, "Amount too high");
        require(bytes(title).length > 0, "Title required");
        require(bytes(researchers[msg.sender].name).length > 0, "Must register as researcher first");

        uint256 proposalId = nextProposalId++;
        
        ResearchProposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.requestedAmount = requestedAmount;
        proposal.duration = duration;
        proposal.createdAt = block.timestamp;
        proposal.votingEndTime = block.timestamp + votingPeriod;
        proposal.isActive = true;
        
        researcherProposals[msg.sender].push(proposalId);
        
        emit ProposalCreated(proposalId, msg.sender, title, requestedAmount);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) external {
        ResearchProposal storage proposal = proposals[proposalId];
        require(proposal.isActive, "Proposal not active");
        require(block.timestamp <= proposal.votingEndTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        // Voting weight based on NFT ownership
        uint256 weight = researchNFT.balanceOf(msg.sender);
        require(weight > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    function executeProposal(uint256 proposalId) external nonReentrant {
        ResearchProposal storage proposal = proposals[proposalId];
        require(proposal.isActive, "Proposal not active");
        require(block.timestamp > proposal.votingEndTime, "Voting still active");
        require(!proposal.isExecuted, "Already executed");
        
        bool success = proposal.votesFor > proposal.votesAgainst;
        proposal.isExecuted = true;
        proposal.isActive = false;
        
        if (success && address(this).balance >= proposal.requestedAmount) {
            payable(proposal.proposer).transfer(proposal.requestedAmount);
            researchers[proposal.proposer].reputation += 10;
            emit FundsWithdrawn(proposalId, proposal.proposer, proposal.requestedAmount);
        }
        
        emit ProposalExecuted(proposalId, success);
    }

    function fundDAO() external payable {
        require(msg.value > 0, "Must send ETH");
    }

    function getProposalVotes(uint256 proposalId) external view returns (uint256 votesFor, uint256 votesAgainst) {
        return (proposals[proposalId].votesFor, proposals[proposalId].votesAgainst);
    }

    function getResearcherProposals(address researcher) external view returns (uint256[] memory) {
        return researcherProposals[researcher];
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }

    function setVotingPeriod(uint256 _votingPeriod) external onlyOwner {
        votingPeriod = _votingPeriod;
    }

    function setProposalFee(uint256 _proposalFee) external onlyOwner {
        proposalFee = _proposalFee;
    }

    function verifyResearcher(address researcher) external onlyOwner {
        researchers[researcher].isVerified = true;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {
        // Allow direct funding of the DAO
    }
} 