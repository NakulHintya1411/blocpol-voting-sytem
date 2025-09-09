// BlocPol Voting System - Frontend Integration Examples
// This file provides examples for integrating with the BlocPol smart contract

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Replace with actual address
const CONTRACT_ABI = [
  // ... ABI from abi/BlocPol.json
];

// ============================================================================
// WEB3.JS INTEGRATION EXAMPLES
// ============================================================================

// Connect to MetaMask using Web3.js
async function connectMetaMaskWeb3() {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed!');
    }

    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const account = accounts[0];
    console.log('Connected account:', account);

    // Create Web3 instance
    const web3 = new Web3(window.ethereum);
    
    // Create contract instance
    const blocPolContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    
    return { web3, blocPolContract, account };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
}

// Admin Functions (Web3.js)
async function registerCandidateWeb3(name, ipfsHash) {
  try {
    const { blocPolContract, account } = await connectMetaMaskWeb3();
    
    const result = await blocPolContract.methods
      .registerCandidate(name, ipfsHash)
      .send({ from: account });
    
    console.log('Candidate registered:', result);
    return result;
  } catch (error) {
    console.error('Error registering candidate:', error);
    throw error;
  }
}

async function startVotingSessionWeb3(durationSeconds) {
  try {
    const { blocPolContract, account } = await connectMetaMaskWeb3();
    
    const result = await blocPolContract.methods
      .startVotingSession(durationSeconds)
      .send({ from: account });
    
    console.log('Voting session started:', result);
    return result;
  } catch (error) {
    console.error('Error starting voting session:', error);
    throw error;
  }
}

async function stopVotingSessionWeb3() {
  try {
    const { blocPolContract, account } = await connectMetaMaskWeb3();
    
    const result = await blocPolContract.methods
      .stopVotingSession()
      .send({ from: account });
    
    console.log('Voting session stopped:', result);
    return result;
  } catch (error) {
    console.error('Error stopping voting session:', error);
    throw error;
  }
}

// Voting Functions (Web3.js)
async function voteWeb3(candidateId) {
  try {
    const { blocPolContract, account } = await connectMetaMaskWeb3();
    
    const result = await blocPolContract.methods
      .vote(candidateId)
      .send({ from: account });
    
    console.log('Vote cast:', result);
    return result;
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
}

// View Functions (Web3.js)
async function getCandidatesWeb3() {
  try {
    const { blocPolContract } = await connectMetaMaskWeb3();
    
    const candidates = await blocPolContract.methods.getCandidates().call();
    console.log('Candidates:', candidates);
    return candidates;
  } catch (error) {
    console.error('Error getting candidates:', error);
    throw error;
  }
}

async function getTotalVotesWeb3(candidateId) {
  try {
    const { blocPolContract } = await connectMetaMaskWeb3();
    
    const votes = await blocPolContract.methods.getTotalVotes(candidateId).call();
    console.log(`Total votes for candidate ${candidateId}:`, votes);
    return votes;
  } catch (error) {
    console.error('Error getting total votes:', error);
    throw error;
  }
}

async function isVotingActiveWeb3() {
  try {
    const { blocPolContract } = await connectMetaMaskWeb3();
    
    const isActive = await blocPolContract.methods.isVotingActive().call();
    console.log('Voting active:', isActive);
    return isActive;
  } catch (error) {
    console.error('Error checking voting status:', error);
    throw error;
  }
}

async function hasAddressVotedWeb3(address) {
  try {
    const { blocPolContract } = await connectMetaMaskWeb3();
    
    const hasVoted = await blocPolContract.methods.hasAddressVoted(address).call();
    console.log(`Address ${address} has voted:`, hasVoted);
    return hasVoted;
  } catch (error) {
    console.error('Error checking if address voted:', error);
    throw error;
  }
}

async function getVoteHashWeb3(voterAddress) {
  try {
    const { blocPolContract } = await connectMetaMaskWeb3();
    
    const voteHash = await blocPolContract.methods.getVoteHash(voterAddress).call();
    console.log('Vote hash:', voteHash);
    return voteHash;
  } catch (error) {
    console.error('Error getting vote hash:', error);
    throw error;
  }
}

async function getVoteTxHashWeb3(voterAddress) {
  try {
    const { blocPolContract } = await connectMetaMaskWeb3();
    
    const txHash = await blocPolContract.methods.getVoteTxHash(voterAddress).call();
    console.log('Transaction hash:', txHash);
    return txHash;
  } catch (error) {
    console.error('Error getting transaction hash:', error);
    throw error;
  }
}

// Event Listening (Web3.js)
async function listenToVoteCastEventsWeb3() {
  const { blocPolContract } = await connectMetaMaskWeb3();
  
  blocPolContract.events.VoteCast({}, (error, event) => {
    if (error) {
      console.error('Error listening to VoteCast event:', error);
      return;
    }
    
    console.log('VoteCast event:', {
      voter: event.returnValues.voter,
      candidateId: event.returnValues.candidateId,
      voteHash: event.returnValues.voteHash,
      txHash: event.returnValues.txHash,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    });
  });
}

// ============================================================================
// ETHERERS.JS INTEGRATION EXAMPLES
// ============================================================================

// Connect to MetaMask using Ethers.js
async function connectMetaMaskEthers() {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed!');
    }

    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const account = accounts[0];
    console.log('Connected account:', account);

    // Create provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Create contract instance
    const blocPolContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    return { provider, signer, blocPolContract, account };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
}

