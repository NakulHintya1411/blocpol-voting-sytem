const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  // Voting Parameters
  minVotingPower: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  maxVotingPower: {
    type: Number,
    default: 100,
    min: 1,
    max: 1000
  },
  commitmentPeriod: {
    type: Number,
    default: 3600, // 1 hour in seconds
    min: 60,
    max: 86400 // 24 hours
  },
  revealPeriod: {
    type: Number,
    default: 1800, // 30 minutes in seconds
    min: 60,
    max: 86400 // 24 hours
  },
  
  // Feature Toggles
  zkProofsEnabled: {
    type: Boolean,
    default: true
  },
  liquidDemocracyEnabled: {
    type: Boolean,
    default: true
  },
  voteMixingEnabled: {
    type: Boolean,
    default: true
  },
  autoStartElections: {
    type: Boolean,
    default: false
  },
  requireEmailVerification: {
    type: Boolean,
    default: true
  },
  allowVoteChanges: {
    type: Boolean,
    default: false
  },
  
  // System Settings
  maxCandidatesPerElection: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  rateLimitPerMinute: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },
  maxVotesPerAddress: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  requireAdminApproval: {
    type: Boolean,
    default: true
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  
  // Security Settings
  sessionTimeout: {
    type: Number,
    default: 3600, // 1 hour in seconds
    min: 300, // 5 minutes
    max: 86400 // 24 hours
  },
  maxLoginAttempts: {
    type: Number,
    default: 5,
    min: 3,
    max: 10
  },
  lockoutDuration: {
    type: Number,
    default: 900, // 15 minutes in seconds
    min: 300, // 5 minutes
    max: 3600 // 1 hour
  },
  
  // Blockchain Settings
  gasLimit: {
    type: Number,
    default: 500000,
    min: 21000,
    max: 10000000
  },
  gasPrice: {
    type: Number,
    default: 20000000000, // 20 gwei
    min: 1000000000, // 1 gwei
    max: 100000000000 // 100 gwei
  },
  confirmationBlocks: {
    type: Number,
    default: 3,
    min: 1,
    max: 12
  },
  
  // Advanced Features
  enableVoteDelegation: {
    type: Boolean,
    default: true
  },
  enableVoteTransfer: {
    type: Boolean,
    default: false
  },
  enableVoteRevocation: {
    type: Boolean,
    default: false
  },
  enableAnonymousVoting: {
    type: Boolean,
    default: true
  },
  
  // Maintenance
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'System is under maintenance. Please try again later.'
  },
  
  // Last updated
  lastUpdatedBy: {
    type: String
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
adminSettingsSchema.index({}, { unique: true });

// Virtual for isMaintenanceMode
adminSettingsSchema.virtual('isMaintenanceMode').get(function() {
  return this.maintenanceMode;
});

// Pre-save middleware
adminSettingsSchema.pre('save', function(next) {
  this.lastUpdatedAt = new Date();
  next();
});

// Static method to get settings (singleton pattern)
adminSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);

