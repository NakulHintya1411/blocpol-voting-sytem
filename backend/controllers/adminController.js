const { ethers } = require('ethers');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Voter = require('../models/Voter');
const AuditLog = require('../models/AuditLog');
const AdminSettings = require('../models/AdminSettings');
const { getContractInstance } = require('../utils/contractUtils');

// Check if wallet address is admin
const checkAdminStatus = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Check if address is in admin list (from environment or database)
    const adminAddresses = process.env.ADMIN_ADDRESSES?.split(',') || [];
    const isAdmin = adminAddresses.includes(walletAddress.toLowerCase());
    
    res.json({
      success: true,
      isAdmin,
      walletAddress
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check admin status'
    });
  }
};

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    const [
      totalVoters,
      totalCandidates,
      activeElections,
      totalVotes
    ] = await Promise.all([
      Voter.countDocuments(),
      Candidate.countDocuments(),
      Election.countDocuments({ status: 'active' }),
      Election.aggregate([
        { $group: { _id: null, totalVotes: { $sum: '$voteCount' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalVoters,
        totalCandidates,
        totalVotes: totalVotes[0]?.totalVotes || 0,
        activeElections
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
};

// Get all elections
const getElections = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const elections = await Election.find(query)
      .populate('candidates', 'name party')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Election.countDocuments(query);

    res.json({
      success: true,
      elections,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch elections'
    });
  }
};

// Create new election
const createElection = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      votingMode = 'SIMPLE_MAJORITY',
      maxCandidates,
      requirements
    } = req.body;

    const election = new Election({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      votingMode,
      maxCandidates: maxCandidates || 10,
      requirements: requirements || {},
      status: 'draft',
      createdBy: req.adminAddress
    });

    await election.save();

    // Log audit trail
    await AuditLog.create({
      action: 'ELECTION_CREATED',
      actor: req.adminAddress,
      data: { electionId: election._id, title },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      election
    });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create election'
    });
  }
};

// Get single election
const getElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id).populate('candidates');
    
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    res.json({
      success: true,
      election
    });
  } catch (error) {
    console.error('Error fetching election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch election'
    });
  }
};

// Update election
const updateElection = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const election = await Election.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Log audit trail
    await AuditLog.create({
      action: 'ELECTION_UPDATED',
      actor: req.adminAddress,
      data: { electionId: id, updates: updateData },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.json({
      success: true,
      message: 'Election updated successfully',
      election
    });
  } catch (error) {
    console.error('Error updating election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update election'
    });
  }
};

// Delete election
const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findByIdAndDelete(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Log audit trail
    await AuditLog.create({
      action: 'ELECTION_DELETED',
      actor: req.adminAddress,
      data: { electionId: id, title: election.title },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.json({
      success: true,
      message: 'Election deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete election'
    });
  }
};

// Start election
const startElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    if (election.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Election can only be started from draft status'
      });
    }

    // Update election status
    election.status = 'active';
    election.actualStartDate = new Date();
    await election.save();

    // Log audit trail
    await AuditLog.create({
      action: 'ELECTION_STARTED',
      actor: req.adminAddress,
      data: { electionId: id, title: election.title },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.json({
      success: true,
      message: 'Election started successfully',
      election
    });
  } catch (error) {
    console.error('Error starting election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start election'
    });
  }
};

// Stop election
const stopElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    if (election.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active elections can be stopped'
      });
    }

    // Update election status
    election.status = 'completed';
    election.actualEndDate = new Date();
    await election.save();

    // Log audit trail
    await AuditLog.create({
      action: 'ELECTION_STOPPED',
      actor: req.adminAddress,
      data: { electionId: id, title: election.title },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.json({
      success: true,
      message: 'Election stopped successfully',
      election
    });
  } catch (error) {
    console.error('Error stopping election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop election'
    });
  }
};

// Get all candidates
const getCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { party: { $regex: search, $options: 'i' } }
      ];
    }

    const candidates = await Candidate.find(query)
      .populate('electionId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Candidate.countDocuments(query);

    res.json({
      success: true,
      candidates,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates'
    });
  }
};

