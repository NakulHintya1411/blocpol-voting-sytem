export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      stats: {
        totalVoters: 0,
        totalCandidates: 0,
        totalVotes: 0,
        activeElections: 0
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
