const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const rateLimit = require('express-rate-limit');

// Rate limiting for election routes
const electionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

router.use(electionLimiter);

// Get candidates
router.get('/candidates', electionController.getCandidates);

// Get results
router.get('/results', electionController.getResults);

module.exports = router;

