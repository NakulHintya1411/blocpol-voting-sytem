const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voterController');
const rateLimit = require('express-rate-limit');

// Rate limiting for voter routes
const voterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

router.use(voterLimiter);

// Voter registration
router.post('/register', voterController.registerVoter);

// Get voter status
router.get('/status/:walletAddress', voterController.getVoterStatus);

// Cast vote
router.post('/vote', voterController.castVote);

// Verify vote
router.get('/verify/:transactionHash', voterController.verifyVote);

module.exports = router;

