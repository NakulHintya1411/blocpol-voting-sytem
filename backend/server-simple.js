const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  const adminAddresses = process.env.ADMIN_ADDRESSES?.split(',').map(addr => addr.toLowerCase().trim()) || [];
  res.json({
    ADMIN_ADDRESSES: process.env.ADMIN_ADDRESSES,
    adminAddresses,
    NODE_ENV: process.env.NODE_ENV
  });
});

// Mock admin status endpoint - Open to all users
app.get('/api/admin/status/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  
  // Make all users admin for testing purposes
  const isAdmin = true;
  
  console.log('Admin access granted to:', walletAddress);
  
  res.json({
    success: true,
    isAdmin,
    walletAddress
  });
});

// Mock admin stats endpoint
app.get('/api/admin/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalVoters: 0,
      totalCandidates: 0,
      totalVotes: 0,
      activeElections: 0
    }
  });
});

// Mock elections endpoint
app.get('/api/admin/elections', (req, res) => {
  res.json({
    success: true,
    elections: [],
    totalPages: 1,
    currentPage: 1
  });
});

// Mock candidates endpoint
app.get('/api/admin/candidates', (req, res) => {
  res.json({
    success: true,
    candidates: [],
    totalPages: 1,
    currentPage: 1
  });
});

// Mock audit logs endpoint
app.get('/api/admin/audit', (req, res) => {
  res.json({
    success: true,
    logs: [],
    totalPages: 1,
    currentPage: 1
  });
});

// Mock admin settings endpoint
app.get('/api/admin/settings', (req, res) => {
  res.json({
    success: true,
    settings: {
      minVotingPower: 1,
      maxVotingPower: 100,
      commitmentPeriod: 3600,
      revealPeriod: 1800,
      zkProofsEnabled: true,
      liquidDemocracyEnabled: true,
      voteMixingEnabled: true,
      autoStartElections: false,
      requireEmailVerification: true,
      allowVoteChanges: false,
      maxCandidatesPerElection: 10,
      rateLimitPerMinute: 10,
      maxVotesPerAddress: 1,
      requireAdminApproval: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    }
  });
});

// Mock voter endpoints
app.post('/api/voter/register', (req, res) => {
  res.json({
    success: true,
    message: 'Voter registered successfully',
    voter: {
      id: 'mock-id',
      name: req.body.name,
      email: req.body.email,
      walletAddress: req.body.walletAddress,
      registrationDate: new Date().toISOString()
    }
  });
});

app.get('/api/voter/status/:walletAddress', (req, res) => {
  res.json({
    success: true,
    voter: {
      id: 'mock-id',
      name: 'Mock Voter',
      email: 'mock@example.com',
      walletAddress: req.params.walletAddress,
      isVerified: true,
      registrationDate: new Date().toISOString(),
      totalVotes: 0,
      isActive: true,
      banned: false
    }
  });
});

app.post('/api/voter/vote', (req, res) => {
  res.json({
    success: true,
    message: 'Vote cast successfully',
    transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
    candidate: {
      id: req.body.candidateId,
      name: 'Mock Candidate',
      party: 'Mock Party'
    }
  });
});

app.get('/api/voter/verify/:transactionHash', (req, res) => {
  res.json({
    success: true,
    verified: true,
    vote: {
      transactionHash: req.params.transactionHash,
      voteHash: '0x' + Math.random().toString(16).substr(2, 64),
      candidate: {
        id: 'mock-candidate-id',
        name: 'Mock Candidate',
        party: 'Mock Party'
      },
      election: {
        id: 'mock-election-id',
        title: 'Mock Election'
      },
      votedAt: new Date().toISOString()
    }
  });
});

// Mock election endpoints
app.get('/api/election/candidates', (req, res) => {
  res.json({
    success: true,
    candidates: []
  });
});

app.get('/api/election/results', (req, res) => {
  res.json({
    success: true,
    candidates: [],
    totalVotes: 0,
    winner: null,
    election: null
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Admin addresses: ${process.env.ADMIN_ADDRESSES || 'Not configured'}`);
  console.log('Note: Running in mock mode without database');
});

module.exports = app;
