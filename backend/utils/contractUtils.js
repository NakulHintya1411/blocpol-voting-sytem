const { ethers } = require('ethers');

let contractInstance = null;
let provider = null;

// Initialize provider and contract
const initializeContract = async () => {
  try {
    // Get provider
    if (process.env.NODE_ENV === 'production') {
      provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    } else {
      provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    }

    // Get contract ABI and address
    const contractABI = require('../../abi/BlocPol.json').abi;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!contractAddress) {
      throw new Error('Contract address not found in environment variables');
    }

    // Create contract instance
    contractInstance = new ethers.Contract(contractAddress, contractABI, provider);

    console.log('Contract initialized successfully');
    return contractInstance;
  } catch (error) {
    console.error('Error initializing contract:', error);
    throw error;
  }
};

// Get contract instance
const getContractInstance = async () => {
  if (!contractInstance) {
    await initializeContract();
  }
  return contractInstance;
};

// Get provider
const getProvider = () => {
  return provider;
};

// Get contract with signer (for admin operations)
const getContractWithSigner = async (privateKey) => {
  try {
    if (!provider) {
      await initializeContract();
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const contractABI = require('../../abi/BlocPol.json').abi;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    return new ethers.Contract(contractAddress, contractABI, wallet);
  } catch (error) {
    console.error('Error getting contract with signer:', error);
    throw error;
  }
};

// Verify transaction
const verifyTransaction = async (txHash) => {
  try {
    if (!provider) {
      await initializeContract();
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    return {
      success: receipt.status === 1,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    throw error;
  }
};

// Get block timestamp
const getBlockTimestamp = async (blockNumber) => {
  try {
    if (!provider) {
      await initializeContract();
    }

    const block = await provider.getBlock(blockNumber);
    return block.timestamp;
  } catch (error) {
    console.error('Error getting block timestamp:', error);
    throw error;
  }
};

// Get current block number
const getCurrentBlockNumber = async () => {
  try {
    if (!provider) {
      await initializeContract();
    }

    return await provider.getBlockNumber();
  } catch (error) {
    console.error('Error getting current block number:', error);
    throw error;
  }
};

// Estimate gas for transaction
const estimateGas = async (method, ...args) => {
  try {
    const contract = await getContractInstance();
    return await contract.estimateGas[method](...args);
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
};

// Get contract events
const getContractEvents = async (eventName, fromBlock = 0, toBlock = 'latest') => {
  try {
    const contract = await getContractInstance();
    const filter = contract.filters[eventName]();
    return await contract.queryFilter(filter, fromBlock, toBlock);
  } catch (error) {
    console.error('Error getting contract events:', error);
    throw error;
  }
};

// Listen to contract events
const listenToEvents = (eventName, callback) => {
  try {
    if (!contractInstance) {
      throw new Error('Contract not initialized');
    }

    contractInstance.on(eventName, callback);
  } catch (error) {
    console.error('Error listening to events:', error);
    throw error;
  }
};

// Remove event listeners
const removeAllListeners = () => {
  try {
    if (contractInstance) {
      contractInstance.removeAllListeners();
    }
  } catch (error) {
    console.error('Error removing listeners:', error);
  }
};

module.exports = {
  initializeContract,
  getContractInstance,
  getProvider,
  getContractWithSigner,
  verifyTransaction,
  getBlockTimestamp,
  getCurrentBlockNumber,
  estimateGas,
  getContractEvents,
  listenToEvents,
  removeAllListeners
};