// Register new candidate
const registerCandidate = async (req, res) => {
  try {
    const {
      name,
      party,
      description,
      photo,
      electionId,
      walletAddress,
      email,
      phone
    } = req.body;

    const candidate = new Candidate({
      name,
      party,
      description,
      photo,
      electionId,
      walletAddress,
      email,
      phone,
      status: 'pending',
      registeredBy: req.adminAddress
    });

    await candidate.save();

    // Log audit trail
    await AuditLog.create({
      action: 'CANDIDATE_REGISTERED',
      actor: req.adminAddress,
      data: { candidateId: candidate._id, name, electionId },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.status(201).json({
      success: true,
      message: 'Candidate registered successfully',
      candidate
    });
  } catch (error) {
    console.error('Error registering candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register candidate'
    });
  }
};

// Get single candidate
const getCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findById(id).populate('electionId');
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      candidate
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate'
    });
  }
};

// Update candidate
const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Log audit trail
    await AuditLog.create({
      action: 'CANDIDATE_UPDATED',
      actor: req.adminAddress,
      data: { candidateId: id, updates: updateData },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.json({
      success: true,
      message: 'Candidate updated successfully',
      candidate
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update candidate'
    });
  }
};

// Delete candidate
const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByIdAndDelete(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Log audit trail
    await AuditLog.create({
      action: 'CANDIDATE_DELETED',
      actor: req.adminAddress,
      data: { candidateId: id, name: candidate.name },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete candidate'
    });
  }
};

// Approve candidate
const approveCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { status: 'active', approvedAt: new Date(), approvedBy: req.adminAddress },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Log audit trail
    await AuditLog.create({
      action: 'CANDIDATE_APPROVED',
      actor: req.adminAddress,
      data: { candidateId: id, name: candidate.name },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.json({
      success: true,
      message: 'Candidate approved successfully',
      candidate
    });
  } catch (error) {
    console.error('Error approving candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve candidate'
    });
  }
};

// Reject candidate
const rejectCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { 
        status: 'rejected', 
        rejectedAt: new Date(), 
        rejectedBy: req.adminAddress,
        rejectionReason: reason
      },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Log audit trail
    await AuditLog.create({
      action: 'CANDIDATE_REJECTED',
      actor: req.adminAddress,
      data: { candidateId: id, name: candidate.name, reason },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.json({
      success: true,
      message: 'Candidate rejected successfully',
      candidate
    });
  } catch (error) {
    console.error('Error rejecting candidate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject candidate'
    });
  }
};

// Get audit logs
const getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      action, 
      dateRange, 
      search 
    } = req.query;
    
    const query = {};
    
    if (action && action !== 'all') {
      query.action = action;
    }
    
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { actor: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (startDate) {
        query.timestamp = { $gte: Math.floor(startDate.getTime() / 1000) };
      }
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
};

// Export audit logs
const exportAuditLogs = async (req, res) => {
  try {
    const { action, dateRange, search } = req.body;
    
    const query = {};
    
    if (action && action !== 'all') {
      query.action = action;
    }
    
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { actor: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (startDate) {
        query.timestamp = { $gte: Math.floor(startDate.getTime() / 1000) };
      }
    }

    const logs = await AuditLog.find(query).sort({ timestamp: -1 });

    // Convert to CSV format
    const csvHeader = 'Action,Actor,Timestamp,Data\n';
    const csvData = logs.map(log => 
      `${log.action},${log.actor},${new Date(log.timestamp * 1000).toISOString()},${JSON.stringify(log.data)}`
    ).join('\n');
    
    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit logs'
    });
  }
};

// Get single audit log
const getAuditLog = async (req, res) => {
  try {
    const { actionHash } = req.params;
    const log = await AuditLog.findOne({ actionHash });
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      log
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log'
    });
  }
};

// Get admin settings
const getAdminSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      // Create default settings
      settings = new AdminSettings({
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
      });
      await settings.save();
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin settings'
    });
  }
};

// Update admin settings
const updateAdminSettings = async (req, res) => {
  try {
    const updateData = req.body;
    
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      settings = new AdminSettings(updateData);
    } else {
      Object.assign(settings, updateData);
    }
    
    await settings.save();

    // Log audit trail
    await AuditLog.create({
      action: 'SETTINGS_UPDATED',
      actor: req.adminAddress,
      data: { updates: updateData },
      timestamp: Math.floor(Date.now() / 1000)
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin settings'
    });
  }
};

module.exports = {
  checkAdminStatus,
  getAdminStats,
  getElections,
  createElection,
  getElection,
  updateElection,
  deleteElection,
  startElection,
  stopElection,
  getCandidates,
  registerCandidate,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  approveCandidate,
  rejectCandidate,
  getAuditLogs,
  exportAuditLogs,
  getAuditLog,
  getAdminSettings,
  updateAdminSettings
};

