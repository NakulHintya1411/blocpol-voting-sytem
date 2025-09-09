/**
 * Voters API Route
 * Handles voter-related operations
 */

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return getVoters(req, res);
      case 'POST':
        return registerVoter(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Voters API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all voters
async function getVoters(req, res) {
  try {
    // Mock data for now
    const voters = [
      {
        id: 1,
        walletAddress: "0x1234567890123456789012345678901234567890",
        isVerified: true,
        hasVoted: false
      }
    ];

    res.status(200).json({
      success: true,
      data: voters,
      message: 'Voters retrieved successfully'
    });
  } catch (error) {
    console.error('Get voters error:', error);
    res.status(500).json({ error: 'Failed to fetch voters' });
  }
}

// Register new voter
async function registerVoter(req, res) {
  try {
    const { walletAddress, electionId } = req.body;

    if (!walletAddress || !electionId) {
      return res.status(400).json({ error: 'Wallet address and election ID are required' });
    }

    // Mock response for now
    const voter = {
      id: Date.now(),
      walletAddress,
      electionId,
      isVerified: false,
      hasVoted: false,
      registeredAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: voter,
      message: 'Voter registered successfully'
    });
  } catch (error) {
    console.error('Register voter error:', error);
    res.status(500).json({ error: 'Failed to register voter' });
  }
}