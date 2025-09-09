import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiService = {
  // Voter registration
  registerVoter: async (voterData) => {
    try {
      const response = await api.post('/register', voterData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register voter');
    }
  },

  // Get candidates list
  getCandidates: async () => {
    try {
      const response = await api.get('/candidates');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch candidates');
    }
  },

  // Cast vote
  castVote: async (voteData) => {
    try {
      const response = await api.post('/vote', voteData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cast vote');
    }
  },

  // Get election results
  getResults: async () => {
    try {
      const response = await api.get('/results');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch results');
    }
  },

  // Get voter status
  getVoterStatus: async (walletAddress) => {
    try {
      const response = await api.get(`/voter-status/${walletAddress}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch voter status');
    }
  },

  // Verify vote
  verifyVote: async (transactionHash) => {
    try {
      const response = await api.get(`/verify-vote/${transactionHash}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify vote');
    }
  },




  
  // Admin functions
  checkAdminStatus: async (walletAddress) => {
    try {
      const response = await api.get(`/admin/status/${walletAddress}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check admin status');
    }
  },

  getAdminStats: async () => {
    try {
      const response = await api.get('/admin-stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
    }
  },

  getElections: async () => {
    try {
      const response = await api.get('/elections');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch elections');
    }
  },

  createElection: async (electionData) => {
    try {
      const response = await api.post('/admin/elections', electionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create election');
    }
  },

  startElection: async (electionId) => {
    try {
      const response = await api.post(`/admin/elections/${electionId}/start`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to start election');
    }
  },

  stopElection: async (electionId) => {
    try {
      const response = await api.post(`/admin/elections/${electionId}/stop`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to stop election');
    }
  },

  deleteElection: async (electionId) => {
    try {
      const response = await api.delete(`/admin/elections/${electionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete election');
    }
  },

  registerCandidate: async (candidateData) => {
    try {
      const response = await api.post('/admin/candidates', candidateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register candidate');
    }
  },

  approveCandidate: async (candidateId) => {
    try {
      const response = await api.post(`/admin/candidates/${candidateId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to approve candidate');
    }
  },

  rejectCandidate: async (candidateId) => {
    try {
      const response = await api.post(`/admin/candidates/${candidateId}/reject`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reject candidate');
    }
  },

  deleteCandidate: async (candidateId) => {
    try {
      const response = await api.delete(`/admin/candidates/${candidateId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete candidate');
    }
  },

  getAuditLogs: async (filters) => {
    try {
      const response = await api.get('/admin/audit', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch audit logs');
    }
  },

  exportAuditLogs: async (filters) => {
    try {
      const response = await api.post('/admin/audit/export', filters, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export audit logs');
    }
  },

  getAdminSettings: async () => {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin settings');
    }
  },

  updateAdminSettings: async (settings) => {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update admin settings');
    }
  },
};

export default api;
