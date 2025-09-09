const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  votingMode: {
    type: String,
    enum: ['SIMPLE_MAJORITY', 'RANKED_CHOICE', 'LIQUID_DEMOCRACY', 'MIXED_ANONYMOUS'],
    default: 'SIMPLE_MAJORITY'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  maxCandidates: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  requirements: {
    minAge: { type: Number, default: 18 },
    citizenship: { type: Boolean, default: true },
    residency: { type: String, default: '' },
    other: { type: String, default: '' }
  },
  candidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  }],
  voteCount: {
    type: Number,
    default: 0
  },
  totalVotingPower: {
    type: Number,
    default: 0
  },
  merkleRoot: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
electionSchema.index({ status: 1 });
electionSchema.index({ startDate: 1, endDate: 1 });
electionSchema.index({ createdBy: 1 });
electionSchema.index({ title: 'text', description: 'text' });

// Virtual for duration
electionSchema.virtual('duration').get(function() {
  if (this.actualStartDate && this.actualEndDate) {
    return this.actualEndDate - this.actualStartDate;
  }
  return this.endDate - this.startDate;
});

// Virtual for isActive
electionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Pre-save middleware
electionSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('Start date must be before end date'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Election', electionSchema);

