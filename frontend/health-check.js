// Health check script for the frontend
// This script checks if all required services are running

const axios = require('axios');

const HEALTH_CHECK_CONFIG = {
  frontend: {
    url: 'http://localhost:3000',
    timeout: 5000,
    expectedStatus: 200
  },
  backend: {
    url: 'http://localhost:3001/api/health',
    timeout: 5000,
    expectedStatus: 200
  }
};

async function checkService(serviceName, config) {
  try {
    console.log(`Checking ${serviceName}...`);
    
    const response = await axios.get(config.url, {
      timeout: config.timeout,
      validateStatus: (status) => status < 500
    });
    
    if (response.status === config.expectedStatus) {
      console.log(`✅ ${serviceName} is healthy`);
      return true;
    } else {
      console.log(`❌ ${serviceName} returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${serviceName} is not responding: ${error.message}`);
    return false;
  }
}

async function runHealthCheck() {
  console.log('Starting health check...\n');
  
  const results = await Promise.allSettled([
    checkService('Frontend', HEALTH_CHECK_CONFIG.frontend),
    checkService('Backend', HEALTH_CHECK_CONFIG.backend)
  ]);
  
  const allHealthy = results.every(result => 
    result.status === 'fulfilled' && result.value === true
  );
  
  console.log('\n' + '='.repeat(50));
  
  if (allHealthy) {
    console.log('🎉 All services are healthy!');
    process.exit(0);
  } else {
    console.log('⚠️  Some services are not healthy');
    process.exit(1);
  }
}

// Run health check if this file is executed directly
if (require.main === module) {
  runHealthCheck();
}

module.exports = { runHealthCheck, checkService };
