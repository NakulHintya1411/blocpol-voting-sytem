#!/usr/bin/env node

/**
 * Quick Deployment Script for BlocPol
 * This script helps you deploy to Vercel quickly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BlocPol Quick Deploy');
console.log('======================\n');

// Check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ Vercel CLI not found');
    console.log('   Installing Vercel CLI...');
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI installed successfully');
      return true;
    } catch (installError) {
      console.log('❌ Failed to install Vercel CLI');
      console.log('   Please install manually: npm install -g vercel');
      return false;
    }
  }
}

// Check if user is logged in
function checkVercelAuth() {
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    console.log('✅ Logged in to Vercel');
    return true;
  } catch (error) {
    console.log('❌ Not logged in to Vercel');
    console.log('   Please run: vercel login');
    return false;
  }
}

// Deploy frontend
function deployFrontend() {
  console.log('\n🌐 Deploying frontend...');
  
  try {
    process.chdir('frontend');
    execSync('vercel --prod --yes', { stdio: 'inherit' });
    console.log('✅ Frontend deployed successfully');
    return true;
  } catch (error) {
    console.log('❌ Frontend deployment failed');
    console.log('   Error:', error.message);
    return false;
  } finally {
    process.chdir('..');
  }
}

// Deploy backend
function deployBackend() {
  console.log('\n⚙️ Deploying backend...');
  
  try {
    process.chdir('backend');
    execSync('vercel --prod --yes', { stdio: 'inherit' });
    console.log('✅ Backend deployed successfully');
    return true;
  } catch (error) {
    console.log('❌ Backend deployment failed');
    console.log('   Error:', error.message);
    return false;
  } finally {
    process.chdir('..');
  }
}

// Create environment setup reminder
function createEnvReminder() {
  console.log('\n📝 Creating environment setup reminder...');
  
  const reminder = `
# Environment Variables Setup Reminder

## Frontend Environment Variables (in Vercel Dashboard)
- NEXT_PUBLIC_API_URL = https://your-backend.vercel.app
- NEXT_PUBLIC_RPC_URL = https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- NEXT_PUBLIC_CHAIN_ID = 11155111
- NEXT_PUBLIC_CHAIN_NAME = Sepolia Testnet
- NEXT_PUBLIC_BLOCK_EXPLORER = https://sepolia.etherscan.io
- NEXT_PUBLIC_CONTRACT_ADDRESS = (leave empty for now)
- NEXT_PUBLIC_APP_NAME = BlocPol

## Backend Environment Variables (in Vercel Dashboard)
- MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/blocpol?retryWrites=true&w=majority
- REDIS_URL = redis://localhost:6379
- PORT = 3001
- NODE_ENV = production
- FRONTEND_URL = https://your-frontend.vercel.app
- RPC_URL = https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- CONTRACT_ADDRESS = (leave empty for now)
- PRIVATE_KEY = your_private_key_here
- ADMIN_ADDRESSES = 0x1234567890123456789012345678901234567890
- JWT_SECRET = your_super_secret_jwt_key_here_make_it_long_and_random
- ENCRYPTION_KEY = your_encryption_key_here_32_characters_long

## Next Steps:
1. Set up MongoDB Atlas account
2. Get Infura/Alchemy RPC URL
3. Update environment variables in Vercel dashboard
4. Test your deployment
5. Deploy smart contracts later
`;

  fs.writeFileSync('ENVIRONMENT_SETUP_REMINDER.md', reminder);
  console.log('✅ Environment setup reminder created');
}

// Main deployment function
async function main() {
  try {
    console.log('Starting quick deployment...\n');
    
    // Check prerequisites
    if (!checkVercelCLI()) {
      console.log('\n❌ Cannot proceed without Vercel CLI');
      process.exit(1);
    }
    
    if (!checkVercelAuth()) {
      console.log('\n❌ Please login to Vercel first: vercel login');
      process.exit(1);
    }
    
    // Deploy frontend
    if (!deployFrontend()) {
      console.log('\n❌ Frontend deployment failed');
      process.exit(1);
    }
    
    // Deploy backend
    if (!deployBackend()) {
      console.log('\n❌ Backend deployment failed');
      process.exit(1);
    }
    
    // Create reminder
    createEnvReminder();
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Check ENVIRONMENT_SETUP_REMINDER.md');
    console.log('   2. Set up MongoDB Atlas');
    console.log('   3. Get Infura/Alchemy RPC URL');
    console.log('   4. Update environment variables in Vercel dashboard');
    console.log('   5. Test your deployment');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  main();
}

module.exports = { main };
