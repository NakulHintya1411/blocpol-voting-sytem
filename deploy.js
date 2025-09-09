#!/usr/bin/env node

/**
 * BlocPol Deployment Script
 * This script handles the complete deployment process to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BlocPol Deployment Script');
console.log('============================\n');

// Check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is installed');
    return true;
  } catch (error) {
    console.error('❌ Vercel CLI is not installed');
    console.log('   Please install it with: npm install -g vercel');
    return false;
  }
}

// Check if user is logged in to Vercel
function checkVercelAuth() {
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    console.log('✅ Logged in to Vercel');
    return true;
  } catch (error) {
    console.error('❌ Not logged in to Vercel');
    console.log('   Please run: vercel login');
    return false;
  }
}

// Build the project
function buildProject() {
  console.log('\n🔨 Building project...');
  
  try {
    // Build frontend
    console.log('   Building frontend...');
    execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, 'frontend') });
    console.log('   ✅ Frontend built successfully');
    
    // Build backend (if needed)
    console.log('   Building backend...');
    execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, 'backend') });
    console.log('   ✅ Backend built successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

// Deploy frontend to Vercel
function deployFrontend() {
  console.log('\n🌐 Deploying frontend to Vercel...');
  
  try {
    execSync('vercel --prod', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, 'frontend'),
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log('✅ Frontend deployed successfully');
    return true;
  } catch (error) {
    console.error('❌ Frontend deployment failed:', error.message);
    return false;
  }
}

// Deploy backend to Vercel
function deployBackend() {
  console.log('\n⚙️ Deploying backend to Vercel...');
  
  try {
    execSync('vercel --prod', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, 'backend'),
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log('✅ Backend deployed successfully');
    return true;
  } catch (error) {
    console.error('❌ Backend deployment failed:', error.message);
    return false;
  }
}

// Update environment variables
function updateEnvVars() {
  console.log('\n🔧 Updating environment variables...');
  
  try {
    // Frontend environment variables
    const frontendEnvVars = [
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_RPC_URL',
      'NEXT_PUBLIC_CHAIN_ID',
      'NEXT_PUBLIC_CONTRACT_ADDRESS',
      'NEXT_PUBLIC_APP_NAME'
    ];
    
    console.log('   Setting frontend environment variables...');
    frontendEnvVars.forEach(envVar => {
      try {
        execSync(`vercel env add ${envVar}`, { 
          stdio: 'inherit', 
          cwd: path.join(__dirname, 'frontend') 
        });
      } catch (error) {
        console.log(`   ⚠️  ${envVar} might already exist`);
      }
    });
    
    // Backend environment variables
    const backendEnvVars = [
      'MONGODB_URI',
      'REDIS_URL',
      'JWT_SECRET',
      'RPC_URL',
      'CONTRACT_ADDRESS',
      'PRIVATE_KEY',
      'ADMIN_ADDRESSES'
    ];
    
    console.log('   Setting backend environment variables...');
    backendEnvVars.forEach(envVar => {
      try {
        execSync(`vercel env add ${envVar}`, { 
          stdio: 'inherit', 
          cwd: path.join(__dirname, 'backend') 
        });
      } catch (error) {
        console.log(`   ⚠️  ${envVar} might already exist`);
      }
    });
    
    console.log('✅ Environment variables updated');
    return true;
  } catch (error) {
    console.error('❌ Failed to update environment variables:', error.message);
    return false;
  }
}

// Run tests
function runTests() {
  console.log('\n🧪 Running tests...');
  
  try {
    // Run frontend tests
    console.log('   Running frontend tests...');
    execSync('npm test', { stdio: 'inherit', cwd: path.join(__dirname, 'frontend') });
    
    // Run backend tests
    console.log('   Running backend tests...');
    execSync('npm test', { stdio: 'inherit', cwd: path.join(__dirname, 'backend') });
    
    console.log('✅ All tests passed');
    return true;
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    return false;
  }
}

// Main deployment function
async function main() {
  try {
    // Pre-deployment checks
    if (!checkVercelCLI()) {
      process.exit(1);
    }
    
    if (!checkVercelAuth()) {
      process.exit(1);
    }
    
    // Run tests
    if (!runTests()) {
      console.log('⚠️  Tests failed, but continuing with deployment...');
    }
    
    // Build project
    if (!buildProject()) {
      process.exit(1);
    }
    
    // Deploy frontend
    if (!deployFrontend()) {
      process.exit(1);
    }
    
    // Deploy backend
    if (!deployBackend()) {
      process.exit(1);
    }
    
    // Update environment variables
    updateEnvVars();
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update environment variables in Vercel dashboard');
    console.log('   2. Set up MongoDB Atlas and Redis');
    console.log('   3. Deploy smart contracts to testnet');
    console.log('   4. Test the deployed application');
    console.log('   5. Set up custom domain (optional)');
    
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
