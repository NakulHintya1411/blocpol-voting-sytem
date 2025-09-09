const { ethers } = require('ethers');

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin authentication required.'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify the token (in a real implementation, this would be a JWT or similar)
    // For now, we'll check if the token is a valid wallet address and if it's in admin list
    const adminAddresses = process.env.ADMIN_ADDRESSES?.split(',') || [];
    
    if (!adminAddresses.includes(token.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Verify the address is a valid Ethereum address
    if (!ethers.utils.isAddress(token)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format.'
      });
    }

    // Add admin address to request object
    req.adminAddress = token.toLowerCase();
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Optional: Signature verification middleware for enhanced security
const verifySignature = async (req, res, next) => {
  try {
    const { signature, message, walletAddress } = req.body;
    
    if (!signature || !message || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Signature, message, and wallet address are required'
      });
    }

    // Verify the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Check if the address is admin
    const adminAddresses = process.env.ADMIN_ADDRESSES?.split(',') || [];
    
    if (!adminAddresses.includes(walletAddress.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.adminAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Signature verification failed'
    });
  }
};

// Rate limiting for admin actions
const adminRateLimit = (windowMs = 15 * 60 * 1000, max = 50) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.adminAddress || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [k, v] of requests.entries()) {
      if (v.timestamp < windowStart) {
        requests.delete(k);
      }
    }
    
    const userRequests = requests.get(key) || { count: 0, timestamp: now };
    
    if (userRequests.timestamp < windowStart) {
      userRequests.count = 1;
      userRequests.timestamp = now;
    } else {
      userRequests.count++;
    }
    
    requests.set(key, userRequests);
    
    if (userRequests.count > max) {
      return res.status(429).json({
        success: false,
        message: 'Too many admin requests. Please try again later.'
      });
    }
    
    next();
  };
};

module.exports = {
  adminAuth,
  verifySignature,
  adminRateLimit
};

