// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title CryptographicUtils
 * @dev Advanced cryptographic utilities for secure voting
 * @notice Provides commitment schemes, threshold cryptography, and vote mixing
 */
library CryptographicUtils {
    using ECDSA for bytes32;

    // --- Structs ---
    struct Commitment {
        bytes32 commitmentHash;
        uint256 timestamp;
        bool revealed;
        bytes32 revealedValue;
    }

    struct ThresholdSignature {
        bytes32 messageHash;
        bytes[] signatures;
        uint256 threshold;
        uint256 totalSigners;
    }

    struct VoteMix {
        bytes32 originalVote;
        bytes32 mixedVote;
        uint256 mixIndex;
        bytes32 randomness;
    }

    // --- Events ---
    event CommitmentCreated(address indexed voter, bytes32 commitmentHash, uint256 timestamp);
    event CommitmentRevealed(address indexed voter, bytes32 originalValue, bytes32 commitmentHash);
    event ThresholdSignatureCreated(bytes32 indexed messageHash, uint256 threshold, uint256 totalSigners);
    event VoteMixed(bytes32 indexed originalVote, bytes32 mixedVote, uint256 mixIndex);

    // --- Commitment Scheme Functions ---
    
    /**
     * @dev Creates a commitment hash for vote hiding
     * @param vote The vote to commit
     * @param randomness Random value for commitment
     * @return commitmentHash The commitment hash
     */
    function createCommitment(bytes32 vote, bytes32 randomness) 
        internal 
        pure 
        returns (bytes32 commitmentHash) 
    {
        commitmentHash = keccak256(abi.encodePacked(vote, randomness));
        return commitmentHash;
    }

    /**
     * @dev Verifies a commitment reveal
     * @param vote The revealed vote
     * @param randomness The randomness used in commitment
     * @param commitmentHash The original commitment hash
     * @return isValid Whether the reveal is valid
     */
    function verifyCommitment(
        bytes32 vote, 
        bytes32 randomness, 
        bytes32 commitmentHash
    ) internal pure returns (bool isValid) {
        bytes32 computedHash = keccak256(abi.encodePacked(vote, randomness));
        return computedHash == commitmentHash;
    }

    // --- Threshold Cryptography Functions ---

    /**
     * @dev Creates a threshold signature verification
     * @param messageHash Hash of the message to verify
     * @param signatures Array of signatures
     * @param signers Array of signer addresses
     * @param threshold Minimum number of valid signatures required
     * @return isValid Whether threshold is met
     */
    function verifyThresholdSignature(
        bytes32 messageHash,
        bytes[] calldata signatures,
        address[] calldata signers,
        uint256 threshold
    ) internal pure returns (bool isValid) {
        require(signatures.length == signers.length, "Signature count mismatch");
        require(signatures.length >= threshold, "Insufficient signatures for threshold");
        
        uint256 validSignatures = 0;
        address[] memory recoveredSigners = new address[](signatures.length);
        
        for (uint256 i = 0; i < signatures.length; i++) {
            address recoveredSigner = messageHash.recover(signatures[i]);
            if (recoveredSigner == signers[i]) {
                recoveredSigners[validSignatures] = recoveredSigner;
                validSignatures++;
            }
        }
        
        // Check for duplicate signers
        for (uint256 i = 0; i < validSignatures; i++) {
            for (uint256 j = i + 1; j < validSignatures; j++) {
                require(recoveredSigners[i] != recoveredSigners[j], "Duplicate signer");
            }
        }
        
        return validSignatures >= threshold;
    }

    // --- Vote Mixing Functions ---

    /**
     * @dev Creates a mixed vote using Chaum mixing
     * @param originalVote The original vote
     * @param randomness Random value for mixing
     * @param mixIndex Index in the mixing round
     * @return mixedVote The mixed vote
     */
    function mixVote(
        bytes32 originalVote,
        bytes32 randomness,
        uint256 mixIndex
    ) internal pure returns (bytes32 mixedVote) {
        // Chaum mixing: vote' = vote ⊕ H(randomness || mixIndex)
        bytes32 mixHash = keccak256(abi.encodePacked(randomness, mixIndex));
        mixedVote = originalVote ^ mixHash;
        return mixedVote;
    }

    /**
     * @dev Unmixes a vote using the same parameters
     * @param mixedVote The mixed vote
     * @param randomness Random value used in mixing
     * @param mixIndex Index used in mixing
     * @return originalVote The original vote
     */
    function unmixVote(
        bytes32 mixedVote,
        bytes32 randomness,
        uint256 mixIndex
    ) internal pure returns (bytes32 originalVote) {
        // Reverse Chaum mixing: vote = vote' ⊕ H(randomness || mixIndex)
        bytes32 mixHash = keccak256(abi.encodePacked(randomness, mixIndex));
        originalVote = mixedVote ^ mixHash;
        return originalVote;
    }

    // --- Advanced Cryptographic Functions ---

    /**
     * @dev Creates a zero-knowledge proof hash for vote verification
     * @param vote The vote to prove
     * @param nullifier Random value to prevent double-spending
     * @param secret Secret value for proof generation
     * @return proofHash The proof hash
     */
    function createZKProofHash(
        bytes32 vote,
        bytes32 nullifier,
        bytes32 secret
    ) internal pure returns (bytes32 proofHash) {
        proofHash = keccak256(abi.encodePacked(vote, nullifier, secret));
        return proofHash;
    }

    /**
     * @dev Verifies a Merkle proof for inclusion
     * @param leaf The leaf node
     * @param proof The Merkle proof
     * @param root The Merkle root
     * @return isValid Whether the proof is valid
     */
    function verifyMerkleProof(
        bytes32 leaf,
        bytes32[] calldata proof,
        bytes32 root
    ) internal pure returns (bool isValid) {
        return MerkleProof.verify(proof, root, leaf);
    }

    /**
     * @dev Creates a Merkle root from leaves (calldata version)
     * @param leaves Array of leaf nodes
     * @return root The Merkle root
     */
    function createMerkleRoot(bytes32[] calldata leaves) 
        internal 
        pure 
        returns (bytes32 root) 
    {
        require(leaves.length > 0, "Empty leaves array");
        
        if (leaves.length == 1) {
            return leaves[0];
        }
        
        bytes32[] memory currentLevel = new bytes32[]((leaves.length + 1) / 2);
        
        for (uint256 i = 0; i < leaves.length; i += 2) {
            if (i + 1 < leaves.length) {
                currentLevel[i / 2] = keccak256(abi.encodePacked(leaves[i], leaves[i + 1]));
            } else {
                currentLevel[i / 2] = leaves[i];
            }
        }
        
        return createMerkleRootFromLevel(currentLevel);
    }

    /**
     * @dev Creates a Merkle root from leaves (memory version)
     * @param leaves Array of leaf nodes
     * @return root The Merkle root
     */
    function createMerkleRootFromMemory(bytes32[] memory leaves) 
        internal 
        pure 
        returns (bytes32 root) 
    {
        require(leaves.length > 0, "Empty leaves array");
        
        if (leaves.length == 1) {
            return leaves[0];
        }
        
        bytes32[] memory currentLevel = new bytes32[]((leaves.length + 1) / 2);
        
        for (uint256 i = 0; i < leaves.length; i += 2) {
            if (i + 1 < leaves.length) {
                currentLevel[i / 2] = keccak256(abi.encodePacked(leaves[i], leaves[i + 1]));
            } else {
                currentLevel[i / 2] = leaves[i];
            }
        }
        
        return createMerkleRootFromLevel(currentLevel);
    }

    /**
     * @dev Recursive function to build Merkle tree
     * @param level Current level of the tree
     * @return root The Merkle root
     */
    function createMerkleRootFromLevel(bytes32[] memory level) 
        private 
        pure 
        returns (bytes32 root) 
    {
        if (level.length == 1) {
            return level[0];
        }
        
        bytes32[] memory nextLevel = new bytes32[]((level.length + 1) / 2);
        
        for (uint256 i = 0; i < level.length; i += 2) {
            if (i + 1 < level.length) {
                nextLevel[i / 2] = keccak256(abi.encodePacked(level[i], level[i + 1]));
            } else {
                nextLevel[i / 2] = level[i];
            }
        }
        
        return createMerkleRootFromLevel(nextLevel);
    }

    // --- Utility Functions ---

    /**
     * @dev Generates a pseudo-random number based on block data
     * @param seed Additional seed for randomness
     * @return randomNumber The generated random number
     */
    function generateRandomNumber(bytes32 seed) 
        internal 
        view 
        returns (bytes32 randomNumber) 
    {
        return keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            block.prevrandao,
            seed
        ));
    }

    /**
     * @dev Creates a deterministic hash for vote verification
     * @param voter The voter address
     * @param vote The vote value
     * @param nonce The nonce for uniqueness
     * @return voteHash The deterministic vote hash
     */
    function createVoteHash(
        address voter,
        bytes32 vote,
        uint256 nonce
    ) internal pure returns (bytes32 voteHash) {
        voteHash = keccak256(abi.encodePacked(voter, vote, nonce));
        return voteHash;
    }
} 