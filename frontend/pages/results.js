import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useWallet } from '../contexts/WalletContext';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, RefreshCw, Users, Vote, TrendingUp, Clock } from 'lucide-react';

export default function Results() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  useEffect(() => {
    fetchResults();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const data = await apiService.getResults();
      setResults(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch results');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchResults();
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getTotalVotes = () => {
    if (!results?.candidates) return 0;
    return results.candidates.reduce((total, candidate) => total + candidate.votes, 0);
  };

  const getWinner = () => {
    if (!results?.candidates) return null;
    return results.candidates.reduce((winner, candidate) => 
      candidate.votes > winner.votes ? candidate : winner
    );
  };

  const getVotePercentage = (votes) => {
    const total = getTotalVotes();
    return total > 0 ? ((votes / total) * 100).toFixed(1) : 0;
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Election Results - BlocPol</title>
          <meta name="description" content="Live election results and statistics" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="flex justify-center">
              <LoadingSpinner size="large" text="Loading results..." />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Election Results - BlocPol</title>
        <meta name="description" content="Live election results and statistics" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 py-20">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Election Results
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Live results and statistics
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn-outline flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4" />
                <span>
                  Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center" gradient>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {results?.candidates?.length || 0}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Candidates</p>
            </Card>

            <Card className="p-6 text-center" gradient>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Vote className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {formatNumber(getTotalVotes())}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Total Votes</p>
            </Card>

            <Card className="p-6 text-center" gradient>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {results?.winner ? results.winner.name : 'TBD'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Leading</p>
            </Card>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
              <button
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Bar Chart</span>
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                  chartType === 'pie'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <PieChartIcon className="w-4 h-4" />
                <span>Pie Chart</span>
              </button>
            </div>
          </div>

          {/* Results Chart */}
          {results?.candidates && results.candidates.length > 0 ? (
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Vote Distribution
              </h2>
              
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={results.candidates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatNumber(value), 'Votes']}
                        labelFormatter={(label) => `Candidate: ${label}`}
                      />
                      <Bar dataKey="votes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={results.candidates}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="votes"
                      >
                        {results.candidates.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatNumber(value), 'Votes']} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <BarChart3 className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Results Available
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                There are no votes cast yet or results are not available.
              </p>
            </Card>
          )}

          {/* Detailed Results Table */}
          {results?.candidates && results.candidates.length > 0 && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Detailed Results
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Rank
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Candidate
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Votes
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Percentage
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.candidates
                      .sort((a, b) => b.votes - a.votes)
                      .map((candidate, index) => (
                        <tr key={candidate.id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                              index === 0 
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {candidate.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {candidate.name}
                                </p>
                                {candidate.party && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {candidate.party}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatNumber(candidate.votes)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {getVotePercentage(candidate.votes)}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getVotePercentage(candidate.votes)}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
