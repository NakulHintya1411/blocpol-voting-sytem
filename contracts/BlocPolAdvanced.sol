// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./libraries/CryptographicUtils.sol";
import "./ZKProofVerifier.sol";
import "./LiquidDemocracy.sol";
import "./VoteMixing.sol";

/**
 * @title BlocPolAdvanced
 * @dev Advanced blockchain voting system with ZK-proofs, liquid democracy, and vote mixing
 * @notice Comprehensive voting system with privacy, scalability, and transparency features
 */
contract BlocPolAdvanced is Ownable, ReentrancyGuard, Pausable {
    using CryptographicUtils for *;

    // --- Structs ---
    struct Candidate {
        uint256 id;
        string name;
        string ipfsHash;
        uint256 voteCount;
        uint256 delegatedVoteCount;
        bool isActive;
        uint256 registrationTime;
    }

    struct AdvancedVote {
        address voter;
        uint256 candidateId;
        uint256[] rankedChoices;      // For ranked choice voting
        bytes32 commitmentHash;       // For commitment scheme
        bytes32 zkProofHash;          // For ZK-proof verification
        bytes32 mixedVoteHash;        // For vote mixing
        uint256 votingPower;          // For liquid democracy
        uint256 timestamp;
        bool isRevealed;
        VoteType voteType;
    }

    struct VotingSession {
        uint256 sessionId;
        uint256 startTime;
        uint256 endTime;
        uint256 revealTime;
        bool isActive;
        bool isRevealed;
        uint256 totalVotes;
        uint256 totalVotingPower;
        VotingMode mode;
        bytes32 merkleRoot;
    }

    struct AuditTrail {
        bytes32 actionHash;
        address actor;
        string action;
        uint256 timestamp;
        bytes32[] proof;
    }

    enum VoteType {
        DIRECT,         // Direct vote
        DELEGATED,      // Delegated vote
        MIXED,          // Mixed vote
        ZK_PROOF        // Zero-knowledge proof vote
    }

    enum VotingMode {
        SIMPLE_MAJORITY,
        RANKED_CHOICE,
        LIQUID_DEMOCRACY,
        MIXED_ANONYMOUS
    }

    // --- State Variables ---
    mapping(uint256 => Candidate) private candidates;
    mapping(uint256 => AdvancedVote) private votes;
    mapping(uint256 => VotingSession) private votingSessions;
    mapping(address => mapping(uint256 => bool)) private hasVoted;
    mapping(address => uint256[]) private voterVotes;
    mapping(bytes32 => AuditTrail) private auditTrails;
    
    uint256 private candidateCounter;
    uint256 private voteCounter;
    uint256 private sessionCounter;
    uint256 private auditCounter;
    
    // Contract references
    ZKProofVerifier public zkProofVerifier;
    LiquidDemocracy public liquidDemocracy;
    VoteMixing public voteMixing;
    
    // Configuration
    uint256 public minVotingPower;
    uint256 public maxVotingPower;
    uint256 public commitmentPeriod;
    uint256 public revealPeriod;
    bool public zkProofsEnabled;
    bool public liquidDemocracyEnabled;
    bool public voteMixingEnabled;
    
    // --- Events ---
    event CandidateRegistered(uint256 indexed candidateId, string name, string ipfsHash, uint256 timestamp);
    event VotingSessionCreated(uint256 indexed sessionId, VotingMode mode, uint256 startTime, uint256 endTime);
    event VoteCast(address indexed voter, uint256 indexed candidateId, VoteType voteType, uint256 timestamp);
    event VoteRevealed(address indexed voter, uint256 indexed candidateId, uint256 timestamp);
    event VotingSessionEnded(uint256 indexed sessionId, uint256 totalVotes, uint256 timestamp);
    event AuditLogCreated(bytes32 indexed actionHash, address indexed actor, string action, uint256 timestamp);
    event ZKProofVerified(bytes32 indexed proofHash, bool isValid, uint256 timestamp);
    event DelegationCreated(address indexed from, address indexed to, uint256 power, uint256 timestamp);
    event VoteMixed(bytes32 indexed originalVote, bytes32 indexed mixedVote, uint256 timestamp);

    // --- Modifiers ---
    modifier onlyActiveSession(uint256 sessionId) {
        require(votingSessions[sessionId].isActive, "Session not active");
        _;
    }

    modifier onlyValidCandidate(uint256 candidateId) {
        require(candidates[candidateId].isActive, "Invalid candidate");
        _;
    }

    modifier onlyValidVotingPower(uint256 power) {
        require(power >= minVotingPower && power <= maxVotingPower, "Invalid voting power");
        _;
    }

    // --- Constructor ---
    constructor(
        address _zkProofVerifier,
        address _liquidDemocracy,
        address _voteMixing,
        uint256 _minVotingPower,
        uint256 _maxVotingPower,
        uint256 _commitmentPeriod,
        uint256 _revealPeriod
    ) Ownable(msg.sender) {
        zkProofVerifier = ZKProofVerifier(_zkProofVerifier);
        liquidDemocracy = LiquidDemocracy(_liquidDemocracy);
        voteMixing = VoteMixing(_voteMixing);
        
        minVotingPower = _minVotingPower;
        maxVotingPower = _maxVotingPower;
        commitmentPeriod = _commitmentPeriod;
        revealPeriod = _revealPeriod;
        
        candidateCounter = 0;
        voteCounter = 0;
        sessionCounter = 0;
        auditCounter = 0;
        
        zkProofsEnabled = true;
        liquidDemocracyEnabled = true;
        voteMixingEnabled = true;
    }

    // --- Core Functions ---

    /**
     * @dev Registers a new candidate
     * @param name Candidate name
     * @param ipfsHash IPFS hash for candidate profile
     * @return candidateId The ID of the registered candidate
     */
    function registerCandidate(
        string calldata name,
        string calldata ipfsHash
    ) external onlyOwner returns (uint256 candidateId) {
        candidateId = candidateCounter++;
        
        candidates[candidateId] = Candidate({
            id: candidateId,
            name: name,
            ipfsHash: ipfsHash,
            voteCount: 0,
            delegatedVoteCount: 0,
            isActive: true,
            registrationTime: block.timestamp
        });
        
        logAuditTrail("CANDIDATE_REGISTERED", abi.encodePacked(candidateId, name, ipfsHash));
        
        emit CandidateRegistered(candidateId, name, ipfsHash, block.timestamp);
        
        return candidateId;
    }

    /**
     * @dev Creates a new voting session
     * @param durationSeconds Duration of the voting session
     * @param mode Voting mode to use
     * @return sessionId The ID of the created session
     */
    function createVotingSession(
        uint256 durationSeconds,
        VotingMode mode
    ) external onlyOwner returns (uint256 sessionId) {
        sessionId = sessionCounter++;
        
        VotingSession memory newSession = VotingSession({
            sessionId: sessionId,
            startTime: block.timestamp,
            endTime: block.timestamp + durationSeconds,
            revealTime: block.timestamp + durationSeconds + revealPeriod,
            isActive: true,
            isRevealed: false,
            totalVotes: 0,
            totalVotingPower: 0,
            mode: mode,
            merkleRoot: bytes32(0)
        });
        
        votingSessions[sessionId] = newSession;
        
        logAuditTrail("VOTING_SESSION_CREATED", abi.encodePacked(sessionId, mode, durationSeconds));
        
        emit VotingSessionCreated(sessionId, mode, newSession.startTime, newSession.endTime);
        
        return sessionId;
    }

    /**
     * @dev Casts a vote with commitment scheme
     * @param sessionId The voting session ID
     * @param candidateId The candidate to vote for
     * @param commitmentHash Commitment hash of the vote
     * @param votingPower The voting power to use
     * @return voteId The ID of the cast vote
     */
    function castVote(
        uint256 sessionId,
        uint256 candidateId,
        bytes32 commitmentHash,
        uint256 votingPower
    ) external 
        onlyActiveSession(sessionId)
        onlyValidCandidate(candidateId)
        onlyValidVotingPower(votingPower)
        returns (uint256 voteId) 
    {
        require(!hasVoted[msg.sender][sessionId], "Already voted in this session");
        require(block.timestamp <= votingSessions[sessionId].endTime, "Voting period ended");
        
        voteId = voteCounter++;
        
        AdvancedVote memory newVote = AdvancedVote({
            voter: msg.sender,
            candidateId: candidateId,
            rankedChoices: new uint256[](0),
            commitmentHash: commitmentHash,
            zkProofHash: bytes32(0),
            mixedVoteHash: bytes32(0),
            votingPower: votingPower,
            timestamp: block.timestamp,
            isRevealed: false,
            voteType: VoteType.DIRECT
        });
        
        votes[voteId] = newVote;
        hasVoted[msg.sender][sessionId] = true;
        voterVotes[msg.sender].push(voteId);
        
        // Update session statistics
        votingSessions[sessionId].totalVotes++;
        votingSessions[sessionId].totalVotingPower += votingPower;
        
        logAuditTrail("VOTE_CAST", abi.encodePacked(voteId, sessionId, candidateId, votingPower));
        
        emit VoteCast(msg.sender, candidateId, VoteType.DIRECT, block.timestamp);
        
        return voteId;
    }

    /**
     * @dev Casts a vote with ZK-proof verification
     * @param sessionId The voting session ID
     * @param candidateId The candidate to vote for
     * @param zkProofHash ZK-proof hash
     * @param votingPower The voting power to use
     * @return voteId The ID of the cast vote
     */
    function castZKVote(
        uint256 sessionId,
        uint256 candidateId,
        bytes32 zkProofHash,
        uint256 votingPower
    ) external 
        onlyActiveSession(sessionId)
        onlyValidCandidate(candidateId)
        onlyValidVotingPower(votingPower)
        returns (uint256 voteId) 
    {
        require(zkProofsEnabled, "ZK-proofs disabled");
        require(!hasVoted[msg.sender][sessionId], "Already voted in this session");
        
        voteId = voteCounter++;
        
        AdvancedVote memory newVote = AdvancedVote({
            voter: msg.sender,
            candidateId: candidateId,
            rankedChoices: new uint256[](0),
            commitmentHash: bytes32(0),
            zkProofHash: zkProofHash,
            mixedVoteHash: bytes32(0),
            votingPower: votingPower,
            timestamp: block.timestamp,
            isRevealed: false,
            voteType: VoteType.ZK_PROOF
        });
        
        votes[voteId] = newVote;
        hasVoted[msg.sender][sessionId] = true;
        voterVotes[msg.sender].push(voteId);
        
        // Update session statistics
        votingSessions[sessionId].totalVotes++;
        votingSessions[sessionId].totalVotingPower += votingPower;
        
        logAuditTrail("ZK_VOTE_CAST", abi.encodePacked(voteId, sessionId, candidateId, zkProofHash));
        
        emit VoteCast(msg.sender, candidateId, VoteType.ZK_PROOF, block.timestamp);
        
        return voteId;
    }

    /**
     * @dev Casts a delegated vote using liquid democracy
     * @param sessionId The voting session ID
     * @param candidateId The candidate to vote for
     * @param votingPower The voting power to use
     * @return voteId The ID of the cast vote
     */
    function castDelegatedVote(
        uint256 sessionId,
        uint256 candidateId,
        uint256 votingPower
    ) external 
        onlyActiveSession(sessionId)
        onlyValidCandidate(candidateId)
        onlyValidVotingPower(votingPower)
        returns (uint256 voteId) 
    {
        require(liquidDemocracyEnabled, "Liquid democracy disabled");
        require(!hasVoted[msg.sender][sessionId], "Already voted in this session");
        
        // Verify voter has sufficient power in liquid democracy
        LiquidDemocracy.Voter memory voter = liquidDemocracy.getVoter(msg.sender);
        require(voter.totalPower >= votingPower, "Insufficient voting power");
        
        voteId = voteCounter++;
        
        AdvancedVote memory newVote = AdvancedVote({
            voter: msg.sender,
            candidateId: candidateId,
            rankedChoices: new uint256[](0),
            commitmentHash: bytes32(0),
            zkProofHash: bytes32(0),
            mixedVoteHash: bytes32(0),
            votingPower: votingPower,
            timestamp: block.timestamp,
            isRevealed: false,
            voteType: VoteType.DELEGATED
        });
        
        votes[voteId] = newVote;
        hasVoted[msg.sender][sessionId] = true;
        voterVotes[msg.sender].push(voteId);
        
        // Update session statistics
        votingSessions[sessionId].totalVotes++;
        votingSessions[sessionId].totalVotingPower += votingPower;
        
        logAuditTrail("DELEGATED_VOTE_CAST", abi.encodePacked(voteId, sessionId, candidateId, votingPower));
        
        emit VoteCast(msg.sender, candidateId, VoteType.DELEGATED, block.timestamp);
        
        return voteId;
    }

    /**
     * @dev Reveals a committed vote
     * @param voteId The vote ID to reveal
     * @param originalVote The original vote value
     * @param randomness The randomness used in commitment
     */
    function revealVote(
        uint256 voteId,
        bytes32 originalVote,
        bytes32 randomness
    ) external {
        AdvancedVote storage vote = votes[voteId];
        require(vote.voter == msg.sender, "Not your vote");
        require(!vote.isRevealed, "Vote already revealed");
        require(vote.voteType == VoteType.DIRECT, "Not a direct vote");
        
        // Verify commitment
        require(CryptographicUtils.verifyCommitment(originalVote, randomness, vote.commitmentHash), "Invalid commitment");
        
        vote.isRevealed = true;
        
        // Update candidate vote count
        candidates[vote.candidateId].voteCount += vote.votingPower;
        
        logAuditTrail("VOTE_REVEALED", abi.encodePacked(voteId, originalVote));
        
        emit VoteRevealed(msg.sender, vote.candidateId, block.timestamp);
    }

    /**
     * @dev Ends a voting session and calculates results
     * @param sessionId The session ID to end
     */
    function endVotingSession(uint256 sessionId) external onlyOwner {
        VotingSession storage session = votingSessions[sessionId];
        require(session.isActive, "Session not active");
        require(block.timestamp >= session.endTime, "Session not ended");
        
        session.isActive = false;
        
        // Create Merkle root from all votes
        bytes32[] memory voteHashes = new bytes32[](session.totalVotes);
        for (uint256 i = 0; i < session.totalVotes; i++) {
            voteHashes[i] = keccak256(abi.encodePacked(i, votes[i].voter, votes[i].candidateId));
        }
        session.merkleRoot = CryptographicUtils.createMerkleRootFromMemory(voteHashes);
        
        logAuditTrail("VOTING_SESSION_ENDED", abi.encodePacked(sessionId, session.totalVotes, session.totalVotingPower));
        
        emit VotingSessionEnded(sessionId, session.totalVotes, block.timestamp);
    }

    // --- View Functions ---

    /**
     * @dev Gets candidate information
     * @param candidateId The candidate ID
     * @return The candidate structure
     */
    function getCandidate(uint256 candidateId) external view returns (Candidate memory) {
        return candidates[candidateId];
    }

    /**
     * @dev Gets all candidates
     * @return Array of candidate structures
     */
    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateCounter);
        for (uint256 i = 0; i < candidateCounter; i++) {
            allCandidates[i] = candidates[i];
        }
        return allCandidates;
    }

    /**
     * @dev Gets vote information
     * @param voteId The vote ID
     * @return The vote structure
     */
    function getVote(uint256 voteId) external view returns (AdvancedVote memory) {
        return votes[voteId];
    }

    /**
     * @dev Gets voting session information
     * @param sessionId The session ID
     * @return The session structure
     */
    function getVotingSession(uint256 sessionId) external view returns (VotingSession memory) {
        return votingSessions[sessionId];
    }

    /**
     * @dev Gets all votes for a voter
     * @param voter The voter address
     * @return Array of vote IDs
     */
    function getVoterVotes(address voter) external view returns (uint256[] memory) {
        return voterVotes[voter];
    }

    /**
     * @dev Checks if a voter has voted in a session
     * @param voter The voter address
     * @param sessionId The session ID
     * @return Whether the voter has voted
     */
    function hasVoterVoted(address voter, uint256 sessionId) external view returns (bool) {
        return hasVoted[voter][sessionId];
    }

    /**
     * @dev Gets audit trail information
     * @param actionHash The action hash
     * @return The audit trail structure
     */
    function getAuditTrail(bytes32 actionHash) external view returns (AuditTrail memory) {
        return auditTrails[actionHash];
    }

    // --- Admin Functions ---

    /**
     * @dev Updates voting parameters
     * @param _minVotingPower New minimum voting power
     * @param _maxVotingPower New maximum voting power
     * @param _commitmentPeriod New commitment period
     * @param _revealPeriod New reveal period
     */
    function updateVotingParameters(
        uint256 _minVotingPower,
        uint256 _maxVotingPower,
        uint256 _commitmentPeriod,
        uint256 _revealPeriod
    ) external onlyOwner {
        minVotingPower = _minVotingPower;
        maxVotingPower = _maxVotingPower;
        commitmentPeriod = _commitmentPeriod;
        revealPeriod = _revealPeriod;
    }

    /**
     * @dev Enables or disables features
     * @param _zkProofsEnabled Whether ZK-proofs are enabled
     * @param _liquidDemocracyEnabled Whether liquid democracy is enabled
     * @param _voteMixingEnabled Whether vote mixing is enabled
     */
    function setFeatures(
        bool _zkProofsEnabled,
        bool _liquidDemocracyEnabled,
        bool _voteMixingEnabled
    ) external onlyOwner {
        zkProofsEnabled = _zkProofsEnabled;
        liquidDemocracyEnabled = _liquidDemocracyEnabled;
        voteMixingEnabled = _voteMixingEnabled;
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // --- Internal Functions ---

    /**
     * @dev Logs an audit trail entry
     * @param action The action performed
     * @param data Additional data
     */
    function logAuditTrail(string memory action, bytes memory data) internal {
        bytes32 actionHash = keccak256(abi.encodePacked(action, data, block.timestamp, auditCounter));
        
        AuditTrail memory trail = AuditTrail({
            actionHash: actionHash,
            actor: msg.sender,
            action: action,
            timestamp: block.timestamp,
            proof: new bytes32[](0)
        });
        
        auditTrails[actionHash] = trail;
        auditCounter++;
        
        emit AuditLogCreated(actionHash, msg.sender, action, block.timestamp);
    }

    /**
     * @dev Gets total vote count for a candidate
     * @param candidateId The candidate ID
     * @return Total vote count
     */
    function getCandidateTotalVotes(uint256 candidateId) external view returns (uint256) {
        return candidates[candidateId].voteCount + candidates[candidateId].delegatedVoteCount;
    }

    /**
     * @dev Gets total votes in a session
     * @param sessionId The session ID
     * @return totalVotes Total number of votes cast
     * @return totalVotingPower Total voting power used
     */
    function getSessionTotals(uint256 sessionId) external view returns (uint256 totalVotes, uint256 totalVotingPower) {
        VotingSession memory session = votingSessions[sessionId];
        return (session.totalVotes, session.totalVotingPower);
    }
} 