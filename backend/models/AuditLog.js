const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actionHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CANDIDATE_REGISTERED',
      'CANDIDATE_APPROVED',
      'CANDIDATE_REJECTED',
      'CANDIDATE_UPDATED',
      'CANDIDATE_DELETED',
      'ELECTION_CREATED',
      'ELECTION_UPDATED',
      'ELECTION_DELETED',
      'ELECTION_STARTED',
      'ELECTION_STOPPED',
      'VOTE_CAST',
      'VOTE_REVEALED',
      'VOTER_REGISTERED',
      'VOTER_VERIFIED',
      'SETTINGS_UPDATED',
      'AUDIT_LOG_CREATED',
      'ZK_VOTE_CAST',
      'DELEGATED_VOTE_CAST',
      'VOTE_MIXED'
    ]
  },
  actor: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid actor wallet address format'
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Number,
    required: true,
    index: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  proof: [{
    type: String
  }],
  metadata: {
    electionId: String,
    candidateId: String,
    voterId: String,
    transactionHash: String,
    blockNumber: Number,
    gasUsed: Number
  }
}, {
  timestamps: true
});

// Indexes
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ 'metadata.electionId': 1 });
auditLogSchema.index({ 'metadata.candidateId': 1 });
auditLogSchema.index({ 'metadata.voterId': 1 });

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return new Date(this.timestamp * 1000).toISOString();
});

// Static method to create audit log
auditLogSchema.statics.createLog = async function(action, actor, data, metadata = {}) {
  const actionHash = require('crypto')
    .createHash('sha256')
    .update(`${action}${actor}${JSON.stringify(data)}${Date.now()}`)
    .digest('hex');
  
  const log = new this({
    actionHash,
    action,
    actor,
    data,
    timestamp: Math.floor(Date.now() / 1000),
    metadata
  });
  
  await log.save();
  return log;
};

// Pre-save middleware
auditLogSchema.pre('save', function(next) {
  if (!this.actionHash) {
    this.actionHash = require('crypto')
      .createHash('sha256')
      .update(`${this.action}${this.actor}${JSON.stringify(this.data)}${this.timestamp}`)
      .digest('hex');
  }
  next();
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

