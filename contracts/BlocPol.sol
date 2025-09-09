// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BlocPol {
    // --- Events ---
    event CandidateRegistered(uint indexed candidateId, string name, string ipfsHash);
    event VotingSessionStarted(uint startTime, uint endTime);
    event VotingSessionStopped(uint stopTime);
    event VoteCast(address indexed voter, uint indexed candidateId, bytes32 voteHash, bytes32 txHash);

    // --- Structs ---
    struct Candidate {
        uint id;
        string name;
        string ipfsHash; // Optional IPFS hash for off-chain profile
        uint voteCount;
    }

    // --- State Variables ---
    address public admin;
    uint public deploymentTimestamp;
    bool public votingActive;
    uint public votingStartTime;
    uint public votingEndTime;
    uint private nextCandidateId;

    mapping(uint => Candidate) private candidates;
    uint[] private candidateIds;
    mapping(address => bool) private hasVoted;
    mapping(address => uint) private voterToCandidate;
    mapping(address => bytes32) private voterToVoteHash;
    mapping(address => bytes32) private voterToTxHash;

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    modifier onlyDuringVoting() {
        require(votingActive, "Voting is not active");
        require(block.timestamp >= votingStartTime && block.timestamp <= votingEndTime, "Voting not in allowed period");
        _;
    }
    modifier onlyOnce() {
        require(!hasVoted[msg.sender], "You have already voted");
        _;
    }

    // --- Constructor ---
    constructor() {
        admin = msg.sender;
        deploymentTimestamp = block.timestamp;
    }

    // --- Admin Functions ---
    function registerCandidate(string calldata name, string calldata ipfsHash) external onlyAdmin {
        uint candidateId = nextCandidateId++;
        candidates[candidateId] = Candidate(candidateId, name, ipfsHash, 0);
        candidateIds.push(candidateId);
        emit CandidateRegistered(candidateId, name, ipfsHash);
    }

    function startVotingSession(uint durationSeconds) external onlyAdmin {
        require(!votingActive, "Voting already active");
        votingActive = true;
        votingStartTime = block.timestamp;
        votingEndTime = block.timestamp + durationSeconds;
        emit VotingSessionStarted(votingStartTime, votingEndTime);
    }

    function stopVotingSession() external onlyAdmin {
        require(votingActive, "Voting not active");
        votingActive = false;
        votingEndTime = block.timestamp;
        emit VotingSessionStopped(votingEndTime);
    }

    // --- Voting Functions ---
    function vote(uint candidateId) external onlyDuringVoting onlyOnce {
        require(candidates[candidateId].id == candidateId, "Invalid candidate");
        candidates[candidateId].voteCount++;
        hasVoted[msg.sender] = true;
        voterToCandidate[msg.sender] = candidateId;
        bytes32 voteHash = keccak256(abi.encodePacked(msg.sender, candidateId, block.timestamp));
        voterToVoteHash[msg.sender] = voteHash;
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, candidateId, block.number, blockhash(block.number - 1)));
        voterToTxHash[msg.sender] = txHash;
        emit VoteCast(msg.sender, candidateId, voteHash, txHash);
    }

    // --- View Functions ---
    function getCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory list = new Candidate[](candidateIds.length);
        for (uint i = 0; i < candidateIds.length; i++) {
            list[i] = candidates[candidateIds[i]];
        }
        return list;
    }

    function getCandidate(uint candidateId) external view returns (Candidate memory) {
        return candidates[candidateId];
    }

    function getTotalVotes(uint candidateId) external view returns (uint) {
        return candidates[candidateId].voteCount;
    }

    function isVotingActive() external view returns (bool) {
        return votingActive && block.timestamp >= votingStartTime && block.timestamp <= votingEndTime;
    }

    function hasAddressVoted(address addr) external view returns (bool) {
        return hasVoted[addr];
    }

    function getVoteHash(address voter) external view returns (bytes32) {
        require(hasVoted[voter], "No vote found for this address");
        return voterToVoteHash[voter];
    }

    function getVoteTxHash(address voter) external view returns (bytes32) {
        require(hasVoted[voter], "No vote found for this address");
        return voterToTxHash[voter];
    }

    function getDeploymentTimestamp() external view returns (uint) {
        return deploymentTimestamp;
    }

    function getVotedCandidate(address voter) external view returns (uint) {
        require(hasVoted[voter], "No vote found for this address");
        return voterToCandidate[voter];
    }

    // --- Transparent Vote Viewing (anonymous) ---
    function getAllVotes() external view returns (uint[] memory) {
        uint[] memory votes = new uint[](candidateIds.length);
        for (uint i = 0; i < candidateIds.length; i++) {
            votes[i] = candidates[candidateIds[i]].voteCount;
        }
        return votes;
    }
} 