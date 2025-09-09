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
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  User, 
  Vote,
  Settings,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  FileText,
  ExternalLink
} from 'lucide-react';

export default function AuditTrail() {
  const router = useRouter();
  const { account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const actionTypes = [
    'all',
    'CANDIDATE_REGISTERED',
    'VOTE_CAST',
    'VOTING_SESSION_CREATED',
    'VOTING_SESSION_ENDED',
    'VOTE_REVEALED',
    'ZK_VOTE_CAST',
    'DELEGATED_VOTE_CAST',
    'AUDIT_LOG_CREATED'
  ];

  const dateRanges = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    // Always allow admin access for testing purposes
    setIsAdmin(true);
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAuditLogs();
    }
  }, [isAdmin, currentPage, actionFilter, dateFilter]);

  const checkAdminStatus = async () => {
    // Always return admin access for testing purposes
    setIsAdmin(true);
    fetchAuditLogs();
  };

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAuditLogs({
        page: currentPage,
        limit: itemsPerPage,
        action: actionFilter,
        dateRange: dateFilter,
        search: searchTerm
      });
      
      setAuditLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
      console.log('Audit logs loaded successfully');
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Don't show error toast, just use empty array
      setAuditLogs([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAuditLogs();
  };

  const handleExport = async () => {
    try {
      await apiService.exportAuditLogs({
        action: actionFilter,
        dateRange: dateFilter,
        search: searchTerm
      });
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CANDIDATE_REGISTERED':
        return <User className="w-4 h-4" />;
      case 'VOTE_CAST':
        return <Vote className="w-4 h-4" />;
      case 'VOTING_SESSION_CREATED':
      case 'VOTING_SESSION_ENDED':
        return <Calendar className="w-4 h-4" />;
      case 'VOTE_REVEALED':
        return <CheckCircle className="w-4 h-4" />;
      case 'ZK_VOTE_CAST':
      case 'DELEGATED_VOTE_CAST':
        return <Shield className="w-4 h-4" />;
      case 'AUDIT_LOG_CREATED':
        return <FileText className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CANDIDATE_REGISTERED':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'VOTE_CAST':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'VOTING_SESSION_CREATED':
      case 'VOTING_SESSION_ENDED':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      case 'VOTE_REVEALED':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'ZK_VOTE_CAST':
      case 'DELEGATED_VOTE_CAST':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Audit Trail - BlocPol Admin</title>
          <meta name="description" content="View audit trail" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-4xl mx-auto px-4 py-20">
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Wallet Required
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Please connect your MetaMask wallet to access audit trail.
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
          <title>Audit Trail - BlocPol Admin</title>
          <meta name="description" content="View audit trail" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar />
          
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="flex justify-center">
              <LoadingSpinner size="large" text="Loading audit trail..." />
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
                  <Shield className="w-8 h-8 text-red-500" />
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
        <title>Audit Trail - BlocPol Admin</title>
        <meta name="description" content="View audit trail" />
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
                Audit Trail
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Monitor all system activities and transactions
              </p>
            </div>
            <button
              onClick={handleExport}
              className="btn-outline flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Export Logs</span>
            </button>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search audit logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Filter */}
              <div>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {actionTypes.map((action) => (
                    <option key={action} value={action}>
                      {action === 'all' ? 'All Actions' : action.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {dateRanges.map((range) => (
                    <option key={range.key} value={range.key}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Audit Logs Table */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Actor
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Timestamp
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Details
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <FileText className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-gray-600 dark:text-gray-300">
                            No audit logs found
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log, index) => (
                      <tr key={log.actionHash || index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                              {getActionIcon(log.action)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {log.action.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                                {log.actionHash ? `${log.actionHash.slice(0, 8)}...` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {formatAddress(log.actor)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                            {log.data || 'No additional data'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/admin/audit/${log.actionHash}`)}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.open(`https://etherscan.io/tx/${log.actionHash}`, '_blank')}
                              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="View on Blockchain"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
