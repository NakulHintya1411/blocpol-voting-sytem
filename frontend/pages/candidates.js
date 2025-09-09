import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import Card, { CardBody, CardTitle, CardDescription } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Vote, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function Candidates() {
  const router = useRouter();
  const { account, isConnected, signMessage } = useWallet();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidate, setVotedCandidate] = useState(null);

  useEffect(() => {
    if (isConnected) {
      fetchCandidates();
      checkVotingStatus();
    } else {
      setIsLoading(false);
    }
  }, [isConnected]);

  const fetchCandidates = async () => {
    try {
      const data = await apiService.getCandidates();
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    } finally {
      setIsLoading(false);
    }
  };

  const checkVotingStatus = async () => {
    try {
      const status = await apiService.getVoterStatus(account);
      if (status.hasVoted) {
        setHasVoted(true);
        setVotedCandidate(status.votedCandidate);
      }
    } catch (error) {
      console.error('Error checking voting status:', error);
    }
  };

  const handleVote = async (candidateId, candidateName) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (hasVoted) {
      toast.error('You have already voted');
      return;
    }

    setIsVoting(true);

    try {
      // Sign a message for authentication
      const message = `Vote for candidate: ${candidateName} (ID: ${candidateId})`;
      const signature = await signMessage(message);

      const voteData = {
        candidateId: candidateId,
        walletAddress: account,
        signature: signature,
        message: message,
      };

      const response = await apiService.castVote(voteData);
      
      toast.success('Vote cast successfully!');
      setHasVoted(true);
      setVotedCandidate(candidateName);
      
      // Redirect to confirmation page
      setTimeout(() => {
        router.push(`/confirmation?txHash=${response.transactionHash}&candidate=${candidateName}`);
      }, 2000);

    } catch (error) {
      console.error('Voting error:', error);
      toast.error(error.message || 'Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Candidates - BlocPol</title>
          <meta name="description" content="View and vote for candidates" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-4xl mx-auto px-4 py-20">
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
                Please connect your MetaMask wallet to view candidates and vote.
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

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Candidates - BlocPol</title>
          <meta name="description" content="View and vote for candidates" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="flex justify-center">
              <LoadingSpinner size="large" text="Loading candidates..." />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Candidates - BlocPol</title>
        <meta name="description" content="View and vote for candidates" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Election Candidates
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose your preferred candidate and cast your vote securely
            </p>
          </div>

          {hasVoted && (
            <div className="mb-8">
              <Card className="p-6 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Vote Cast Successfully!
                    </h3>
                    <p className="text-green-600 dark:text-green-300">
                      You have voted for: <strong>{votedCandidate}</strong>
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {candidates.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Candidates Available
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                There are no candidates registered for this election yet.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {candidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  className="p-6 hover:shadow-2xl transition-all duration-300"
                  gradient
                >
                  <div className="text-center">
                    {/* Candidate Photo */}
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      {candidate.photo ? (
                        <img
                          src={candidate.photo}
                          alt={candidate.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>

                    {/* Candidate Info */}
                    <CardTitle className="text-xl mb-2">
                      {candidate.name}
                    </CardTitle>
                    
                    {candidate.party && (
                      <CardDescription className="text-sm mb-4">
                        {candidate.party}
                      </CardDescription>
                    )}

                    {candidate.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {candidate.description}
                      </p>
                    )}

                    {/* Vote Button */}
                    <button
                      onClick={() => handleVote(candidate.id, candidate.name)}
                      disabled={isVoting || hasVoted}
                      className={`w-full py-3 px-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        hasVoted
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : isVoting
                          ? 'bg-yellow-500 text-white cursor-not-allowed'
                          : 'btn-primary'
                      }`}
                    >
                      {isVoting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <LoadingSpinner size="small" text="" />
                          <span>Voting...</span>
                        </div>
                      ) : hasVoted ? (
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Voted</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Vote className="w-4 h-4" />
                          <span>Vote</span>
                        </div>
                      )}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* View Results Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/results')}
              className="btn-outline flex items-center space-x-2 mx-auto"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Live Results</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