// Admin Functions (Ethers.js)
async function registerCandidateEthers(name, ipfsHash) {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    
    const tx = await blocPolContract.registerCandidate(name, ipfsHash);
    const receipt = await tx.wait();
    
    console.log('Candidate registered:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error registering candidate:', error);
    throw error;
  }
}

async function startVotingSessionEthers(durationSeconds) {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    
    const tx = await blocPolContract.startVotingSession(durationSeconds);
    const receipt = await tx.wait();
    
    console.log('Voting session started:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error starting voting session:', error);
    throw error;
  }
}

async function stopVotingSessionEthers() {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    
    const tx = await blocPolContract.stopVotingSession();
    const receipt = await tx.wait();
    
    console.log('Voting session stopped:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error stopping voting session:', error);
    throw error;
  }
}

// Voting Functions (Ethers.js)
async function voteEthers(candidateId) {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    
    const tx = await blocPolContract.vote(candidateId);
    const receipt = await tx.wait();
    
    console.log('Vote cast:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
}

// View Functions (Ethers.js)
async function getCandidatesEthers() {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    
    const candidates = await blocPolContract.getCandidates();
    console.log('Candidates:', candidates);
    return candidates;
  } catch (error) {
    console.error('Error getting candidates:', error);
    throw error;
  }
}

async function getTotalVotesEthers(candidateId) {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    
    const votes = await blocPolContract.getTotalVotes(candidateId);
    console.log(`Total votes for candidate ${candidateId}:`, votes.toString());
    return votes;
  } catch (error) {
    console.error('Error getting total votes:', error);
    throw error;
  }
}

async function isVotingActiveEthers() {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    
    const isActive = await blocPolContract.isVotingActive();
    console.log('Voting active:', isActive);
    return isActive;
  } catch (error) {
    console.error('Error checking voting status:', error);
    throw error;
  }
}

async function hasAddressVotedEthers(address) {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    
    const hasVoted = await blocPolContract.hasAddressVoted(address);
    console.log(`Address ${address} has voted:`, hasVoted);
    return hasVoted;
  } catch (error) {
    console.error('Error checking if address voted:', error);
    throw error;
  }
}

async function getVoteHashEthers(voterAddress) {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    
    const voteHash = await blocPolContract.getVoteHash(voterAddress);
    console.log('Vote hash:', voteHash);
    return voteHash;
  } catch (error) {
    console.error('Error getting vote hash:', error);
    throw error;
  }
}

async function getVoteTxHashEthers(voterAddress) {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    
    const txHash = await blocPolContract.getVoteTxHash(voterAddress);
    console.log('Transaction hash:', txHash);
    return txHash;
  } catch (error) {
    console.error('Error getting transaction hash:', error);
    throw error;
  }
}

