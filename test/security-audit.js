#!/usr/bin/env node

/**
 * Security Audit Script for BlocPol
 * This script performs comprehensive security checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 BlocPol Security Audit');
console.log('========================\n');

// Security checks
const securityChecks = [
  {
    name: 'Environment Variables Security',
    check: checkEnvironmentSecurity,
    critical: true
  },
  {
    name: 'Dependency Vulnerabilities',
    check: checkDependencyVulnerabilities,
    critical: true
  },
  {
    name: 'Code Security Patterns',
    check: checkCodeSecurity,
    critical: true
  },
  {
    name: 'Smart Contract Security',
    check: checkSmartContractSecurity,
    critical: true
  },
  {
    name: 'API Security',
    check: checkAPISecurity,
    critical: true
  },
  {
    name: 'Database Security',
    check: checkDatabaseSecurity,
    critical: true
  },
  {
    name: 'Frontend Security',
    check: checkFrontendSecurity,
    critical: false
  },
  {
    name: 'Configuration Security',
    check: checkConfigurationSecurity,
    critical: false
  }
];

// Check environment variables security
function checkEnvironmentSecurity() {
  console.log('   Checking environment variables...');
  
  const issues = [];
  
  // Check for hardcoded secrets
  const envFiles = [
    'backend/.env',
    'frontend/.env.local',
    'env.example',
    'env.local.example'
  ];
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for hardcoded secrets
      if (content.includes('your_') || content.includes('YOUR_')) {
        issues.push(`⚠️  ${file} contains placeholder values`);
      }
      
      // Check for weak secrets
      if (content.includes('password123') || content.includes('secret123')) {
        issues.push(`❌ ${file} contains weak default passwords`);
      }
    }
  });
  
  return issues;
}

// Check dependency vulnerabilities
function checkDependencyVulnerabilities() {
  console.log('   Checking dependency vulnerabilities...');
  
  const issues = [];
  
  try {
    // Check backend dependencies
    const backendAudit = execSync('cd backend && npm audit --json', { encoding: 'utf8' });
    const backendAuditData = JSON.parse(backendAudit);
    
    if (backendAuditData.vulnerabilities) {
      const criticalVulns = Object.values(backendAuditData.vulnerabilities)
        .filter(vuln => vuln.severity === 'critical' || vuln.severity === 'high');
      
      if (criticalVulns.length > 0) {
        issues.push(`❌ Backend has ${criticalVulns.length} critical/high vulnerabilities`);
      }
    }
  } catch (error) {
    issues.push('⚠️  Could not audit backend dependencies');
  }
  
  try {
    // Check frontend dependencies
    const frontendAudit = execSync('cd frontend && npm audit --json', { encoding: 'utf8' });
    const frontendAuditData = JSON.parse(frontendAudit);
    
    if (frontendAuditData.vulnerabilities) {
      const criticalVulns = Object.values(frontendAuditData.vulnerabilities)
        .filter(vuln => vuln.severity === 'critical' || vuln.severity === 'high');
      
      if (criticalVulns.length > 0) {
        issues.push(`❌ Frontend has ${criticalVulns.length} critical/high vulnerabilities`);
      }
    }
  } catch (error) {
    issues.push('⚠️  Could not audit frontend dependencies');
  }
  
  return issues;
}

// Check code security patterns
function checkCodeSecurity() {
  console.log('   Checking code security patterns...');
  
  const issues = [];
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /SELECT.*\+.*req\./gi,
    /INSERT.*\+.*req\./gi,
    /UPDATE.*\+.*req\./gi,
    /DELETE.*\+.*req\./gi
  ];
  
  // Check for XSS patterns
  const xssPatterns = [
    /innerHTML.*req\./gi,
    /document\.write.*req\./gi,
    /eval\(.*req\./gi
  ];
  
  // Check for hardcoded secrets
  const secretPatterns = [
    /password.*=.*['"][^'"]{8,}['"]/gi,
    /secret.*=.*['"][^'"]{8,}['"]/gi,
    /key.*=.*['"][^'"]{8,}['"]/gi
  ];
  
  // Scan backend files
  const backendFiles = getFilesRecursively('backend', ['.js']);
  backendFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    sqlPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push(`❌ Potential SQL injection in ${file}`);
      }
    });
    
    secretPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push(`❌ Potential hardcoded secret in ${file}`);
      }
    });
  });
  
  // Scan frontend files
  const frontendFiles = getFilesRecursively('frontend', ['.js', '.jsx', '.ts', '.tsx']);
  frontendFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    xssPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push(`❌ Potential XSS vulnerability in ${file}`);
      }
    });
  });
  
  return issues;
}

// Check smart contract security
function checkSmartContractSecurity() {
  console.log('   Checking smart contract security...');
  
  const issues = [];
  
  // Check for common vulnerabilities
  const contractFiles = getFilesRecursively('contracts', ['.sol']);
  
  contractFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for reentrancy vulnerabilities
    if (content.includes('call(') && !content.includes('ReentrancyGuard')) {
      issues.push(`⚠️  Potential reentrancy vulnerability in ${file}`);
    }
    
    // Check for integer overflow
    if (content.includes('+') || content.includes('-') || content.includes('*')) {
      if (!content.includes('SafeMath') && !content.includes('unchecked')) {
        issues.push(`⚠️  Potential integer overflow in ${file}`);
      }
    }
    
    // Check for access control
    if (content.includes('function') && !content.includes('onlyOwner') && !content.includes('modifier')) {
      issues.push(`⚠️  Missing access control in ${file}`);
    }
  });
  
  return issues;
}

// Check API security
function checkAPISecurity() {
  console.log('   Checking API security...');
  
  const issues = [];
  
  // Check for CORS configuration
  const serverFile = 'backend/server.js';
  if (fs.existsSync(serverFile)) {
    const content = fs.readFileSync(serverFile, 'utf8');
    
    if (content.includes('cors') && content.includes('origin: "*"')) {
      issues.push('⚠️  CORS is set to allow all origins');
    }
    
    // Check for rate limiting
    if (!content.includes('rateLimit') && !content.includes('rate-limit')) {
      issues.push('❌ No rate limiting implemented');
    }
  }
  
  // Check for input validation
  const controllerFiles = getFilesRecursively('backend/controllers', ['.js']);
  controllerFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('req.body') && !content.includes('validate') && !content.includes('sanitize')) {
      issues.push(`⚠️  Missing input validation in ${file}`);
    }
  });
  
  return issues;
}

// Check database security
function checkDatabaseSecurity() {
  console.log('   Checking database security...');
  
  const issues = [];
  
  // Check for MongoDB injection
  const modelFiles = getFilesRecursively('backend/models', ['.js']);
  modelFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('$where') || content.includes('$regex')) {
      issues.push(`⚠️  Potential NoSQL injection in ${file}`);
    }
  });
  
  // Check for connection security
  const dbConfig = fs.readFileSync('backend/config/database.js', 'utf8');
  if (!dbConfig.includes('useNewUrlParser') || !dbConfig.includes('useUnifiedTopology')) {
    issues.push('⚠️  MongoDB connection not using secure options');
  }
  
  return issues;
}

// Check frontend security
function checkFrontendSecurity() {
  console.log('   Checking frontend security...');
  
  const issues = [];
  
  // Check for CSP headers
  const nextConfig = fs.readFileSync('frontend/next.config.js', 'utf8');
  if (!nextConfig.includes('Content-Security-Policy')) {
    issues.push('⚠️  No Content Security Policy configured');
  }
  
  // Check for XSS protection
  const appFile = fs.readFileSync('frontend/pages/_app.js', 'utf8');
  if (!appFile.includes('dangerouslySetInnerHTML')) {
    issues.push('✅ No dangerous HTML rendering found');
  }
  
  return issues;
}

// Check configuration security
function checkConfigurationSecurity() {
  console.log('   Checking configuration security...');
  
  const issues = [];
  
  // Check for debug mode in production
  const envFiles = ['backend/.env', 'frontend/.env.local'];
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('NODE_ENV=development') && file.includes('production')) {
        issues.push(`❌ Development mode in production config: ${file}`);
      }
    }
  });
  
  return issues;
}

// Helper function to get files recursively
function getFilesRecursively(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      // Skip node_modules and other build directories
      if (item === 'node_modules' || item === '.next' || item === 'dist' || item === 'build') {
        return;
      }
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  if (fs.existsSync(dir)) {
    traverse(dir);
  }
  
  return files;
}

// Run security audit
async function runSecurityAudit() {
  console.log('Starting security audit...\n');
  
  let totalIssues = 0;
  let criticalIssues = 0;
  
  for (const check of securityChecks) {
    console.log(`🔍 ${check.name}`);
    
    try {
      const issues = await check.check();
      
      if (issues.length === 0) {
        console.log('   ✅ No issues found\n');
      } else {
        issues.forEach(issue => {
          console.log(`   ${issue}`);
          totalIssues++;
          
          if (check.critical) {
            criticalIssues++;
          }
        });
        console.log('');
      }
    } catch (error) {
      console.log(`   ❌ Error running check: ${error.message}\n`);
    }
  }
  
  // Summary
  console.log('📊 Security Audit Summary');
  console.log('========================');
  console.log(`Total Issues: ${totalIssues}`);
  console.log(`Critical Issues: ${criticalIssues}`);
  
  if (criticalIssues > 0) {
    console.log('\n❌ CRITICAL ISSUES FOUND - DEPLOYMENT NOT RECOMMENDED');
    process.exit(1);
  } else if (totalIssues > 0) {
    console.log('\n⚠️  Issues found - Review before deployment');
  } else {
    console.log('\n✅ Security audit passed - Ready for deployment');
  }
}

// Run the audit
if (require.main === module) {
  runSecurityAudit();
}

module.exports = { runSecurityAudit };
