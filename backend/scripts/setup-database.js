#!/usr/bin/env node

/**
 * Database Setup Script for BlocPol
 * This script sets up the MongoDB database with initial collections and indexes
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Voter = require('../models/Voter');
const AdminSettings = require('../models/AdminSettings');
const AuditLog = require('../models/AuditLog');

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Create indexes for better performance
    console.log('📊 Creating database indexes...');
    
    // Election indexes
    await Election.collection.createIndex({ contractAddress: 1 }, { unique: true });
    await Election.collection.createIndex({ status: 1 });
    await Election.collection.createIndex({ startDate: 1, endDate: 1 });
    
    // Candidate indexes
    await Candidate.collection.createIndex({ electionId: 1 });
    await Candidate.collection.createIndex({ walletAddress: 1 });
    
    // Voter indexes
    await Voter.collection.createIndex({ walletAddress: 1 }, { unique: true });
    await Voter.collection.createIndex({ electionId: 1 });
    await Voter.collection.createIndex({ isVerified: 1 });
    
    // AuditLog indexes
    await AuditLog.collection.createIndex({ timestamp: 1 });
    await AuditLog.collection.createIndex({ action: 1 });
    await AuditLog.collection.createIndex({ userAddress: 1 });
    
    console.log('✅ Database indexes created successfully');
    
    // Create default admin settings if they don't exist
    console.log('⚙️ Setting up default admin settings...');
    
    const existingSettings = await AdminSettings.findOne();
    if (!existingSettings) {
      const defaultSettings = new AdminSettings({
        maxElections: 10,
        maxCandidatesPerElection: 50,
        maxVotersPerElection: 10000,
        votingDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        registrationDeadline: 60 * 60 * 1000, // 1 hour before election starts
        requireVerification: true,
        allowAnonymousVoting: false,
        enableAuditLogging: true,
        maxAuditLogRetention: 365, // days
        blockchainNetwork: 'sepolia',
        gasPriceMultiplier: 1.2,
        maxGasPrice: 100, // gwei
        minGasPrice: 1, // gwei
        contractVersion: '1.0.0',
        lastUpdated: new Date(),
        updatedBy: 'system'
      });
      
      await defaultSettings.save();
      console.log('✅ Default admin settings created');
    } else {
      console.log('✅ Admin settings already exist');
    }
    
    // Create initial audit log entry
    console.log('📝 Creating initial audit log...');
    
    const initialAuditLog = new AuditLog({
      action: 'DATABASE_SETUP',
      description: 'Database setup completed successfully',
      userAddress: 'system',
      timestamp: new Date(),
      metadata: {
        version: '1.0.0',
        indexesCreated: true,
        defaultSettingsCreated: !existingSettings
      }
    });
    
    await initialAuditLog.save();
    console.log('✅ Initial audit log created');
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