// Event Listening (Ethers.js)
async function listenToVoteCastEventsEthers() {
  const { blocPolContract } = await connectMetaMaskEthers();
  
  blocPolContract.on("VoteCast", (voter, candidateId, voteHash, txHash, event) => {
    console.log('VoteCast event:', {
      voter,
      candidateId: candidateId.toString(),
      voteHash,
      txHash,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    });
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Error handling wrapper
async function handleContractCall(contractFunction, ...args) {
  try {
    const result = await contractFunction(...args);
    return { success: true, data: result };
  } catch (error) {
    console.error('Contract call failed:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
  }
}

// Gas estimation helper
async function estimateGas(contractFunction, ...args) {
  try {
    const { blocPolContract } = await connectMetaMaskEthers();
    const gasEstimate = await blocPolContract.estimateGas[contractFunction.name](...args);
    console.log(`Estimated gas for ${contractFunction.name}:`, gasEstimate.toString());
    return gasEstimate;
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
}

// Network detection
async function getNetworkInfo() {
  try {
    const { provider } = await connectMetaMaskEthers();
    const network = await provider.getNetwork();
    console.log('Connected network:', network);
    return network;
  } catch (error) {
    console.error('Error getting network info:', error);
    throw error;
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Example: Complete voting flow
async function completeVotingFlow() {
  try {
    // 1. Connect to wallet
    const { account } = await connectMetaMaskEthers();
    console.log('Connected as:', account);
    
    // 2. Check if voting is active
    const isActive = await isVotingActiveEthers();
    if (!isActive) {
      console.log('Voting is not active');
      return;
    }
    
    // 3. Get candidates
    const candidates = await getCandidatesEthers();
    console.log('Available candidates:', candidates);
    
    // 4. Check if user has already voted
    const hasVoted = await hasAddressVotedEthers(account);
    if (hasVoted) {
      console.log('You have already voted');
      return;
    }
    
    // 5. Cast vote (example: vote for candidate 0)
    const voteResult = await voteEthers(0);
    console.log('Vote cast successfully:', voteResult);
    
    // 6. Get vote proof
    const voteHash = await getVoteHashEthers(account);
    const txHash = await getVoteTxHashEthers(account);
    console.log('Vote proof:', { voteHash, txHash });
    
  } catch (error) {
    console.error('Voting flow failed:', error);
  }
}

// Example: Admin setup flow
async function adminSetupFlow() {
  try {
    // 1. Register candidates
    await registerCandidateEthers("Alice Johnson", "QmHash1");
    await registerCandidateEthers("Bob Smith", "QmHash2");
    await registerCandidateEthers("Carol Davis", "QmHash3");
    
    // 2. Start voting session (24 hours)
    const durationSeconds = 24 * 60 * 60; // 24 hours
    await startVotingSessionEthers(durationSeconds);
    
    console.log('Admin setup completed successfully');
  } catch (error) {
    console.error('Admin setup failed:', error);
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Web3.js functions
    connectMetaMaskWeb3,
    registerCandidateWeb3,
    startVotingSessionWeb3,
    stopVotingSessionWeb3,
    voteWeb3,
    getCandidatesWeb3,
    getTotalVotesWeb3,
    isVotingActiveWeb3,
    hasAddressVotedWeb3,
    getVoteHashWeb3,
    getVoteTxHashWeb3,
    listenToVoteCastEventsWeb3,
    
    // Ethers.js functions
    connectMetaMaskEthers,
    registerCandidateEthers,
    startVotingSessionEthers,
    stopVotingSessionEthers,
    voteEthers,
    getCandidatesEthers,
    getTotalVotesEthers,
    isVotingActiveEthers,
    hasAddressVotedEthers,
    getVoteHashEthers,
    getVoteTxHashEthers,
    listenToVoteCastEventsEthers,
    
    // Utility functions
    handleContractCall,
    estimateGas,
    getNetworkInfo,
    completeVotingFlow,
    adminSetupFlow
  };
} 