# BlocPol Frontend API Documentation

This document describes the API integration between the frontend and backend services.

## Base Configuration

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

## Authentication

All API requests require wallet-based authentication using signed messages.

### Signing Process

1. User connects MetaMask wallet
2. Frontend generates a message to sign
3. User signs the message with their private key
4. Frontend sends the signature with the request
5. Backend verifies the signature and wallet address

## API Endpoints

### 1. Voter Registration

**Endpoint:** `POST /api/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "signature": "0x...",
  "message": "Register for BlocPol voting system with email: john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voter registered successfully",
  "voter": {
    "id": "voter_123",
    "name": "John Doe",
    "email": "john@example.com",
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "registeredAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Voter already registered",
  "error": "DUPLICATE_VOTER"
}
```

### 2. Get Candidates

**Endpoint:** `GET /api/candidates`

**Response:**
```json
{
  "success": true,
  "candidates": [
    {
      "id": "candidate_1",
      "name": "John Doe",
      "party": "Democratic Party",
      "description": "Experienced leader with a vision for the future",
      "photo": "https://example.com/photo.jpg",
      "votes": 150
    },
    {
      "id": "candidate_2",
      "name": "Jane Smith",
      "party": "Republican Party",
      "description": "Fresh perspective and innovative ideas",
      "photo": "https://example.com/photo2.jpg",
      "votes": 120
    }
  ]
}
```

### 3. Cast Vote

**Endpoint:** `POST /api/vote`

**Request Body:**
```json
{
  "candidateId": "candidate_1",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "signature": "0x...",
  "message": "Vote for candidate: John Doe (ID: candidate_1)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vote cast successfully",
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "vote": {
    "id": "vote_123",
    "candidateId": "candidate_1",
    "voterAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 4. Get Results

**Endpoint:** `GET /api/results`

**Response:**
```json
{
  "success": true,
  "results": {
    "candidates": [
      {
        "id": "candidate_1",
        "name": "John Doe",
        "party": "Democratic Party",
        "votes": 150,
        "percentage": 55.6
      },
      {
        "id": "candidate_2",
        "name": "Jane Smith",
        "party": "Republican Party",
        "votes": 120,
        "percentage": 44.4
      }
    ],
    "totalVotes": 270,
    "winner": {
      "id": "candidate_1",
      "name": "John Doe",
      "votes": 150
    },
    "lastUpdated": "2024-01-01T00:00:00Z"
  }
}
```

### 5. Check Voter Status

**Endpoint:** `GET /api/voter-status/:walletAddress`

**Response:**
```json
{
  "success": true,
  "voter": {
    "registered": true,
    "hasVoted": false,
    "votedCandidate": null,
    "registrationDate": "2024-01-01T00:00:00Z"
  }
}
```

### 6. Verify Vote

**Endpoint:** `GET /api/verify-vote/:transactionHash`

**Response:**
```json
{
  "success": true,
  "verified": true,
  "vote": {
    "id": "vote_123",
    "candidateId": "candidate_1",
    "voterAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "timestamp": "2024-01-01T00:00:00Z",
    "blockNumber": 12345678
  }
}
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

- `WALLET_NOT_CONNECTED`: User wallet not connected
- `INVALID_SIGNATURE`: Signature verification failed
- `VOTER_NOT_REGISTERED`: Voter not registered
- `ALREADY_VOTED`: Voter has already cast a vote
- `CANDIDATE_NOT_FOUND`: Candidate ID not found
- `VOTING_CLOSED`: Voting period has ended
- `INVALID_REQUEST`: Request validation failed

## Rate Limiting

- Registration: 5 requests per minute per IP
- Voting: 1 request per minute per wallet
- Results: 60 requests per minute per IP
- Other endpoints: 30 requests per minute per IP

## CORS Configuration

The API supports CORS for the following origins:
- `http://localhost:3000` (development)
- `https://yourdomain.com` (production)

## WebSocket Events (Optional)

If real-time updates are implemented:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3001/ws');

// Listen for vote updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'VOTE_CAST') {
    // Update UI with new vote
  }
};
```

## Security Considerations

1. **Message Signing**: All requests must include a valid signature
2. **Rate Limiting**: Implemented to prevent abuse
3. **Input Validation**: All inputs are validated and sanitized
4. **CORS**: Properly configured for security
5. **HTTPS**: Required in production

## Testing

### Mock Data

For development and testing, you can use mock data:

```javascript
const mockCandidates = [
  {
    id: 'candidate_1',
    name: 'John Doe',
    party: 'Democratic Party',
    votes: 150
  }
];
```

### API Testing

```javascript
// Test API endpoint
const response = await fetch('/api/candidates');
const data = await response.json();
console.log(data);
```

## Integration Examples

### Frontend Service Usage

```javascript
import { apiService } from '../services/api';

// Register voter
const voterData = {
  name: 'John Doe',
  email: 'john@example.com',
  walletAddress: account,
  signature: signature,
  message: message
};

const result = await apiService.registerVoter(voterData);
```

### Error Handling

```javascript
try {
  const candidates = await apiService.getCandidates();
  setCandidates(candidates);
} catch (error) {
  toast.error(error.message);
  console.error('API Error:', error);
}
```

## Changelog

### Version 1.0.0
- Initial API implementation
- Voter registration
- Candidate management
- Voting system
- Results display
- Vote verification
