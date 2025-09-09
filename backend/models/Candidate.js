const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  party: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  photo: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Photo must be a valid image URL'
    }
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  walletAddress: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid wallet address format'
    }
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
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  voteCount: {
    type: Number,
    default: 0
  },
  delegatedVoteCount: {
    type: Number,
    default: 0
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: String
  },
  rejectedAt: {
    type: Date
  },
  rejectedBy: {
    type: String
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  registeredBy: {
    type: String,
    required: true
  },
  documents: [{
    type: {
      type: String,
      enum: ['id', 'passport', 'certificate', 'other']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  socialMedia: {
    website: String,
    twitter: String,
    facebook: String,
    linkedin: String
  }
}, {
  timestamps: true
});

// Indexes
candidateSchema.index({ electionId: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ walletAddress: 1 });
candidateSchema.index({ name: 'text', party: 'text' });
candidateSchema.index({ email: 1 });

// Virtual for total votes
candidateSchema.virtual('totalVotes').get(function() {
  return this.voteCount + this.delegatedVoteCount;
});

// Virtual for isApproved
candidateSchema.virtual('isApproved').get(function() {
  return this.status === 'active';
});

// Pre-save middleware
candidateSchema.pre('save', function(next) {
  if (this.status === 'active' && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  if (this.status === 'rejected' && !this.rejectedAt) {
    this.rejectedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Candidate', candidateSchema);

