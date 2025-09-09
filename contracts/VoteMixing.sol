// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/CryptographicUtils.sol";

/**
 * @title VoteMixing
 * @dev Implements Chaum mixing for vote anonymity
 * @notice Provides vote mixing capabilities to enhance voter privacy
 */
contract VoteMixing is Ownable, ReentrancyGuard {
    using CryptographicUtils for *;

    // --- Structs ---
    struct MixedVote {
        bytes32 originalVote;
        bytes32 mixedVote;
        bytes32 randomness;
        uint256 mixIndex;
        uint256 timestamp;
        bool isRevealed;
        address voter;
    }

    struct MixingRound {
        uint256 roundId;
        bytes32[] mixedVotes;
        bytes32[] randomness;
        uint256[] mixIndices;
        uint256 startTime;
        uint256 endTime;
        uint256 revealTime;
        bool isActive;
        bool isRevealed;
        uint256 participantCount;
        bytes32 merkleRoot;
    }

    struct MixingProof {
        bytes32 originalVote;
        bytes32 mixedVote;
        bytes32 randomness;
        uint256 mixIndex;
        bytes32[] merkleProof;
    }

    // --- State Variables ---
    mapping(uint256 => MixingRound) private mixingRounds;
    mapping(bytes32 => MixedVote) private mixedVotes;
    mapping(address => uint256[]) private voterRounds;
    mapping(uint256 => address[]) private roundParticipants;
    mapping(bytes32 => bool) private usedRandomness;
    
    uint256 private roundCounter;
    uint256 private minParticipants;
    uint256 private maxParticipants;
    uint256 private mixingDuration;
    uint256 private revealDelay;
    
    bool public mixingEnabled;
    
    // --- Events ---
    event MixingRoundCreated(
        uint256 indexed roundId,
        uint256 startTime,
        uint256 endTime,
        uint256 minParticipants
    );
    
    event VoteSubmitted(
        uint256 indexed roundId,
        address indexed voter,
        bytes32 mixedVote,
        uint256 mixIndex,
        uint256 timestamp
    );
    
    event MixingRoundCompleted(
        uint256 indexed roundId,
        uint256 participantCount,
        bytes32 merkleRoot,
        uint256 timestamp
    );
    
    event VoteRevealed(
        uint256 indexed roundId,
        address indexed voter,
        bytes32 originalVote,
        bytes32 mixedVote,
        uint256 timestamp
    );
    
    event MixingRoundRevealed(
        uint256 indexed roundId,
        uint256 totalVotes,
        uint256 timestamp
    );

    // --- Modifiers ---
    modifier onlyActiveRound(uint256 roundId) {
        require(mixingRounds[roundId].isActive, "Round not active");
        _;
    }

    modifier onlyRevealTime(uint256 roundId) {
        require(block.timestamp >= mixingRounds[roundId].revealTime, "Reveal time not reached");
        _;
    }

    modifier onlyValidRandomness(bytes32 randomness) {
        require(!usedRandomness[randomness], "Randomness already used");
        _;
    }

    // --- Constructor ---
    constructor(
        uint256 _minParticipants,
        uint256 _maxParticipants,
        uint256 _mixingDuration,
        uint256 _revealDelay
    ) Ownable(msg.sender) {
        minParticipants = _minParticipants;
        maxParticipants = _maxParticipants;
        mixingDuration = _mixingDuration;
        revealDelay = _revealDelay;
        roundCounter = 0;
        mixingEnabled = true;
    }

    // --- Core Functions ---

    /**
     * @dev Creates a new mixing round
     * @return roundId The ID of the created round
     */
    function createMixingRound() external onlyOwner returns (uint256 roundId) {
        require(mixingEnabled, "Mixing disabled");
        
        roundId = roundCounter++;
        
        MixingRound memory newRound = MixingRound({
            roundId: roundId,
            mixedVotes: new bytes32[](0),
            randomness: new bytes32[](0),
            mixIndices: new uint256[](0),
            startTime: block.timestamp,
            endTime: block.timestamp + mixingDuration,
            revealTime: block.timestamp + mixingDuration + revealDelay,
            isActive: true,
            isRevealed: false,
            participantCount: 0,
            merkleRoot: bytes32(0)
        });
        
        mixingRounds[roundId] = newRound;
        
        emit MixingRoundCreated(roundId, newRound.startTime, newRound.endTime, minParticipants);
        
        return roundId;
    }

    /**
     * @dev Submits a vote to the mixing round
     * @param roundId The mixing round ID
     * @param originalVote The original vote to mix
     * @param randomness Random value for mixing
     * @param mixIndex Index for mixing
     * @return mixedVote The mixed vote
     */
    function submitVote(
        uint256 roundId,
        bytes32 originalVote,
        bytes32 randomness,
        uint256 mixIndex
    ) external 
        onlyActiveRound(roundId)
        onlyValidRandomness(randomness)
        returns (bytes32 mixedVote) 
    {
        MixingRound storage round = mixingRounds[roundId];
        require(block.timestamp <= round.endTime, "Round ended");
        require(round.participantCount < maxParticipants, "Round full");
        
        // Check if voter already participated
        require(!hasVoterParticipated(roundId, msg.sender), "Already participated");
        
        // Create mixed vote
        mixedVote = CryptographicUtils.mixVote(originalVote, randomness, mixIndex);
        
        // Store mixed vote
        MixedVote memory newMixedVote = MixedVote({
            originalVote: originalVote,
            mixedVote: mixedVote,
            randomness: randomness,
            mixIndex: mixIndex,
            timestamp: block.timestamp,
            isRevealed: false,
            voter: msg.sender
        });
        
        mixedVotes[mixedVote] = newMixedVote;
        
        // Add to round
        round.mixedVotes.push(mixedVote);
        round.randomness.push(randomness);
        round.mixIndices.push(mixIndex);
        round.participantCount++;
        roundParticipants[roundId].push(msg.sender);
        voterRounds[msg.sender].push(roundId);
        
        usedRandomness[randomness] = true;
        
        emit VoteSubmitted(roundId, msg.sender, mixedVote, mixIndex, block.timestamp);
        
        return mixedVote;
    }

    /**
     * @dev Completes a mixing round and creates Merkle tree
     * @param roundId The mixing round ID
     */
    function completeMixingRound(uint256 roundId) external onlyOwner {
        MixingRound storage round = mixingRounds[roundId];
        require(round.isActive, "Round not active");
        require(block.timestamp >= round.endTime, "Round not ended");
        require(round.participantCount >= minParticipants, "Insufficient participants");
        
        round.isActive = false;
        
        // Create Merkle root from mixed votes
        // Convert storage array to memory for Merkle root calculation
        bytes32[] memory mixedVotes = new bytes32[](round.mixedVotes.length);
        for (uint256 i = 0; i < round.mixedVotes.length; i++) {
            mixedVotes[i] = round.mixedVotes[i];
        }
        round.merkleRoot = CryptographicUtils.createMerkleRootFromMemory(mixedVotes);
        
        emit MixingRoundCompleted(roundId, round.participantCount, round.merkleRoot, block.timestamp);
    }

    /**
     * @dev Reveals a vote after mixing round completion
     * @param roundId The mixing round ID
     * @param mixedVote The mixed vote to reveal
     * @param originalVote The original vote
     * @param randomness The randomness used
     * @param mixIndex The mix index used
     */
    function revealVote(
        uint256 roundId,
        bytes32 mixedVote,
        bytes32 originalVote,
        bytes32 randomness,
        uint256 mixIndex
    ) external onlyRevealTime(roundId) {
        MixedVote storage vote = mixedVotes[mixedVote];
        require(vote.voter == msg.sender, "Not your vote");
        require(!vote.isRevealed, "Vote already revealed");
        
        // Verify the mixing
        bytes32 computedMixedVote = CryptographicUtils.mixVote(originalVote, randomness, mixIndex);
        require(computedMixedVote == mixedVote, "Invalid reveal");
        
        vote.isRevealed = true;
        
        emit VoteRevealed(roundId, msg.sender, originalVote, mixedVote, block.timestamp);
    }

    /**
     * @dev Reveals all votes in a mixing round
     * @param roundId The mixing round ID
     * @return revealedCount Number of votes revealed
     */
    function revealMixingRound(uint256 roundId) 
        external 
        onlyOwner 
        onlyRevealTime(roundId) 
        returns (uint256 revealedCount) 
    {
        MixingRound storage round = mixingRounds[roundId];
        require(!round.isRevealed, "Round already revealed");
        
        round.isRevealed = true;
        revealedCount = round.participantCount;
        
        emit MixingRoundRevealed(roundId, revealedCount, block.timestamp);
        
        return revealedCount;
    }

    // --- View Functions ---

    /**
     * @dev Gets mixing round information
     * @param roundId The round ID
     * @return The mixing round structure
     */
    function getMixingRound(uint256 roundId) external view returns (MixingRound memory) {
        return mixingRounds[roundId];
    }

    /**
     * @dev Gets mixed vote information
     * @param mixedVote The mixed vote hash
     * @return The mixed vote structure
     */
    function getMixedVote(bytes32 mixedVote) external view returns (MixedVote memory) {
        return mixedVotes[mixedVote];
    }

    /**
     * @dev Gets all participants in a round
     * @param roundId The round ID
     * @return Array of participant addresses
     */
    function getRoundParticipants(uint256 roundId) external view returns (address[] memory) {
        return roundParticipants[roundId];
    }

    /**
     * @dev Gets all rounds a voter participated in
     * @param voter The voter address
     * @return Array of round IDs
     */
    function getVoterRounds(address voter) external view returns (uint256[] memory) {
        return voterRounds[voter];
    }

    /**
     * @dev Gets all mixed votes in a round
     * @param roundId The round ID
     * @return Array of mixed vote hashes
     */
    function getRoundMixedVotes(uint256 roundId) external view returns (bytes32[] memory) {
        return mixingRounds[roundId].mixedVotes;
    }

    /**
     * @dev Verifies a vote's inclusion in the mixing round
     * @param roundId The round ID
     * @param mixedVote The mixed vote
     * @param proof The Merkle proof
     * @return Whether the vote is included
     */
    function verifyVoteInclusion(
        uint256 roundId,
        bytes32 mixedVote,
        bytes32[] calldata proof
    ) external view returns (bool) {
        return CryptographicUtils.verifyMerkleProof(
            mixedVote, 
            proof, 
            mixingRounds[roundId].merkleRoot
        );
    }

    /**
     * @dev Checks if a voter participated in a round
     * @param roundId The round ID
     * @param voter The voter address
     * @return Whether the voter participated
     */
    function hasVoterParticipated(uint256 roundId, address voter) public view returns (bool) {
        address[] memory participants = roundParticipants[roundId];
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == voter) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Gets mixing parameters
     * @return minParticipants Minimum participants required
     * @return maxParticipants Maximum participants allowed
     * @return mixingDuration Duration of mixing phase
     * @return revealDelay Delay before reveal phase
     */
    function getMixingParameters() external view returns (
        uint256 minParticipants,
        uint256 maxParticipants,
        uint256 mixingDuration,
        uint256 revealDelay
    ) {
        return (minParticipants, maxParticipants, mixingDuration, revealDelay);
    }

    /**
     * @dev Gets total number of rounds
     * @return Total round count
     */
    function getTotalRounds() external view returns (uint256) {
        return roundCounter;
    }

    // --- Admin Functions ---

    /**
     * @dev Updates mixing parameters
     * @param _minParticipants New minimum participants
     * @param _maxParticipants New maximum participants
     * @param _mixingDuration New mixing duration
     * @param _revealDelay New reveal delay
     */
    function updateMixingParameters(
        uint256 _minParticipants,
        uint256 _maxParticipants,
        uint256 _mixingDuration,
        uint256 _revealDelay
    ) external onlyOwner {
        minParticipants = _minParticipants;
        maxParticipants = _maxParticipants;
        mixingDuration = _mixingDuration;
        revealDelay = _revealDelay;
    }

    /**
     * @dev Enables or disables mixing
     * @param enabled Whether mixing should be enabled
     */
    function setMixingEnabled(bool enabled) external onlyOwner {
        mixingEnabled = enabled;
    }

    /**
     * @dev Emergency function to invalidate a mixing round
     * @param roundId The round ID to invalidate
     */
    function emergencyInvalidateRound(uint256 roundId) external onlyOwner {
        require(mixingRounds[roundId].isActive, "Round not active");
        mixingRounds[roundId].isActive = false;
    }

    // --- Utility Functions ---

    /**
     * @dev Generates a random mixing index
     * @param seed Additional seed for randomness
     * @return mixIndex The generated mix index
     */
    function generateMixIndex(bytes32 seed) external view returns (uint256 mixIndex) {
        bytes32 random = CryptographicUtils.generateRandomNumber(seed);
        return uint256(random) % maxParticipants;
    }

    /**
     * @dev Creates a mixing proof for verification
     * @param originalVote The original vote
     * @param mixedVote The mixed vote
     * @param randomness The randomness used
     * @param mixIndex The mix index used
     * @return proof The mixing proof structure
     */
    function createMixingProof(
        bytes32 originalVote,
        bytes32 mixedVote,
        bytes32 randomness,
        uint256 mixIndex
    ) external pure returns (MixingProof memory proof) {
        proof = MixingProof({
            originalVote: originalVote,
            mixedVote: mixedVote,
            randomness: randomness,
            mixIndex: mixIndex,
            merkleProof: new bytes32[](0)
        });
        return proof;
    }
} 