const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

// Get candidates
const getCandidates = async (req, res) => {
  try {
    const { electionId, status = 'active' } = req.query;
    
    const query = { status };
    if (electionId) {
      query.electionId = electionId;
    }

    const candidates = await Candidate.find(query)
      .populate('electionId', 'title status')
      .sort({ voteCount: -1 });

    res.json({
      success: true,
      candidates: candidates.map(candidate => ({
        id: candidate._id,
        name: candidate.name,
        party: candidate.party,
        description: candidate.description,
        photo: candidate.photo,
        voteCount: candidate.voteCount,
        totalVotes: candidate.totalVotes,
        electionId: candidate.electionId._id,
        electionTitle: candidate.electionId.title,
        status: candidate.status
      }))
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates'
    });
  }
};

// Get election results
const getResults = async (req, res) => {
  try {
    const { electionId } = req.query;
    
    let query = {};
    if (electionId) {
      query.electionId = electionId;
    }

    const candidates = await Candidate.find(query)
      .populate('electionId', 'title status startDate endDate')
      .sort({ voteCount: -1 });

    if (candidates.length === 0) {
      return res.json({
        success: true,
        candidates: [],
        totalVotes: 0,
        winner: null
      });
    }

    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    const winner = candidates[0]; // First candidate (highest vote count)

    res.json({
      success: true,
      candidates: candidates.map(candidate => ({
        id: candidate._id,
        name: candidate.name,
        party: candidate.party,
        votes: candidate.voteCount,
        percentage: totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(2) : 0
      })),
      totalVotes,
      winner: {
        id: winner._id,
        name: winner.name,
        party: winner.party,
        votes: winner.voteCount
      },
      election: candidates[0].electionId
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results'
    });
  }
};

module.exports = {
  getCandidates,
  getResults
};

