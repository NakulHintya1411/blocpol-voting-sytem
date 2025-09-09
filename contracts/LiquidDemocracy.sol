// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/CryptographicUtils.sol";

/**
 * @title LiquidDemocracy
 * @dev Implements liquid democracy with vote delegation capabilities
 * @notice Allows voters to delegate their voting power to trusted representatives
 */
contract LiquidDemocracy is Ownable, ReentrancyGuard {
    using CryptographicUtils for *;

    // --- Structs ---
    struct Voter {
        address voterAddress;
        uint256 votingPower;           // Base voting power
        uint256 delegatedPower;        // Power received from delegations
        uint256 totalPower;            // votingPower + delegatedPower
        address delegate;              // Who this voter delegates to
        address[] delegates;           // Who delegates to this voter
        bool isActive;                 // Whether voter is active
        uint256 lastVoteTime;          // Last time they voted
        uint256 delegationCount;       // Number of active delegations
    }

    struct Delegation {
        address from;
        address to;
        uint256 power;
        uint256 timestamp;
        bool isActive;
        uint256 delegationId;
    }

    struct Vote {
        address voter;
        uint256 candidateId;
        uint256 powerUsed;
        uint256 timestamp;
        bytes32 voteHash;
        bool isDelegated;
    }

    // --- State Variables ---
    mapping(address => Voter) private voters;
    mapping(uint256 => Delegation) private delegations;
    mapping(address => uint256[]) private voterDelegations;
    mapping(uint256 => Vote[]) private candidateVotes;
    mapping(address => mapping(uint256 => bool)) private hasVoted;
    
    address[] private registeredVoters;
    uint256 private delegationCounter;
    uint256 private totalVotingPower;
    uint256 private activeDelegations;
    
    bool public votingActive;
    uint256 public votingStartTime;
    uint256 public votingEndTime;
    uint256 public maxDelegationDepth;
    uint256 public minDelegationPower;
    
    // --- Events ---
    event VoterRegistered(address indexed voter, uint256 power, uint256 timestamp);
    event DelegationCreated(
        address indexed from, 
        address indexed to, 
        uint256 power, 
        uint256 delegationId,
        uint256 timestamp
    );
    event DelegationRevoked(
        address indexed from, 
        address indexed to, 
        uint256 delegationId,
        uint256 timestamp
    );
    event VoteCast(
        address indexed voter, 
        uint256 candidateId, 
        uint256 powerUsed, 
        bool isDelegated,
        uint256 timestamp
    );
    event VotingSessionStarted(uint256 startTime, uint256 endTime);
    event VotingSessionEnded(uint256 endTime);
    event DelegationChainUpdated(address indexed voter, uint256 newTotalPower);

    // --- Modifiers ---
    modifier onlyRegisteredVoter(address voter) {
        require(voters[voter].isActive, "Voter not registered");
        _;
    }

    modifier onlyDuringVoting() {
        require(votingActive, "Voting not active");
        require(block.timestamp >= votingStartTime && block.timestamp <= votingEndTime, "Outside voting period");
        _;
    }

    modifier onlyValidDelegation(address from, address to) {
        require(from != to, "Cannot delegate to self");
        require(voters[from].isActive, "Delegator not registered");
        require(voters[to].isActive, "Delegate not registered");
        require(voters[from].delegate == address(0), "Already has delegate");
        _;
    }

    // --- Constructor ---
    constructor(
        uint256 _maxDelegationDepth,
        uint256 _minDelegationPower
    ) Ownable(msg.sender) {
        maxDelegationDepth = _maxDelegationDepth;
        minDelegationPower = _minDelegationPower;
        delegationCounter = 0;
        activeDelegations = 0;
        totalVotingPower = 0;
    }

    // --- Core Functions ---

    /**
     * @dev Registers a new voter with base voting power
     * @param voter The voter address
     * @param power The base voting power
     */
    function registerVoter(address voter, uint256 power) external onlyOwner {
        require(!voters[voter].isActive, "Voter already registered");
        require(power > 0, "Power must be greater than 0");
        
        Voter memory newVoter = Voter({
            voterAddress: voter,
            votingPower: power,
            delegatedPower: 0,
            totalPower: power,
            delegate: address(0),
            delegates: new address[](0),
            isActive: true,
            lastVoteTime: 0,
            delegationCount: 0
        });
        
        voters[voter] = newVoter;
        registeredVoters.push(voter);
        totalVotingPower += power;
        
        emit VoterRegistered(voter, power, block.timestamp);
    }

    /**
     * @dev Creates a delegation from one voter to another
     * @param delegate The address to delegate to
     * @param power The amount of power to delegate
     * @return delegationId The ID of the created delegation
     */
    function createDelegation(
        address delegate, 
        uint256 power
    ) external 
        onlyRegisteredVoter(msg.sender)
        onlyValidDelegation(msg.sender, delegate)
        returns (uint256 delegationId) 
    {
        require(power >= minDelegationPower, "Power below minimum");
        require(power <= voters[msg.sender].votingPower, "Insufficient power");
        require(!hasDelegationChain(msg.sender, delegate), "Circular delegation detected");
        
        delegationId = delegationCounter++;
        
        Delegation memory newDelegation = Delegation({
            from: msg.sender,
            to: delegate,
            power: power,
            timestamp: block.timestamp,
            isActive: true,
            delegationId: delegationId
        });
        
        delegations[delegationId] = newDelegation;
        voterDelegations[msg.sender].push(delegationId);
        
        // Update voter states
        voters[msg.sender].delegate = delegate;
        voters[msg.sender].votingPower -= power;
        voters[delegate].delegatedPower += power;
        voters[delegate].delegates.push(msg.sender);
        voters[delegate].delegationCount++;
        
        // Update total powers
        updateTotalPower(msg.sender);
        updateTotalPower(delegate);
        
        activeDelegations++;
        
        emit DelegationCreated(msg.sender, delegate, power, delegationId, block.timestamp);
        
        return delegationId;
    }

    /**
     * @dev Revokes an active delegation
     * @param delegationId The ID of the delegation to revoke
     */
    function revokeDelegation(uint256 delegationId) external nonReentrant {
        Delegation storage delegation = delegations[delegationId];
        require(delegation.isActive, "Delegation not active");
        require(delegation.from == msg.sender, "Not the delegator");
        
        delegation.isActive = false;
        
        // Update voter states
        voters[msg.sender].delegate = address(0);
        voters[msg.sender].votingPower += delegation.power;
        voters[delegation.to].delegatedPower -= delegation.power;
        voters[delegation.to].delegationCount--;
        
        // Remove from delegates array
        removeFromDelegates(delegation.to, msg.sender);
        
        // Update total powers
        updateTotalPower(msg.sender);
        updateTotalPower(delegation.to);
        
        activeDelegations--;
        
        emit DelegationRevoked(msg.sender, delegation.to, delegationId, block.timestamp);
    }

    /**
     * @dev Casts a vote using available voting power
     * @param candidateId The candidate to vote for
     * @param power The amount of power to use
     */
    function vote(uint256 candidateId, uint256 power) 
        external 
        onlyRegisteredVoter(msg.sender)
        onlyDuringVoting 
    {
        require(!hasVoted[msg.sender][candidateId], "Already voted for this candidate");
        require(power > 0, "Power must be greater than 0");
        require(power <= voters[msg.sender].totalPower, "Insufficient voting power");
        
        // Create vote
        Vote memory newVote = Vote({
            voter: msg.sender,
            candidateId: candidateId,
            powerUsed: power,
            timestamp: block.timestamp,
            voteHash: CryptographicUtils.createVoteHash(msg.sender, bytes32(candidateId), block.timestamp),
            isDelegated: voters[msg.sender].delegatedPower > 0
        });
        
        candidateVotes[candidateId].push(newVote);
        hasVoted[msg.sender][candidateId] = true;
        voters[msg.sender].lastVoteTime = block.timestamp;
        
        emit VoteCast(msg.sender, candidateId, power, newVote.isDelegated, block.timestamp);
    }

    // --- Admin Functions ---

    /**
     * @dev Starts a voting session
     * @param durationSeconds Duration of the voting session
     */
    function startVotingSession(uint256 durationSeconds) external onlyOwner {
        require(!votingActive, "Voting already active");
        votingActive = true;
        votingStartTime = block.timestamp;
        votingEndTime = block.timestamp + durationSeconds;
        emit VotingSessionStarted(votingStartTime, votingEndTime);
    }

    /**
     * @dev Ends the current voting session
     */
    function endVotingSession() external onlyOwner {
        require(votingActive, "Voting not active");
        votingActive = false;
        votingEndTime = block.timestamp;
        emit VotingSessionEnded(votingEndTime);
    }

    /**
     * @dev Updates delegation parameters
     * @param _maxDelegationDepth New maximum delegation depth
     * @param _minDelegationPower New minimum delegation power
     */
    function updateDelegationParameters(
        uint256 _maxDelegationDepth,
        uint256 _minDelegationPower
    ) external onlyOwner {
        maxDelegationDepth = _maxDelegationDepth;
        minDelegationPower = _minDelegationPower;
    }

    // --- View Functions ---

    /**
     * @dev Gets voter information
     * @param voter The voter address
     * @return The voter structure
     */
    function getVoter(address voter) external view returns (Voter memory) {
        return voters[voter];
    }

    /**
     * @dev Gets delegation information
     * @param delegationId The delegation ID
     * @return The delegation structure
     */
    function getDelegation(uint256 delegationId) external view returns (Delegation memory) {
        return delegations[delegationId];
    }

    /**
     * @dev Gets all votes for a candidate
     * @param candidateId The candidate ID
     * @return Array of votes
     */
    function getCandidateVotes(uint256 candidateId) external view returns (Vote[] memory) {
        return candidateVotes[candidateId];
    }

    /**
     * @dev Gets total votes for a candidate
     * @param candidateId The candidate ID
     * @return Total voting power used
     */
    function getCandidateTotalVotes(uint256 candidateId) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < candidateVotes[candidateId].length; i++) {
            total += candidateVotes[candidateId][i].powerUsed;
        }
        return total;
    }

    /**
     * @dev Gets all registered voters
     * @return Array of voter addresses
     */
    function getRegisteredVoters() external view returns (address[] memory) {
        return registeredVoters;
    }

    /**
     * @dev Gets delegations for a voter
     * @param voter The voter address
     * @return Array of delegation IDs
     */
    function getVoterDelegations(address voter) external view returns (uint256[] memory) {
        return voterDelegations[voter];
    }

    /**
     * @dev Checks if a voter has voted for a candidate
     * @param voter The voter address
     * @param candidateId The candidate ID
     * @return Whether the voter has voted
     */
    function hasVoterVoted(address voter, uint256 candidateId) external view returns (bool) {
        return hasVoted[voter][candidateId];
    }

    /**
     * @dev Gets total voting power in the system
     * @return Total voting power
     */
    function getTotalVotingPower() external view returns (uint256) {
        return totalVotingPower;
    }

    /**
     * @dev Gets active delegations count
     * @return Number of active delegations
     */
    function getActiveDelegations() external view returns (uint256) {
        return activeDelegations;
    }

    // --- Internal Functions ---

    /**
     * @dev Updates total power for a voter
     * @param voter The voter address
     */
    function updateTotalPower(address voter) internal {
        voters[voter].totalPower = voters[voter].votingPower + voters[voter].delegatedPower;
        emit DelegationChainUpdated(voter, voters[voter].totalPower);
    }

    /**
     * @dev Checks for circular delegation chains
     * @param from Starting address
     * @param to Target address
     * @return Whether a circular delegation exists
     */
    function hasDelegationChain(address from, address to) internal view returns (bool) {
        if (from == to) return true;
        
        address current = to;
        uint256 depth = 0;
        
        while (voters[current].delegate != address(0) && depth < maxDelegationDepth) {
            current = voters[current].delegate;
            if (current == from) return true;
            depth++;
        }
        
        return false;
    }

    /**
     * @dev Removes a delegate from the delegates array
     * @param voter The voter address
     * @param delegate The delegate to remove
     */
    function removeFromDelegates(address voter, address delegate) internal {
        address[] storage delegates = voters[voter].delegates;
        for (uint256 i = 0; i < delegates.length; i++) {
            if (delegates[i] == delegate) {
                delegates[i] = delegates[delegates.length - 1];
                delegates.pop();
                break;
            }
        }
    }
} 