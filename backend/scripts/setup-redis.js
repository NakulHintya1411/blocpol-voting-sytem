#!/usr/bin/env node

/**
 * Redis Setup Script for BlocPol
 * This script sets up Redis with initial configuration and cache policies
 */

const redis = require('redis');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupRedis() {
  let client;
  
  try {
    console.log('🔗 Connecting to Redis...');
    
    // Create Redis client
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    await client.connect();
    console.log('✅ Connected to Redis successfully');
    
    // Test Redis connection
    await client.ping();
    console.log('✅ Redis ping successful');
    
    // Set up cache policies and configurations
    console.log('⚙️ Setting up Redis cache policies...');
    
    // Set default cache TTL values
    const cacheConfig = {
      'election:ttl': '3600', // 1 hour
      'candidate:ttl': '1800', // 30 minutes
      'voter:ttl': '1800', // 30 minutes
      'results:ttl': '300', // 5 minutes
      'audit:ttl': '86400', // 24 hours
      'admin:ttl': '1800', // 30 minutes
      'session:ttl': '7200', // 2 hours
      'rate_limit:ttl': '60', // 1 minute
    };
    
    for (const [key, value] of Object.entries(cacheConfig)) {
      await client.set(`config:${key}`, value);
    }
    
    console.log('✅ Cache policies configured');
    
    // Set up rate limiting buckets
    console.log('🚦 Setting up rate limiting...');
    
    const rateLimits = {
      'api:general': '100:60', // 100 requests per minute
      'api:vote': '10:60', // 10 votes per minute
      'api:register': '5:60', // 5 registrations per minute
      'api:admin': '200:60', // 200 admin requests per minute
    };
    
    for (const [key, value] of Object.entries(rateLimits)) {
      await client.set(`rate_limit:${key}`, value);
    }
    
    console.log('✅ Rate limiting configured');
    
    // Set up session management
    console.log('🔐 Setting up session management...');
    
    await client.set('config:session:cleanup_interval', '3600'); // 1 hour
    await client.set('config:session:max_age', '7200'); // 2 hours
    await client.set('config:session:secure', process.env.NODE_ENV === 'production' ? 'true' : 'false');
    
    console.log('✅ Session management configured');
    
    // Set up monitoring and health check
    console.log('📊 Setting up monitoring...');
    
    await client.set('monitor:last_setup', new Date().toISOString());
    await client.set('monitor:setup_version', '1.0.0');
    await client.set('monitor:health_check', 'ok');
    
    console.log('✅ Monitoring configured');
    
    // Create initial cache entries for common data
    console.log('💾 Creating initial cache entries...');
    
    const initialData = {
      'cache:system:status': JSON.stringify({
        status: 'active',
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
      }),
      'cache:system:config': JSON.stringify({
        maxElections: 10,
        maxCandidates: 50,
        maxVoters: 10000,
        votingDuration: 86400
      })
    };
    
    for (const [key, value] of Object.entries(initialData)) {
      await client.set(key, value);
    }
    
    console.log('✅ Initial cache entries created');
    
    console.log('🎉 Redis setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Redis setup failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.disconnect();
      console.log('🔌 Disconnected from Redis');
    }
  }
}

// Run the setup
if (require.main === module) {
  setupRedis();
}

module.exports = setupRedis;
