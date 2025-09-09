/**
 * Elections API Route
 * Handles election-related operations
 */

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return getElections(req, res);
      case 'POST':
        return createElection(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Elections API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all elections
async function getElections(req, res) {
  try {
    // Mock data for now
    const elections = [
      {
        id: 1,
        title: "Sample Election",
        description: "This is a sample election",
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.status(200).json({
      success: true,
      data: elections,
      message: 'Elections retrieved successfully'
    });
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
}

// Create new election
async function createElection(req, res) {
  try {
    const { title, description, startDate, endDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Mock response for now
    const election = {
      id: Date.now(),
      title,
      description,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    };

    res.status(201).json({
      success: true,
      data: election,
      message: 'Election created successfully'
    });
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({ error: 'Failed to create election' });
  }
}