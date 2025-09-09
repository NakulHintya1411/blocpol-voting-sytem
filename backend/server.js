const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BlocPol Backend API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Basic API endpoints
app.get('/api/elections', (req, res) => {
  res.json({
    success: true,
    elections: [],
    message: 'No elections found'
  });
});

app.get('/api/candidates', (req, res) => {
  res.json({
    success: true,
    candidates: [],
    message: 'No candidates found'
  });
});

app.get('/api/admin-stats', (req, res) => {
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

// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected successfully');
    } else {
      console.log('⚠️  MONGODB_URI not provided, running without database');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

// Connect to database
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BlocPol Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
