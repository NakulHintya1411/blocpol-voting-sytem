/**
 * Candidates API Route
 * Handles candidate-related operations
 */

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return getCandidates(req, res);
      case 'POST':
        return createCandidate(req, res);
      case 'PUT':
        return updateCandidate(req, res);
      case 'DELETE':
        return deleteCandidate(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Candidates API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all candidates
async function getCandidates(req, res) {
  try {
    const { electionId, page = 1, limit = 10 } = req.query;
    
    // Mock data for now
    const candidates = [
      {
        id: 1,
        name: "John Doe",
        party: "Democratic Party",
        description: "Experienced politician with 10 years in public service",
        walletAddress: "0x1234567890123456789012345678901234567890",
        email: "john@example.com",
        phone: "+1 (555) 123-4567",
        electionId: electionId || 1,
        isVerified: true,
        registeredAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Jane Smith",
        party: "Republican Party",
        description: "Business leader and community advocate",
        walletAddress: "0x0987654321098765432109876543210987654321",
        email: "jane@example.com",
        phone: "+1 (555) 987-6543",
        electionId: electionId || 1,
        isVerified: true,
        registeredAt: new Date().toISOString()
      }
    ];

    // Filter by election if specified
    const filteredCandidates = electionId 
      ? candidates.filter(c => c.electionId == electionId)
      : candidates;

    res.status(200).json({
      success: true,
      data: filteredCandidates,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(filteredCandidates.length / limit),
        total: filteredCandidates.length
      }
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
}

// Create new candidate
async function createCandidate(req, res) {
  try {
    const {
      name,
      description,
      party,
      walletAddress,
      email,
      phone,
      electionId,
      registeredBy
    } = req.body;

    // Validate required fields
    if (!name || !walletAddress || !electionId) {
      return res.status(400).json({ error: 'Name, wallet address, and election ID are required' });
    }

    // Mock response for now
    const candidate = {
      id: Date.now(),
      name,
      description: description || '',
      party: party || '',
      walletAddress,
      email: email || '',
      phone: phone || '',
      electionId,
      registeredBy,
      isVerified: false,
      registeredAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: candidate,
      message: 'Candidate registered successfully'
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ error: 'Failed to register candidate' });
  }
}

// Update candidate
async function updateCandidate(req, res) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    // Mock response for now
    const candidate = {
      id: parseInt(id),
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: candidate,
      message: 'Candidate updated successfully'
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
}

// Delete candidate
async function deleteCandidate(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    // Mock response for now
    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
}
