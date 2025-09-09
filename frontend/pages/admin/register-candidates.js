import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useWallet } from '../../contexts/WalletContext';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Search,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function RegisterCandidates() {
  const router = useRouter();
  const { account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    party: '',
    walletAddress: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if not admin
  if (!isClient) {
    return <LoadingSpinner />;
  }

  if (!isConnected || !account) {
    router.push('/');
    return null;
  }

  // Load elections on component mount
  useEffect(() => {
    loadElections();
  }, []);

  // Load candidates when election is selected
  useEffect(() => {
    if (selectedElection) {
      loadCandidates(selectedElection);
    }
  }, [selectedElection]);

  const loadElections = async () => {
    try {
      const response = await fetch('/api/elections');
      const result = await response.json();
      
      if (result.success) {
        setElections(result.data);
      } else {
        toast.error('Failed to load elections');
      }
    } catch (error) {
      console.error('Error loading elections:', error);
      toast.error('Error loading elections');
    }
  };

  const loadCandidates = async (electionId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/candidates?electionId=${electionId}`);
      const result = await response.json();
      
      if (result.success) {
        setCandidates(result.data);
      } else {
        toast.error('Failed to load candidates');
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Error loading candidates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.walletAddress) {
        toast.error('Name and wallet address are required');
        return;
      }

      // Register candidate
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          electionId: selectedElection,
          registeredBy: account
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Candidate registered successfully!');
        setFormData({
          name: '',
          description: '',
          party: '',
          walletAddress: '',
          email: '',
          phone: ''
        });
        setShowAddForm(false);
        loadCandidates(selectedElection);
      } else {
        toast.error(result.error || 'Failed to register candidate');
      }
    } catch (error) {
      console.error('Error registering candidate:', error);
      toast.error('An error occurred while registering the candidate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!confirm('Are you sure you want to delete this candidate?')) {
      return;
    }

    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Candidate deleted successfully!');
        loadCandidates(selectedElection);
      } else {
        toast.error(result.error || 'Failed to delete candidate');
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('An error occurred while deleting the candidate');
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.party?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Register Candidates - BlocPol Admin</title>
        <meta name="description" content="Register candidates for elections" />
      </Head>

      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Register Candidates
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage candidates for elections
            </p>
          </div>

          {/* Election Selection */}
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Select Election
              </h2>
              <select
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose an election...</option>
                {elections.map(election => (
                  <option key={election.id} value={election.id}>
                    {election.title} - {election.status}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {selectedElection && (
            <>
              {/* Search and Add */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Candidate
                </button>
              </div>

              {/* Add Candidate Form */}
              {showAddForm && (
                <Card className="mb-6">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Add New Candidate
                      </h3>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Candidate name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Wallet Address *
                          </label>
                          <input
                            type="text"
                            name="walletAddress"
                            value={formData.walletAddress}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="0x..."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Party/Organization
                          </label>
                          <input
                            type="text"
                            name="party"
                            value={formData.party}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Party or organization"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="candidate@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Brief description about the candidate"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Register Candidate
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </Card>
              )}

              {/* Candidates List */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Registered Candidates ({filteredCandidates.length})
                  </h3>

                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No candidates found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCandidates.map((candidate) => (
                        <div key={candidate.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                {candidate.name}
                              </h4>
                              {candidate.party && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {candidate.party}
                                </p>
                              )}
                              {candidate.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                  {candidate.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                                Wallet: {candidate.walletAddress}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDeleteCandidate(candidate.id)}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                                title="Delete candidate"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
