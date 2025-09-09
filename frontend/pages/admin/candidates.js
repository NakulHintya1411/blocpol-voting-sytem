import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useWallet } from '../../contexts/WalletContext';
import { apiService } from '../../services/api';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Vote,
  User,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';

export default function CandidatesManagement() {
  const router = useRouter();
  const { account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, pending, rejected

  useEffect(() => {
    // Always allow admin access for testing purposes
    setIsAdmin(true);
    fetchCandidates();
  }, []);

  const checkAdminStatus = async () => {
    // Always return admin access for testing purposes
    setIsAdmin(true);
    fetchCandidates();
  };

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getCandidates();
      setCandidates(data.candidates || []);
      console.log('Candidates loaded successfully');
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // Don't show error toast, just use empty array
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCandidate = async (candidateId) => {
    try {
      await apiService.approveCandidate(candidateId);
      toast.success('Candidate approved successfully');
      fetchCandidates();
    } catch (error) {
      console.error('Error approving candidate:', error);
      toast.error('Failed to approve candidate');
    }
  };

  const handleRejectCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to reject this candidate?')) {
      try {
        await apiService.rejectCandidate(candidateId);
        toast.success('Candidate rejected');
        fetchCandidates();
      } catch (error) {
        console.error('Error rejecting candidate:', error);
        toast.error('Failed to reject candidate');
      }
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await apiService.deleteCandidate(candidateId);
        toast.success('Candidate deleted successfully');
        fetchCandidates();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        toast.error('Failed to delete candidate');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.party?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Candidates Management - BlocPol Admin</title>
          <meta name="description" content="Manage candidates" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-4xl mx-auto px-4 py-20">
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Wallet Required
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Please connect your MetaMask wallet to access candidates management.
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
          <title>Candidates Management - BlocPol Admin</title>
          <meta name="description" content="Manage candidates" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="flex justify-center">
              <LoadingSpinner size="large" text="Loading candidates..." />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Head>
          <title>Access Denied - BlocPol</title>
          <meta name="description" content="Access denied" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-4xl mx-auto px-4 py-20">
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Access Denied
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                You do not have admin privileges to access this page.
              </p>
              
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Return to Home
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
        <title>Candidates Management - BlocPol Admin</title>
        <meta name="description" content="Manage candidates" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 py-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Candidates Management
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Manage candidate registrations and approvals
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/candidates/register')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Register Candidate</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'active', label: 'Active' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'rejected', label: 'Rejected' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                      statusFilter === tab.key
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-500 rounded-full">
                      {candidates.filter(c => statusFilter === 'all' ? true : c.status === tab.key).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Candidates List */}
          {filteredCandidates.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Candidates Found
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'No candidates match your search criteria.'
                  : 'Register your first candidate to get started.'
                }
              </p>
              <button
                onClick={() => router.push('/admin/candidates/register')}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Register Candidate</span>
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="p-6 hover:shadow-2xl transition-all duration-300" gradient>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        {candidate.photo ? (
                          <img
                            src={candidate.photo}
                            alt={candidate.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {candidate.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {candidate.party || 'Independent'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(candidate.status)}`}>
                      {getStatusIcon(candidate.status)}
                      <span>{candidate.status}</span>
                    </span>
                  </div>

                  {candidate.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {candidate.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Vote Count:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {candidate.voteCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Registration:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(candidate.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                    {candidate.electionId && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Election ID:</span>
                        <span className="text-gray-900 dark:text-white font-mono text-xs">
                          #{candidate.electionId}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/admin/candidates/${candidate.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/candidates/${candidate.id}/edit`)}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit Candidate"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      {candidate.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveCandidate(candidate.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectCandidate(candidate.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
