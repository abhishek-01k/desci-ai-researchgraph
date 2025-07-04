// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ResearchDAO
 * @dev Decentralized Autonomous Organization for research funding and governance
 * Part of the ResearchGraph AI ecosystem for decentralized science
 */
contract ResearchDAO is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl,
    AccessControl,
    ReentrancyGuard
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REVIEWER_ROLE = keccak256("REVIEWER_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    struct ResearchProposal {
        uint256 proposalId;
        address proposer;
        string title;
        string description;
        string ipfsHash; // Detailed proposal on IPFS
        uint256 requestedAmount;
        uint256 duration; // in seconds
        string researchCategory;
        address[] milestones;
        uint256[] milestoneAmounts;
        uint256 createdAt;
        uint256 votingStartTime;
        uint256 votingEndTime;
        ProposalState currentState;
        bool isExecuted;
        string[] tags;
    }

    struct Milestone {
        uint256 proposalId;
        uint256 milestoneIndex;
        string description;
        uint256 amount;
        bool isCompleted;
        bool isApproved;
        uint256 completedAt;
        string deliverableHash; // IPFS hash of deliverable
        address[] reviewers;
        mapping(address => bool) reviewerApprovals;
        uint256 approvalCount;
    }

    struct Funding {
        uint256 proposalId;
        address funder;
        uint256 amount;
        uint256 fundedAt;
        bool isRefunded;
    }

    struct Researcher {
        address researcherAddress;
        string name;
        string institution;
        string orcid;
        uint256 reputation;
        uint256[] proposalIds;
        uint256 totalFundingReceived;
        uint256 successfulProjects;
        bool isVerified;
    }

    // State variables
    mapping(uint256 => ResearchProposal) public proposals;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => Funding[]) public proposalFunding;
    mapping(address => Researcher) public researchers;
    mapping(address => uint256[]) public researcherProposals;
    mapping(uint256 => uint256) public proposalToDAOProposal;
    mapping(string => uint256[]) public categoryProposals;
    
    uint256 public nextProposalId = 1;
    uint256 public totalFundsRaised;
    uint256 public totalFundsDistributed;
    uint256 public minimumProposalAmount = 1000 * 10**18; // 1000 tokens
    uint256 public maximumProposalAmount = 1000000 * 10**18; // 1M tokens
    uint256 public proposalFee = 10 * 10**18; // 10 tokens

    // Events
    event ResearchProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 requestedAmount
    );
    
    event ProposalFunded(
        uint256 indexed proposalId,
        address indexed funder,
        uint256 amount
    );
    
    event MilestoneCompleted(
        uint256 indexed proposalId,
        uint256 indexed milestoneIndex,
        string deliverableHash
    );
    
    event MilestoneApproved(
        uint256 indexed proposalId,
        uint256 indexed milestoneIndex,
        uint256 amount
    );
    
    event ResearcherRegistered(
        address indexed researcher,
        string name,
        string institution
    );

    constructor(
        IVotes _token,
        TimelockController _timelock,
        string memory _name
    )
        Governor(_name)
        GovernorSettings(7200, 50400, 0) // 1 day delay, 1 week period, 0 proposal threshold
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(REVIEWER_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
    }

    /**
     * @dev Create a new research proposal
     */
    function createResearchProposal(
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 requestedAmount,
        uint256 duration,
        string memory researchCategory,
        uint256[] memory milestoneAmounts,
        string[] memory tags
    ) external payable nonReentrant returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(requestedAmount >= minimumProposalAmount, "Amount too low");
        require(requestedAmount <= maximumProposalAmount, "Amount too high");
        require(msg.value >= proposalFee, "Insufficient proposal fee");
        require(milestoneAmounts.length > 0, "Must have milestones");
        
        uint256 totalMilestoneAmount = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            totalMilestoneAmount += milestoneAmounts[i];
        }
        require(totalMilestoneAmount == requestedAmount, "Milestone amounts must sum to requested amount");

        uint256 proposalId = nextProposalId++;
        
        proposals[proposalId] = ResearchProposal({
            proposalId: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            requestedAmount: requestedAmount,
            duration: duration,
            researchCategory: researchCategory,
            milestones: new address[](milestoneAmounts.length),
            milestoneAmounts: milestoneAmounts,
            createdAt: block.timestamp,
            votingStartTime: 0,
            votingEndTime: 0,
            currentState: ProposalState.Pending,
            isExecuted: false,
            tags: tags
        });

        // Initialize milestones
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            milestones[proposalId][i].proposalId = proposalId;
            milestones[proposalId][i].milestoneIndex = i;
            milestones[proposalId][i].amount = milestoneAmounts[i];
            milestones[proposalId][i].isCompleted = false;
            milestones[proposalId][i].isApproved = false;
        }

        // Add to researcher's proposals
        researcherProposals[msg.sender].push(proposalId);
        categoryProposals[researchCategory].push(proposalId);

        emit ResearchProposalCreated(proposalId, msg.sender, title, requestedAmount);
        return proposalId;
    }

    /**
     * @dev Fund a research proposal
     */
    function fundProposal(uint256 proposalId) external payable nonReentrant {
        require(proposalId < nextProposalId, "Invalid proposal ID");
        require(msg.value > 0, "Must send funds");
        
        proposalFunding[proposalId].push(Funding({
            proposalId: proposalId,
            funder: msg.sender,
            amount: msg.value,
            fundedAt: block.timestamp,
            isRefunded: false
        }));

        totalFundsRaised += msg.value;
        emit ProposalFunded(proposalId, msg.sender, msg.value);
    }

    /**
     * @dev Complete a milestone
     */
    function completeMilestone(
        uint256 proposalId,
        uint256 milestoneIndex,
        string memory deliverableHash
    ) external {
        require(proposalId < nextProposalId, "Invalid proposal ID");
        require(proposals[proposalId].proposer == msg.sender, "Only proposer can complete milestones");
        require(!milestones[proposalId][milestoneIndex].isCompleted, "Milestone already completed");

        milestones[proposalId][milestoneIndex].isCompleted = true;
        milestones[proposalId][milestoneIndex].completedAt = block.timestamp;
        milestones[proposalId][milestoneIndex].deliverableHash = deliverableHash;

        emit MilestoneCompleted(proposalId, milestoneIndex, deliverableHash);
    }

    /**
     * @dev Approve a milestone (reviewers only)
     */
    function approveMilestone(uint256 proposalId, uint256 milestoneIndex) external onlyRole(REVIEWER_ROLE) {
        require(proposalId < nextProposalId, "Invalid proposal ID");
        require(milestones[proposalId][milestoneIndex].isCompleted, "Milestone not completed");
        require(!milestones[proposalId][milestoneIndex].reviewerApprovals[msg.sender], "Already approved");

        milestones[proposalId][milestoneIndex].reviewerApprovals[msg.sender] = true;
        milestones[proposalId][milestoneIndex].approvalCount++;

        // If majority approval, mark as approved and release funds
        if (milestones[proposalId][milestoneIndex].approvalCount >= 2) { // Require 2 approvals
            milestones[proposalId][milestoneIndex].isApproved = true;
            
            uint256 amount = milestones[proposalId][milestoneIndex].amount;
            address proposer = proposals[proposalId].proposer;
            
            // Transfer funds to proposer
            payable(proposer).transfer(amount);
            totalFundsDistributed += amount;
            
            // Update researcher reputation
            researchers[proposer].reputation += 10;
            
            emit MilestoneApproved(proposalId, milestoneIndex, amount);
        }
    }

    /**
     * @dev Register as a researcher
     */
    function registerResearcher(
        string memory name,
        string memory institution,
        string memory orcid
    ) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(institution).length > 0, "Institution cannot be empty");

        researchers[msg.sender] = Researcher({
            researcherAddress: msg.sender,
            name: name,
            institution: institution,
            orcid: orcid,
            reputation: 0,
            proposalIds: new uint256[](0),
            totalFundingReceived: 0,
            successfulProjects: 0,
            isVerified: false
        });

        emit ResearcherRegistered(msg.sender, name, institution);
    }

    // View functions
    function getProposal(uint256 proposalId) external view returns (ResearchProposal memory) {
        require(proposalId < nextProposalId, "Invalid proposal ID");
        return proposals[proposalId];
    }

    function getProposalFunding(uint256 proposalId) external view returns (Funding[] memory) {
        return proposalFunding[proposalId];
    }

    function getResearcher(address researcherAddress) external view returns (Researcher memory) {
        return researchers[researcherAddress];
    }

    function getProposalsByCategory(string memory category) external view returns (uint256[] memory) {
        return categoryProposals[category];
    }

    // Required overrides for OpenZeppelin v5
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId) public view override(Governor, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 