/**
 * Vote API Route
 * Handles voting operations
 */

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return castVote(req, res);
      case 'GET':
        return getVoteStatus(req, res);
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Vote API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Cast a vote
async function castVote(req, res) {
  try {
    const { voterId, candidateId, electionId, walletAddress } = req.body;

    if (!voterId || !candidateId || !electionId || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Mock response for now
    const vote = {
      voterId,
      candidateId,
      electionId,
      walletAddress,
      votedAt: new Date().toISOString(),
      transactionHash: "0x" + Math.random().toString(16).substr(2, 64)
    };

    res.status(200).json({
      success: true,
      data: vote,
      message: 'Vote cast successfully'
    });
  } catch (error) {
    console.error('Cast vote error:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
}

// Get vote status
async function getVoteStatus(req, res) {
  try {
    const { voterId, electionId } = req.query;

    if (!voterId || !electionId) {
      return res.status(400).json({ error: 'Voter ID and Election ID are required' });
    }

    // Mock response for now
    const status = {
      hasVoted: false,
      isVerified: true,
      isVotingActive: true,
      electionStatus: 'active'
    };

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get vote status error:', error);
    res.status(500).json({ error: 'Failed to get vote status' });
  }
}