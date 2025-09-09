import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '../contexts/WalletContext';
import { apiService } from '../services/api';
import { Wallet, Menu, X, User, LogOut, Settings, Shield } from 'lucide-react';

const Navbar = () => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  useEffect(() => {
    // Always show admin access for testing purposes
    setIsAdmin(true);
    
    if (isConnected && account) {
      checkAdminStatus();
    } else {
      // Still show admin access even when not connected
      setIsAdmin(true);
    }
  }, [isConnected, account]);

  const checkAdminStatus = async () => {
    setIsCheckingAdmin(true);
    try {
      const adminStatus = await apiService.checkAdminStatus(account);
      // Always set as admin for testing purposes
      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      // Still show admin access even on error
      setIsAdmin(true);
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnectWallet = async () => {
    await connectWallet();
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BP</span>
            </div>
            <span className="text-xl font-bold gradient-text">BlocPol</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/candidates"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              Candidates
            </Link>
            <Link
              href="/results"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              Results
            </Link>
            <Link
              href="/register"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              Register
            </Link>
            <Link
              href="/admin"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl">
                  <Wallet className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatAddress(account)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors duration-200"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 dark:bg-gray-800 rounded-lg mt-2">
              <Link
                href="/candidates"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Candidates
              </Link>
              <Link
                href="/results"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Results
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
              <Link
                href="/admin"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
              
              {/* Mobile Wallet Connection */}
              <div className="px-3 py-2">
                {isConnected ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl">
                      <Wallet className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatAddress(account)}
                      </span>
                    </div>
                    <button
                      onClick={handleDisconnectWallet}
                      className="w-full flex items-center justify-center space-x-2 text-gray-500 hover:text-red-500 transition-colors duration-200 py-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
