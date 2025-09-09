const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid wallet address format'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  votingHistory: [{
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election'
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate'
    },
    voteType: {
      type: String,
      enum: ['DIRECT', 'DELEGATED', 'MIXED', 'ZK_PROOF'],
      default: 'DIRECT'
    },
    transactionHash: String,
    voteHash: String,
    votingPower: {
      type: Number,
      default: 1
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
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
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['id', 'passport', 'proof_of_address', 'other']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  banned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String
  },
  banDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
voterSchema.index({ walletAddress: 1 });
voterSchema.index({ email: 1 });
voterSchema.index({ isVerified: 1 });
voterSchema.index({ registrationDate: 1 });
voterSchema.index({ name: 'text' });

// Virtual for total votes
voterSchema.virtual('totalVotes').get(function() {
  return this.votingHistory.length;
});

// Virtual for hasVotedInElection
voterSchema.methods.hasVotedInElection = function(electionId) {
  return this.votingHistory.some(vote => 
    vote.electionId.toString() === electionId.toString()
  );
};

// Virtual for getVoteInElection
voterSchema.methods.getVoteInElection = function(electionId) {
  return this.votingHistory.find(vote => 
    vote.electionId.toString() === electionId.toString()
  );
};

// Pre-save middleware
voterSchema.pre('save', function(next) {
  if (this.isVerified && !this.verificationDate) {
    this.verificationDate = new Date();
  }
  next();
});

module.exports = mongoose.model('Voter', voterSchema);

