const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/adminAuth');
const rateLimit = require('express-rate-limit');

// Rate limiting for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many admin requests from this IP, please try again later.'
});

// Apply rate limiting to all admin routes
router.use(adminLimiter);

// Admin authentication middleware
router.use(adminAuth);

// Admin status check
router.get('/status/:walletAddress', adminController.checkAdminStatus);

// Dashboard statistics
router.get('/stats', adminController.getAdminStats);

// Elections management
router.get('/elections', adminController.getElections);
router.post('/elections', adminController.createElection);
router.get('/elections/:id', adminController.getElection);
router.put('/elections/:id', adminController.updateElection);
router.delete('/elections/:id', adminController.deleteElection);
router.post('/elections/:id/start', adminController.startElection);
router.post('/elections/:id/stop', adminController.stopElection);

// Candidates management
router.get('/candidates', adminController.getCandidates);
router.post('/candidates', adminController.registerCandidate);
router.get('/candidates/:id', adminController.getCandidate);
router.put('/candidates/:id', adminController.updateCandidate);
router.delete('/candidates/:id', adminController.deleteCandidate);
router.post('/candidates/:id/approve', adminController.approveCandidate);
router.post('/candidates/:id/reject', adminController.rejectCandidate);

// Audit trail
router.get('/audit', adminController.getAuditLogs);
router.post('/audit/export', adminController.exportAuditLogs);
router.get('/audit/:actionHash', adminController.getAuditLog);

// Settings
router.get('/settings', adminController.getAdminSettings);
router.put('/settings', adminController.updateAdminSettings);

module.exports = router;
