import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, ExternalLink, Copy, Check, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Confirmation() {
  const router = useRouter();
  const { account, isConnected } = useWallet();
  const [transactionHash, setTransactionHash] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (router.query.txHash) {
      setTransactionHash(router.query.txHash);
    }
    if (router.query.candidate) {
      setCandidateName(router.query.candidate);
    }
  }, [router.query]);

  useEffect(() => {
    if (transactionHash) {
      verifyVote();
    }
  }, [transactionHash]);

  const verifyVote = async () => {
    if (!transactionHash) return;

    setIsVerifying(true);
    setVerificationError('');

    try {
      const response = await apiService.verifyVote(transactionHash);
      setIsVerified(true);
      toast.success('Vote verified successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError('Failed to verify vote');
      toast.error('Failed to verify vote');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Transaction hash copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatTransactionHash = (hash) => {
    if (!hash) return '';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Vote Confirmation - BlocPol</title>
          <meta name="description" content="Vote confirmation page" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-2xl mx-auto px-4 py-20">
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Wallet Required
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Please connect your wallet to view vote confirmation.
              </p>
              
              <button
                onClick={() => router.push('/register')}
                className="btn-primary"
              >
                Connect Wallet
              </button>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Vote Confirmation - BlocPol</title>
        <meta name="description" content="Vote confirmation page" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <div className="max-w-2xl mx-auto px-4 py-20">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-bounce-gentle">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Vote Cast Successfully!
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300">
                Your vote has been recorded on the blockchain
              </p>
            </div>

            {/* Vote Details */}
            <div className="space-y-6">
              {/* Candidate Information */}
              {candidateName && (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Voted For
                  </h3>
                  <p className="text-xl text-primary-600 dark:text-primary-400 font-medium">
                    {candidateName}
                  </p>
                </div>
              )}

              {/* Transaction Hash */}
              {transactionHash && (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Transaction Hash
                  </h3>
                  <div className="flex items-center space-x-3">
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-300 flex-1">
                      {formatTransactionHash(transactionHash)}
                    </p>
                    <button
                      onClick={() => copyToClipboard(transactionHash)}
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors duration-200"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Verification Status
                </h3>
                {isVerifying ? (
                  <div className="flex items-center space-x-3">
                    <LoadingSpinner size="small" text="" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Verifying vote...
                    </span>
                  </div>
                ) : isVerified ? (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">
                      Vote verified successfully
                    </span>
                  </div>
                ) : verificationError ? (
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 dark:text-red-400">
                      {verificationError}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">
                      Pending verification
                    </span>
                  </div>
                )}
              </div>

              {/* Blockchain Explorer Link */}
              {transactionHash && (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    View on Blockchain
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    You can view your transaction on the blockchain explorer
                  </p>
                  <a
                    href={`https://etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Transaction</span>
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => router.push('/results')}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Results</span>
              </button>
              <button
                onClick={() => router.push('/candidates')}
                className="btn-outline flex-1 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Candidates</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
