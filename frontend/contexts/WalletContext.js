import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setIsConnected(true);
        setError(null);
        return true;
      }
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
      setError('Failed to connect to MetaMask. Please try again.');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setIsConnected(false);
    setError(null);
  };

  // Sign a message
  const signMessage = async (message) => {
    if (!web3 || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await web3.eth.personal.sign(message, account);
      return signature;
    } catch (err) {
      console.error('Error signing message:', err);
      throw new Error('Failed to sign message');
    }
  };

  // Get account balance
  const getBalance = async () => {
    if (!web3 || !account) return '0';

    try {
      const balance = await web3.eth.getBalance(account);
      return web3.utils.fromWei(balance, 'ether');
    } catch (err) {
      console.error('Error getting balance:', err);
      return '0';
    }
  };

  // Check if already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        } catch (err) {
          console.error('Error checking connection:', err);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [account]);

  const value = {
    account,
    web3,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    signMessage,
    getBalance,
    isMetaMaskInstalled,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
