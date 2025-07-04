// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ResearchDAO
 * @dev Decentralized Autonomous Organization for research funding in the ResearchGraph AI ecosystem
 * Compatible with BIO Protocol standards for DeSci governance
 * Part of the ResearchGraph AI decentralized science platform
 */
contract ResearchDAO is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl,
    ReentrancyGuard,
    AccessControl
{
    bytes32 public constant RESEARCHER_ROLE = keccak256("RESEARCHER_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    struct ResearchProposal {
        uint256 proposalId;
        address researcher;
        string title;
        string description;
        string ipfsMetadata; // Detailed proposal on IPFS
        uint256 requestedFunding;
        uint256 timeline; // Duration in seconds
        Milestone[] milestones;
        ProposalStatus status;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 completedAt;
        string[] deliverables; // IPFS hashes of deliverables
    }

    struct Milestone {
        string description;
        uint256 fundingPercentage; // Basis points (10000 = 100%)
        uint256 deadline; // Timestamp
        bool completed;
        string deliverable; // IPFS hash
    }

    enum ProposalStatus {
        Draft,
        Submitted,
        UnderReview,
        Voting,
        Approved,
        Rejected,
        Funded,
        InProgress,
        Completed,
        Cancelled
    }

    struct Researcher {
        address wallet;
        string did; // Decentralized Identifier
        string profile; // IPFS hash of profile
        uint256 reputation;
        uint256[] proposalIds;
        uint256[] completedProjects;
        bool isVerified;
    }

    // State variables
    IERC20 public governanceToken;
    IERC20 public fundingToken; // Token used for funding (e.g., USDC, DAI)
    uint256 public totalFundsAvailable;
    uint256 public totalFundsAllocated;
    uint256 public minimumProposalStake;
    uint256 public maximumFundingAmount;
    
    // Mappings
    mapping(uint256 => ResearchProposal) public proposals;
    mapping(address => Researcher) public researchers;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public stakedAmounts;
    
    uint256 private _proposalCounter;

    // Events
    event ProposalSubmitted(
        uint256 indexed proposalId,
        address indexed researcher,
        string title,
        uint256 requestedFunding
    );
    
    event ProposalFunded(
        uint256 indexed proposalId,
        uint256 amount
    );
    
    event MilestoneCompleted(
        uint256 indexed proposalId,
        uint256 milestoneIndex,
        string deliverable
    );
    
    event ResearcherRegistered(
        address indexed researcher,
        string did
    );
    
    event FundsDeposited(
        address indexed depositor,
        uint256 amount
    );

    constructor(
        IVotes _token,
        TimelockController _timelock,
        IERC20 _fundingToken,
        uint256 _minimumStake,
        uint256 _maximumFunding
    )
        Governor("ResearchDAO")
        GovernorSettings(1, 45818, 0) // 1 block voting delay, ~1 week voting period
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {
        governanceToken = IERC20(address(_token));
        fundingToken = _fundingToken;
        minimumProposalStake = _minimumStake;
        maximumFundingAmount = _maximumFunding;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register as a researcher in the DAO
     * @param did Decentralized Identifier
     * @param profileHash IPFS hash of researcher profile
     */
    function registerResearcher(
        string memory did,
        string memory profileHash
    ) external {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(researchers[msg.sender].wallet == address(0), "Already registered");

        researchers[msg.sender] = Researcher({
            wallet: msg.sender,
            did: did,
            profile: profileHash,
            reputation: 100, // Starting reputation
            proposalIds: new uint256[](0),
            completedProjects: new uint256[](0),
            isVerified: false
        });

        _grantRole(RESEARCHER_ROLE, msg.sender);
        emit ResearcherRegistered(msg.sender, did);
    }

    /**
     * @dev Submit a research proposal
     * @param title Proposal title
     * @param description Brief description
     * @param ipfsMetadata IPFS hash of detailed proposal
     * @param requestedFunding Amount of funding requested
     * @param timeline Duration in seconds
     * @param milestones Array of milestones
     */
    function submitProposal(
        string memory title,
        string memory description,
        string memory ipfsMetadata,
        uint256 requestedFunding,
        uint256 timeline,
        Milestone[] memory milestones
    ) external onlyRole(RESEARCHER_ROLE) returns (uint256) {
        require(requestedFunding <= maximumFundingAmount, "Exceeds maximum funding");
        require(requestedFunding <= totalFundsAvailable - totalFundsAllocated, "Insufficient funds available");
        require(milestones.length > 0, "Must have at least one milestone");
        require(_validateMilestones(milestones), "Invalid milestones");

        // Stake tokens for proposal
        require(
            governanceToken.transferFrom(msg.sender, address(this), minimumProposalStake),
            "Failed to stake tokens"
        );
        stakedAmounts[msg.sender] += minimumProposalStake;

        uint256 proposalId = _proposalCounter++;
        
        proposals[proposalId] = ResearchProposal({
            proposalId: proposalId,
            researcher: msg.sender,
            title: title,
            description: description,
            ipfsMetadata: ipfsMetadata,
            requestedFunding: requestedFunding,
            timeline: timeline,
            milestones: milestones,
            status: ProposalStatus.Submitted,
            createdAt: block.timestamp,
            fundedAt: 0,
            completedAt: 0,
            deliverables: new string[](0)
        });

        researchers[msg.sender].proposalIds.push(proposalId);

        emit ProposalSubmitted(proposalId, msg.sender, title, requestedFunding);
        return proposalId;
    }

    /**
     * @dev Fund an approved proposal
     * @param proposalId ID of the proposal to fund
     */
    function fundProposal(uint256 proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ResearchProposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Approved, "Proposal not approved");
        require(proposal.requestedFunding <= totalFundsAvailable - totalFundsAllocated, "Insufficient funds");

        proposal.status = ProposalStatus.Funded;
        proposal.fundedAt = block.timestamp;
        totalFundsAllocated += proposal.requestedFunding;

        // Release initial funding (first milestone)
        if (proposal.milestones.length > 0) {
            uint256 initialFunding = (proposal.requestedFunding * proposal.milestones[0].fundingPercentage) / 10000;
            require(
                fundingToken.transfer(proposal.researcher, initialFunding),
                "Failed to transfer initial funding"
            );
        }

        // Return staked tokens
        stakedAmounts[proposal.researcher] -= minimumProposalStake;
        require(
            governanceToken.transfer(proposal.researcher, minimumProposalStake),
            "Failed to return staked tokens"
        );

        emit ProposalFunded(proposalId, proposal.requestedFunding);
    }

    /**
     * @dev Complete a milestone and release funding
     * @param proposalId ID of the proposal
     * @param milestoneIndex Index of the milestone
     * @param deliverable IPFS hash of the deliverable
     */
    function completeMilestone(
        uint256 proposalId,
        uint256 milestoneIndex,
        string memory deliverable
    ) external {
        ResearchProposal storage proposal = proposals[proposalId];
        require(proposal.researcher == msg.sender, "Not the proposal researcher");
        require(proposal.status == ProposalStatus.Funded || proposal.status == ProposalStatus.InProgress, "Invalid status");
        require(milestoneIndex < proposal.milestones.length, "Invalid milestone index");
        require(!proposal.milestones[milestoneIndex].completed, "Milestone already completed");

        proposal.milestones[milestoneIndex].completed = true;
        proposal.milestones[milestoneIndex].deliverable = deliverable;
        proposal.deliverables.push(deliverable);

        // Release milestone funding
        uint256 funding = (proposal.requestedFunding * proposal.milestones[milestoneIndex].fundingPercentage) / 10000;
        if (milestoneIndex > 0) { // First milestone already funded
            require(
                fundingToken.transfer(proposal.researcher, funding),
                "Failed to transfer milestone funding"
            );
        }

        // Check if all milestones completed
        bool allCompleted = true;
        for (uint256 i = 0; i < proposal.milestones.length; i++) {
            if (!proposal.milestones[i].completed) {
                allCompleted = false;
                break;
            }
        }

        if (allCompleted) {
            proposal.status = ProposalStatus.Completed;
            proposal.completedAt = block.timestamp;
            researchers[proposal.researcher].completedProjects.push(proposalId);
            
            // Increase researcher reputation
            researchers[proposal.researcher].reputation += 50;
        } else {
            proposal.status = ProposalStatus.InProgress;
        }

        emit MilestoneCompleted(proposalId, milestoneIndex, deliverable);
    }

    /**
     * @dev Deposit funds to the DAO treasury
     * @param amount Amount to deposit
     */
    function depositFunds(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(
            fundingToken.transferFrom(msg.sender, address(this), amount),
            "Failed to transfer funds"
        );
        
        totalFundsAvailable += amount;
        emit FundsDeposited(msg.sender, amount);
    }

    /**
     * @dev Get proposal details
     * @param proposalId ID of the proposal
     */
    function getProposal(uint256 proposalId) external view returns (ResearchProposal memory) {
        return proposals[proposalId];
    }

    /**
     * @dev Get researcher details
     * @param researcher Address of the researcher
     */
    function getResearcher(address researcher) external view returns (Researcher memory) {
        return researchers[researcher];
    }

    /**
     * @dev Get all proposals by a researcher
     * @param researcher Address of the researcher
     */
    function getResearcherProposals(address researcher) external view returns (uint256[] memory) {
        return researchers[researcher].proposalIds;
    }

    // Internal functions

    function _validateMilestones(Milestone[] memory milestones) internal pure returns (bool) {
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < milestones.length; i++) {
            totalPercentage += milestones[i].fundingPercentage;
        }
        return totalPercentage == 10000; // Must sum to 100%
    }

    // Override functions required by Solidity

    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber) public view override(IGovernor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
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

    function supportsInterface(bytes4 interfaceId) public view override(Governor, GovernorTimelockControl, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 