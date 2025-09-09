// App Constants
export const APP_CONFIG = {
  name: 'BlocPol',
  version: '1.0.0',
  description: 'Secure Blockchain Voting System',
};

// API Endpoints
export const API_ENDPOINTS = {
  REGISTER: '/register',
  CANDIDATES: '/candidates',
  VOTE: '/vote',
  RESULTS: '/results',
  VOTER_STATUS: '/voter-status',
  VERIFY_VOTE: '/verify-vote',
};

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  NETWORKS: {
    1: 'mainnet',
    3: 'ropsten',
    4: 'rinkeby',
    5: 'goerli',
    42: 'kovan',
    137: 'polygon',
    80001: 'mumbai',
  },
  DEFAULT_NETWORK: 1,
};

// UI Constants
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_CANDIDATES_DISPLAY: 10,
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  NAME_MIN_LENGTH: 'Name must be at least 2 characters',
  NAME_MAX_LENGTH: 'Name must be less than 50 characters',
  WALLET_REQUIRED: 'Please connect your wallet first',
  VOTE_ALREADY_CAST: 'You have already voted',
};

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Wallet not connected',
  WALLET_CONNECTION_FAILED: 'Failed to connect to wallet',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  VOTING_FAILED: 'Failed to cast vote. Please try again.',
  RESULTS_FETCH_FAILED: 'Failed to fetch results',
  CANDIDATES_FETCH_FAILED: 'Failed to fetch candidates',
  VOTE_VERIFICATION_FAILED: 'Failed to verify vote',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  REGISTRATION_SUCCESS: 'Registration successful!',
  VOTE_CAST_SUCCESS: 'Vote cast successfully!',
  VOTE_VERIFIED: 'Vote verified successfully!',
  RESULTS_UPDATED: 'Results updated',
};

// Chart Colors
export const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6b7280', // Gray
];
