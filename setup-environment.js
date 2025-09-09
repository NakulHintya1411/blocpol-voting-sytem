#!/usr/bin/env node

/**
 * Environment Setup Script for BlocPol
 * This script helps set up the complete environment for development and production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 BlocPol Environment Setup');
console.log('============================\n');

// Check if Node.js version is compatible
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.error('❌ Node.js version 18 or higher is required');
    console.error(`   Current version: ${nodeVersion}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version: ${nodeVersion}`);
}

// Create environment files
function createEnvFiles() {
  console.log('\n📝 Creating environment files...');
  
  // Backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  if (!fs.existsSync(backendEnvPath)) {
    const backendEnvContent = `# BlocPol Backend Environment Configuration
# Copy from env.example and update with your values

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blocpol
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Blockchain Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=
PRIVATE_KEY=your_private_key_here

# Admin Configuration
ADMIN_ADDRESSES=0x1234567890123456789012345678901234567890

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
`;
    
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('✅ Created backend/.env');
  } else {
    console.log('✅ backend/.env already exists');
  }
  
  // Frontend .env.local
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
  if (!fs.existsSync(frontendEnvPath)) {
    const frontendEnvContent = `# BlocPol Frontend Environment Configuration
# Copy from env.local.example and update with your values

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Blockchain Configuration
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAIN_NAME=Sepolia Testnet
NEXT_PUBLIC_BLOCK_EXPLORER=https://sepolia.etherscan.io

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_CONTRACT_ABI_PATH=/abi/BlocPol.json

# App Configuration
NEXT_PUBLIC_APP_NAME=BlocPol
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Blockchain-based Voting System

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
`;
    
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Created frontend/.env.local');
  } else {
    console.log('✅ frontend/.env.local already exists');
  }
}

// Install dependencies
function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  try {
    // Root dependencies
    console.log('   Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    
    // Backend dependencies
    console.log('   Installing backend dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'backend') });
    
    // Frontend dependencies
    console.log('   Installing frontend dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'frontend') });
    
    console.log('✅ All dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Create necessary directories
function createDirectories() {
  console.log('\n📁 Creating necessary directories...');
  
  const directories = [
    'backend/logs',
    'backend/uploads',
    'backend/temp',
    'frontend/public/images',
    'frontend/public/icons',
    'cache',
    'logs'
  ];
  
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`   ✅ Created ${dir}`);
    } else {
      console.log(`   ✅ ${dir} already exists`);
    }
  });
}

// Create package.json scripts
function createScripts() {
  console.log('\n📜 Setting up package.json scripts...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'setup': 'node setup-environment.js',
    'dev': 'concurrently "npm run dev:backend" "npm run dev:frontend"',
    'dev:backend': 'cd backend && npm run dev',
    'dev:frontend': 'cd frontend && npm run dev',
    'build': 'npm run build:backend && npm run build:frontend',
    'build:backend': 'cd backend && npm run build',
    'build:frontend': 'cd frontend && npm run build',
    'start': 'concurrently "npm run start:backend" "npm run start:frontend"',
    'start:backend': 'cd backend && npm start',
    'start:frontend': 'cd frontend && npm start',
    'test': 'npm run test:backend && npm run test:frontend',
    'test:backend': 'cd backend && npm test',
    'test:frontend': 'cd frontend && npm test',
    'setup:db': 'cd backend && node scripts/setup-database.js',
    'setup:redis': 'cd backend && node scripts/setup-redis.js',
    'deploy:vercel': 'cd frontend && vercel --prod',
    'deploy:backend': 'cd backend && vercel --prod'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json scripts updated');
}

// Main setup function
async function main() {
  try {
    checkNodeVersion();
    createEnvFiles();
    createDirectories();
    installDependencies();
    createScripts();
    
    console.log('\n🎉 Environment setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update the environment files with your actual values');
    console.log('   2. Set up MongoDB Atlas and update MONGODB_URI');
    console.log('   3. Set up Redis and update REDIS_URL');
    console.log('   4. Deploy smart contracts and update contract addresses');
    console.log('   5. Run: npm run setup:db');
    console.log('   6. Run: npm run setup:redis');
    console.log('   7. Run: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  main();
}

module.exports = { main };
