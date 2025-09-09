const { ethers } = require('ethers');
const Voter = require('../models/Voter');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');
const { getContractInstance } = require('../utils/contractUtils');

// Register voter
const registerVoter = async (req, res) => {
  try {
    const { name, email, walletAddress, signature, message } = req.body;

    // Verify signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Check if voter already exists
    const existingVoter = await Voter.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (existingVoter) {
      return res.status(400).json({
        success: false,
        message: 'Voter already registered'
      });
    }

    // Create new voter
    const voter = new Voter({
      walletAddress: walletAddress.toLowerCase(),
      name,
      email
    });

    await voter.save();

    // Log audit trail
    await AuditLog.create({
      action: 'VOTER_REGISTERED',
      actor: walletAddress.toLowerCase(),
      data: { voterId: voter._id, name, email },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.status(201).json({
      success: true,
      message: 'Voter registered successfully',
      voter: {
        id: voter._id,
        name: voter.name,
        email: voter.email,
        walletAddress: voter.walletAddress,
        registrationDate: voter.registrationDate
      }
    });
  } catch (error) {
    console.error('Error registering voter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register voter'
    });
  }
};

// Get voter status
const getVoterStatus = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const voter = await Voter.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    res.json({
      success: true,
      voter: {
        id: voter._id,
        name: voter.name,
        email: voter.email,
        walletAddress: voter.walletAddress,
        isVerified: voter.isVerified,
        registrationDate: voter.registrationDate,
        totalVotes: voter.votingHistory.length,
        isActive: voter.isActive,
        banned: voter.banned
      }
    });
  } catch (error) {
    console.error('Error fetching voter status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voter status'
    });
  }
};

// Cast vote
const castVote = async (req, res) => {
  try {
    const { candidateId, walletAddress, signature, message } = req.body;

    // Verify signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Get voter
    const voter = await Voter.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    // Get candidate
    const candidate = await Candidate.findById(candidateId).populate('electionId');
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Check if election is active
    if (candidate.electionId.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Election is not active'
      });
    }

    // Check if voter has already voted in this election
    if (voter.hasVotedInElection(candidate.electionId._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this election'
      });
    }

    // Get smart contract instance
    const contract = await getContractInstance();
    
    // Cast vote on blockchain
    const tx = await contract.vote(candidateId);
    await tx.wait();

    // Update voter's voting history
    voter.votingHistory.push({
      electionId: candidate.electionId._id,
      candidateId: candidate._id,
      transactionHash: tx.hash,
      voteHash: ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [walletAddress, candidateId])),
      votedAt: new Date()
    });

    await voter.save();

    // Update candidate vote count
    candidate.voteCount += 1;
    await candidate.save();

    // Update election vote count
    candidate.electionId.voteCount += 1;
    await candidate.electionId.save();

    // Log audit trail
    await AuditLog.create({
      action: 'VOTE_CAST',
      actor: walletAddress.toLowerCase(),
      data: { 
        electionId: candidate.electionId._id, 
        candidateId: candidate._id,
        transactionHash: tx.hash
      },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.json({
      success: true,
      message: 'Vote cast successfully',
      transactionHash: tx.hash,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        party: candidate.party
      }
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cast vote'
    });
  }
};

// Verify vote
const verifyVote = async (req, res) => {
  try {
    const { transactionHash } = req.params;
    
    // Get voter by transaction hash
    const voter = await Voter.findOne({
      'votingHistory.transactionHash': transactionHash
    });

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }

    const vote = voter.votingHistory.find(v => v.transactionHash === transactionHash);
    
    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }

    // Get candidate and election info
    const candidate = await Candidate.findById(vote.candidateId).populate('electionId');
    
    res.json({
      success: true,
      verified: true,
      vote: {
        transactionHash: vote.transactionHash,
        voteHash: vote.voteHash,
        candidate: {
          id: candidate._id,
          name: candidate.name,
          party: candidate.party
        },
        election: {
          id: candidate.electionId._id,
          title: candidate.electionId.title
        },
        votedAt: vote.votedAt
      }
    });
  } catch (error) {
    console.error('Error verifying vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify vote'
    });
  }
};

module.exports = {
  registerVoter,
  getVoterStatus,
  castVote,
  verifyVote
};

