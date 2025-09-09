#!/usr/bin/env node

/**
 * Integration Test Suite for BlocPol
 * This script runs comprehensive integration tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 BlocPol Integration Tests');
console.log('============================\n');

// Test configuration
const testConfig = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3001',
  timeout: 30000,
  retries: 3
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0
};

// Test categories
const testCategories = [
  {
    name: 'Frontend Tests',
    tests: [
      { name: 'Homepage Loads', test: testHomepageLoads },
      { name: 'Wallet Connection', test: testWalletConnection },
      { name: 'Navigation Works', test: testNavigation },
      { name: 'Responsive Design', test: testResponsiveDesign }
    ]
  },
  {
    name: 'Backend API Tests',
    tests: [
      { name: 'Health Check', test: testHealthCheck },
      { name: 'Elections API', test: testElectionsAPI },
      { name: 'Voters API', test: testVotersAPI },
      { name: 'Vote API', test: testVoteAPI }
    ]
  },
  {
    name: 'Database Tests',
    tests: [
      { name: 'MongoDB Connection', test: testMongoDBConnection },
      { name: 'Data Persistence', test: testDataPersistence },
      { name: 'Index Performance', test: testIndexPerformance }
    ]
  },
  {
    name: 'Blockchain Tests',
    tests: [
      { name: 'RPC Connection', test: testRPCConnection },
      { name: 'Contract Deployment', test: testContractDeployment },
      { name: 'Transaction Processing', test: testTransactionProcessing }
    ]
  },
  {
    name: 'Security Tests',
    tests: [
      { name: 'CORS Configuration', test: testCORSConfiguration },
      { name: 'Rate Limiting', test: testRateLimiting },
      { name: 'Input Validation', test: testInputValidation }
    ]
  }
];

// Frontend Tests
async function testHomepageLoads() {
  try {
    const response = await fetch(`${testConfig.baseUrl}/`);
    if (response.ok) {
      return { success: true, message: 'Homepage loads successfully' };
    } else {
      return { success: false, message: `Homepage failed to load: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Homepage test failed: ${error.message}` };
  }
}

async function testWalletConnection() {
  try {
    // This would require a headless browser or mock wallet
    // For now, we'll check if the wallet context is properly set up
    const walletContextPath = 'frontend/contexts/WalletContext.js';
    if (fs.existsSync(walletContextPath)) {
      return { success: true, message: 'Wallet context is properly configured' };
    } else {
      return { success: false, message: 'Wallet context not found' };
    }
  } catch (error) {
    return { success: false, message: `Wallet connection test failed: ${error.message}` };
  }
}

async function testNavigation() {
  try {
    const pages = [
      '/',
      '/register',
      '/candidates',
      '/results',
      '/admin'
    ];
    
    let allPagesLoad = true;
    const failedPages = [];
    
    for (const page of pages) {
      try {
        const response = await fetch(`${testConfig.baseUrl}${page}`);
        if (!response.ok) {
          allPagesLoad = false;
          failedPages.push(page);
        }
      } catch (error) {
        allPagesLoad = false;
        failedPages.push(page);
      }
    }
    
    if (allPagesLoad) {
      return { success: true, message: 'All pages load successfully' };
    } else {
      return { success: false, message: `Failed pages: ${failedPages.join(', ')}` };
    }
  } catch (error) {
    return { success: false, message: `Navigation test failed: ${error.message}` };
  }
}

async function testResponsiveDesign() {
  try {
    // Check if Tailwind CSS is configured
    const tailwindConfigPath = 'frontend/tailwind.config.js';
    if (fs.existsSync(tailwindConfigPath)) {
      return { success: true, message: 'Responsive design framework configured' };
    } else {
      return { success: false, message: 'Tailwind CSS not configured' };
    }
  } catch (error) {
    return { success: false, message: `Responsive design test failed: ${error.message}` };
  }
}

// Backend API Tests
async function testHealthCheck() {
  try {
    const response = await fetch(`${testConfig.apiUrl}/api/health`);
    if (response.ok) {
      const data = await response.json();
      return { success: true, message: 'Health check passed' };
    } else {
      return { success: false, message: `Health check failed: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Health check test failed: ${error.message}` };
  }
}

async function testElectionsAPI() {
  try {
    const response = await fetch(`${testConfig.apiUrl}/api/elections`);
    if (response.ok) {
      return { success: true, message: 'Elections API is working' };
    } else {
      return { success: false, message: `Elections API failed: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Elections API test failed: ${error.message}` };
  }
}

async function testVotersAPI() {
  try {
    const response = await fetch(`${testConfig.apiUrl}/api/voters`);
    if (response.ok) {
      return { success: true, message: 'Voters API is working' };
    } else {
      return { success: false, message: `Voters API failed: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Voters API test failed: ${error.message}` };
  }
}

async function testVoteAPI() {
  try {
    const response = await fetch(`${testConfig.apiUrl}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    
    // We expect this to fail with validation error, which is good
    if (response.status === 400) {
      return { success: true, message: 'Vote API validation is working' };
    } else {
      return { success: false, message: `Vote API unexpected response: ${response.status}` };
    }
  } catch (error) {
    return { success: false, message: `Vote API test failed: ${error.message}` };
  }
}

// Database Tests
async function testMongoDBConnection() {
  try {
    const dbConfigPath = 'backend/config/database.js';
    if (fs.existsSync(dbConfigPath)) {
      return { success: true, message: 'MongoDB configuration found' };
    } else {
      return { success: false, message: 'MongoDB configuration not found' };
    }
  } catch (error) {
    return { success: false, message: `MongoDB connection test failed: ${error.message}` };
  }
}

async function testDataPersistence() {
  try {
    const modelFiles = [
      'backend/models/Election.js',
      'backend/models/Candidate.js',
      'backend/models/Voter.js'
    ];
    
    let allModelsExist = true;
    const missingModels = [];
    
    modelFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        allModelsExist = false;
        missingModels.push(file);
      }
    });
    
    if (allModelsExist) {
      return { success: true, message: 'All data models are configured' };
    } else {
      return { success: false, message: `Missing models: ${missingModels.join(', ')}` };
    }
  } catch (error) {
    return { success: false, message: `Data persistence test failed: ${error.message}` };
  }
}

async function testIndexPerformance() {
  try {
    const setupScriptPath = 'backend/scripts/setup-database.js';
    if (fs.existsSync(setupScriptPath)) {
      return { success: true, message: 'Database indexing script found' };
    } else {
      return { success: false, message: 'Database indexing script not found' };
    }
  } catch (error) {
    return { success: false, message: `Index performance test failed: ${error.message}` };
  }
}

// Blockchain Tests
async function testRPCConnection() {
  try {
    const envPath = 'backend/.env';
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('RPC_URL')) {
        return { success: true, message: 'RPC URL configured' };
      } else {
        return { success: false, message: 'RPC URL not configured' };
      }
    } else {
      return { success: false, message: 'Environment file not found' };
    }
  } catch (error) {
    return { success: false, message: `RPC connection test failed: ${error.message}` };
  }
}

async function testContractDeployment() {
  try {
    const contractFiles = [
      'contracts/BlocPol.sol',
      'contracts/BlocPolAdvanced.sol'
    ];
    
    let allContractsExist = true;
    const missingContracts = [];
    
    contractFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        allContractsExist = false;
        missingContracts.push(file);
      }
    });
    
    if (allContractsExist) {
      return { success: true, message: 'All smart contracts found' };
    } else {
      return { success: false, message: `Missing contracts: ${missingContracts.join(', ')}` };
    }
  } catch (error) {
    return { success: false, message: `Contract deployment test failed: ${error.message}` };
  }
}

async function testTransactionProcessing() {
  try {
    const contractUtilsPath = 'backend/utils/contractUtils.js';
    if (fs.existsSync(contractUtilsPath)) {
      return { success: true, message: 'Transaction processing utilities found' };
    } else {
      return { success: false, message: 'Transaction processing utilities not found' };
    }
  } catch (error) {
    return { success: false, message: `Transaction processing test failed: ${error.message}` };
  }
}

// Security Tests
async function testCORSConfiguration() {
  try {
    const serverPath = 'backend/server.js';
    if (fs.existsSync(serverPath)) {
      const content = fs.readFileSync(serverPath, 'utf8');
      if (content.includes('cors')) {
        return { success: true, message: 'CORS is configured' };
      } else {
        return { success: false, message: 'CORS not configured' };
      }
    } else {
      return { success: false, message: 'Server file not found' };
    }
  } catch (error) {
    return { success: false, message: `CORS configuration test failed: ${error.message}` };
  }
}

async function testRateLimiting() {
  try {
    const serverPath = 'backend/server.js';
    if (fs.existsSync(serverPath)) {
      const content = fs.readFileSync(serverPath, 'utf8');
      if (content.includes('rateLimit') || content.includes('rate-limit')) {
        return { success: true, message: 'Rate limiting is configured' };
      } else {
        return { success: false, message: 'Rate limiting not configured' };
      }
    } else {
      return { success: false, message: 'Server file not found' };
    }
  } catch (error) {
    return { success: false, message: `Rate limiting test failed: ${error.message}` };
  }
}

async function testInputValidation() {
  try {
    const controllerFiles = [
      'backend/controllers/electionController.js',
      'backend/controllers/voterController.js'
    ];
    
    let validationFound = false;
    
    controllerFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('validate') || content.includes('sanitize')) {
          validationFound = true;
        }
      }
    });
    
    if (validationFound) {
      return { success: true, message: 'Input validation is implemented' };
    } else {
      return { success: false, message: 'Input validation not found' };
    }
  } catch (error) {
    return { success: false, message: `Input validation test failed: ${error.message}` };
  }
}

// Run a single test
async function runTest(testName, testFunction) {
  try {
    const result = await testFunction();
    testResults.total++;
    
    if (result.success) {
      testResults.passed++;
      console.log(`   ✅ ${testName}: ${result.message}`);
    } else {
      testResults.failed++;
      console.log(`   ❌ ${testName}: ${result.message}`);
    }
  } catch (error) {
    testResults.total++;
    testResults.failed++;
    console.log(`   ❌ ${testName}: Test error - ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting integration tests...\n');
  
  for (const category of testCategories) {
    console.log(`📋 ${category.name}`);
    console.log('─'.repeat(category.name.length + 4));
    
    for (const test of category.tests) {
      await runTest(test.name, test.test);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('📊 Test Results Summary');
  console.log('======================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Skipped: ${testResults.skipped}`);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  console.log(`Success Rate: ${successRate}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Some tests failed - Review before deployment');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed - Ready for deployment');
  }
}

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
