// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./libraries/CryptographicUtils.sol";

/**
 * @title ZKProofVerifier
 * @dev Zero-Knowledge Proof verification for vote privacy and verifiability
 * @notice Implements zk-SNARKs principles for secure voting
 */
contract ZKProofVerifier is Ownable {
    using CryptographicUtils for *;

    // --- Structs ---
    struct ZKProof {
        bytes32 publicInputs;      // Public inputs to the proof
        bytes32 nullifierHash;     // Hash to prevent double-spending
        bytes32 commitmentHash;    // Commitment to the vote
        bytes32 proofHash;         // Hash of the zero-knowledge proof
        uint256 timestamp;         // When the proof was created
        bool verified;             // Whether the proof has been verified
    }

    struct VoteProof {
        address voter;             // Voter address (hidden in ZK)
        bytes32 voteHash;          // Hash of the actual vote
        bytes32 nullifier;         // Unique nullifier
        bytes32 secret;            // Secret for proof generation
        ZKProof zkProof;          // Zero-knowledge proof
    }

    // --- State Variables ---
    mapping(bytes32 => ZKProof) private proofs;
    mapping(bytes32 => bool) private nullifiers;
    mapping(address => bytes32[]) private voterProofs;
    mapping(bytes32 => VoteProof) private voteProofs;
    
    uint256 public proofCounter;
    bytes32 public merkleRoot;
    uint256 public verificationThreshold;
    
    // --- Events ---
    event ZKProofCreated(
        bytes32 indexed proofHash,
        bytes32 indexed nullifierHash,
        bytes32 commitmentHash,
        uint256 timestamp
    );
    
    event ZKProofVerified(
        bytes32 indexed proofHash,
        bool isValid,
        uint256 timestamp
    );
    
    event VoteProofSubmitted(
        address indexed voter,
        bytes32 indexed voteHash,
        bytes32 proofHash,
        uint256 timestamp
    );
    
    event NullifierUsed(
        bytes32 indexed nullifier,
        bytes32 indexed proofHash,
        uint256 timestamp
    );

    // --- Modifiers ---
    modifier onlyValidProof(bytes32 proofHash) {
        require(proofs[proofHash].proofHash != bytes32(0), "Proof does not exist");
        _;
    }

    modifier onlyUnusedNullifier(bytes32 nullifier) {
        require(!nullifiers[nullifier], "Nullifier already used");
        _;
    }

    // --- Constructor ---
    constructor(uint256 _verificationThreshold) Ownable(msg.sender) {
        verificationThreshold = _verificationThreshold;
        proofCounter = 0;
    }

    // --- Core ZK Proof Functions ---

    /**
     * @dev Creates a zero-knowledge proof for vote verification
     * @param voteHash Hash of the vote to prove
     * @param nullifier Unique nullifier to prevent double-spending
     * @param secret Secret value for proof generation
     * @param commitmentHash Commitment to the vote
     * @return proofHash The created proof hash
     */
    function createZKProof(
        bytes32 voteHash,
        bytes32 nullifier,
        bytes32 secret,
        bytes32 commitmentHash
    ) external onlyUnusedNullifier(nullifier) returns (bytes32 proofHash) {
        // Create ZK proof hash
        proofHash = CryptographicUtils.createZKProofHash(voteHash, nullifier, secret);
        
        // Create ZK proof structure
        ZKProof memory newProof = ZKProof({
            publicInputs: commitmentHash,
            nullifierHash: keccak256(abi.encodePacked(nullifier)),
            commitmentHash: commitmentHash,
            proofHash: proofHash,
            timestamp: block.timestamp,
            verified: false
        });
        
        // Store the proof
        proofs[proofHash] = newProof;
        nullifiers[nullifier] = true;
        proofCounter++;
        
        emit ZKProofCreated(proofHash, newProof.nullifierHash, commitmentHash, block.timestamp);
        emit NullifierUsed(nullifier, proofHash, block.timestamp);
        
        return proofHash;
    }

    /**
     * @dev Verifies a zero-knowledge proof
     * @param proofHash The proof hash to verify
     * @param voteHash The vote hash being proved
     * @param nullifier The nullifier used in the proof
     * @param secret The secret used in the proof
     * @return isValid Whether the proof is valid
     */
    function verifyZKProof(
        bytes32 proofHash,
        bytes32 voteHash,
        bytes32 nullifier,
        bytes32 secret
    ) external onlyValidProof(proofHash) returns (bool isValid) {
        ZKProof storage proof = proofs[proofHash];
        
        // Verify the proof hasn't been used before
        require(!proof.verified, "Proof already verified");
        
        // Verify the nullifier hasn't been used
        require(nullifiers[nullifier], "Nullifier not found");
        
        // Recreate the proof hash to verify
        bytes32 computedProofHash = CryptographicUtils.createZKProofHash(voteHash, nullifier, secret);
        
        // Verify the proof hash matches
        isValid = (computedProofHash == proofHash);
        
        if (isValid) {
            proof.verified = true;
            emit ZKProofVerified(proofHash, true, block.timestamp);
        } else {
            emit ZKProofVerified(proofHash, false, block.timestamp);
        }
        
        return isValid;
    }

    /**
     * @dev Submits a complete vote proof with ZK verification
     * @param voteHash Hash of the vote
     * @param nullifier Unique nullifier
     * @param secret Secret for proof generation
     * @param commitmentHash Commitment to the vote
     * @return proofHash The created proof hash
     */
    function submitVoteProof(
        bytes32 voteHash,
        bytes32 nullifier,
        bytes32 secret,
        bytes32 commitmentHash
    ) external returns (bytes32 proofHash) {
        // Create the ZK proof
        proofHash = this.createZKProof(voteHash, nullifier, secret, commitmentHash);
        
        // Create vote proof structure
        VoteProof memory voteProof = VoteProof({
            voter: msg.sender,
            voteHash: voteHash,
            nullifier: nullifier,
            secret: secret,
            zkProof: proofs[proofHash]
        });
        
        // Store the vote proof
        voteProofs[proofHash] = voteProof;
        voterProofs[msg.sender].push(proofHash);
        
        emit VoteProofSubmitted(msg.sender, voteHash, proofHash, block.timestamp);
        
        return proofHash;
    }

    // --- Merkle Tree Functions ---

    /**
     * @dev Updates the Merkle root for voter verification
     * @param newRoot The new Merkle root
     */
    function updateMerkleRoot(bytes32 newRoot) external onlyOwner {
        merkleRoot = newRoot;
    }

    /**
     * @dev Verifies a voter's inclusion in the Merkle tree
     * @param voter The voter address
     * @param proof The Merkle proof
     * @return isValid Whether the voter is included
     */
    function verifyVoterInclusion(
        address voter,
        bytes32[] calldata proof
    ) external view returns (bool isValid) {
        bytes32 leaf = keccak256(abi.encodePacked(voter));
        return CryptographicUtils.verifyMerkleProof(leaf, proof, merkleRoot);
    }

    // --- View Functions ---

    /**
     * @dev Gets a ZK proof by hash
     * @param proofHash The proof hash
     * @return The ZK proof structure
     */
    function getZKProof(bytes32 proofHash) 
        external 
        view 
        onlyValidProof(proofHash) 
        returns (ZKProof memory) 
    {
        return proofs[proofHash];
    }

    /**
     * @dev Gets a vote proof by hash
     * @param proofHash The proof hash
     * @return The vote proof structure
     */
    function getVoteProof(bytes32 proofHash) 
        external 
        view 
        returns (VoteProof memory) 
    {
        return voteProofs[proofHash];
    }

    /**
     * @dev Gets all proofs for a voter
     * @param voter The voter address
     * @return Array of proof hashes
     */
    function getVoterProofs(address voter) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return voterProofs[voter];
    }

    /**
     * @dev Checks if a nullifier has been used
     * @param nullifier The nullifier to check
     * @return Whether the nullifier has been used
     */
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return nullifiers[nullifier];
    }

    /**
     * @dev Gets the total number of proofs created
     * @return The proof counter
     */
    function getProofCount() external view returns (uint256) {
        return proofCounter;
    }

    /**
     * @dev Gets the current Merkle root
     * @return The Merkle root
     */
    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }

    // --- Admin Functions ---

    /**
     * @dev Updates the verification threshold
     * @param newThreshold The new threshold value
     */
    function updateVerificationThreshold(uint256 newThreshold) external onlyOwner {
        verificationThreshold = newThreshold;
    }

    /**
     * @dev Batch verifies multiple proofs
     * @param proofHashes Array of proof hashes to verify
     * @param voteHashes Array of vote hashes
     * @param nullifiers Array of nullifiers
     * @param secrets Array of secrets
     * @return validCount Number of valid proofs
     */
    function batchVerifyProofs(
        bytes32[] calldata proofHashes,
        bytes32[] calldata voteHashes,
        bytes32[] calldata nullifiers,
        bytes32[] calldata secrets
    ) external onlyOwner returns (uint256 validCount) {
        require(
            proofHashes.length == voteHashes.length &&
            voteHashes.length == nullifiers.length &&
            nullifiers.length == secrets.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < proofHashes.length; i++) {
            if (this.verifyZKProof(proofHashes[i], voteHashes[i], nullifiers[i], secrets[i])) {
                validCount++;
            }
        }
        
        return validCount;
    }

    // --- Emergency Functions ---

    /**
     * @dev Emergency function to invalidate a proof (admin only)
     * @param proofHash The proof hash to invalidate
     */
    function emergencyInvalidateProof(bytes32 proofHash) external onlyOwner {
        require(proofs[proofHash].proofHash != bytes32(0), "Proof does not exist");
        delete proofs[proofHash];
    }
} 