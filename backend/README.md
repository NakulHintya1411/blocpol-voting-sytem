# BlocPol Backend API

Backend API server for the BlocPol blockchain voting system.

## Features

- **Admin Management**: Complete admin dashboard API with authentication
- **Voter Registration**: Secure voter registration with wallet verification
- **Election Management**: Create, manage, and monitor voting sessions
- **Candidate Management**: Register and manage election candidates
- **Audit Trail**: Complete audit logging for transparency
- **Blockchain Integration**: Smart contract integration for secure voting
- **Rate Limiting**: Built-in rate limiting for security
- **Database**: MongoDB integration with Mongoose ODM

## Prerequisites

- Node.js 16 or higher
- MongoDB 4.4 or higher
- Ethereum node (local or Infura/Alchemy)
- Smart contract deployed

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # On Linux/macOS
   sudo systemctl start mongod
   
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Windows
   net start MongoDB
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   
   # Or use the startup script
   ./start.sh dev    # Linux/macOS
   start.bat dev     # Windows
   ```

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blocpol

# Blockchain Configuration
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
PRIVATE_KEY=your_private_key_here

# Admin Configuration
ADMIN_ADDRESSES=0x1234567890123456789012345678901234567890,0x0987654321098765432109876543210987654321

# Security Configuration
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

## API Endpoints

### Admin Endpoints

All admin endpoints require authentication via the `Authorization: Bearer <wallet_address>` header.

#### Authentication
- `GET /api/admin/status/:walletAddress` - Check admin status

#### Dashboard
- `GET /api/admin/stats` - Get admin dashboard statistics

#### Elections
- `GET /api/admin/elections` - Get all elections
- `POST /api/admin/elections` - Create new election
- `GET /api/admin/elections/:id` - Get single election
- `PUT /api/admin/elections/:id` - Update election
- `DELETE /api/admin/elections/:id` - Delete election
- `POST /api/admin/elections/:id/start` - Start election
- `POST /api/admin/elections/:id/stop` - Stop election

#### Candidates
- `GET /api/admin/candidates` - Get all candidates
- `POST /api/admin/candidates` - Register new candidate
- `GET /api/admin/candidates/:id` - Get single candidate
- `PUT /api/admin/candidates/:id` - Update candidate
- `DELETE /api/admin/candidates/:id` - Delete candidate
- `POST /api/admin/candidates/:id/approve` - Approve candidate
- `POST /api/admin/candidates/:id/reject` - Reject candidate

#### Audit Trail
- `GET /api/admin/audit` - Get audit logs
- `POST /api/admin/audit/export` - Export audit logs
- `GET /api/admin/audit/:actionHash` - Get single audit log

#### Settings
- `GET /api/admin/settings` - Get admin settings
- `PUT /api/admin/settings` - Update admin settings

### Voter Endpoints

#### Registration
- `POST /api/voter/register` - Register new voter
- `GET /api/voter/status/:walletAddress` - Get voter status

#### Voting
- `POST /api/voter/vote` - Cast vote
- `GET /api/voter/verify/:transactionHash` - Verify vote

### Election Endpoints

#### Public Data
- `GET /api/election/candidates` - Get candidates
- `GET /api/election/results` - Get election results

## Database Models

### Election
- Election management and configuration
- Voting session tracking
- Candidate associations

### Candidate
- Candidate information and status
- Vote counting and statistics
- Document management

### Voter
- Voter registration and verification
- Voting history tracking
- Preference settings

### AuditLog
- Complete audit trail
- Action tracking and logging
- Security monitoring

### AdminSettings
- System configuration
- Feature toggles
- Security parameters

## Security Features

- **Admin Authentication**: Wallet-based admin authentication
- **Rate Limiting**: Configurable rate limiting per endpoint
- **Input Validation**: Comprehensive input validation
- **CORS Protection**: Configurable CORS settings
- **Helmet Security**: Security headers and protection
- **Audit Logging**: Complete audit trail for all actions

## Blockchain Integration

The backend integrates with Ethereum smart contracts for:
- Voter registration verification
- Vote casting and verification
- Election management
- Result calculation

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Database Seeding
```bash
# Add seed data (if implemented)
npm run seed
```

## Deployment

### Production Setup

1. **Environment Configuration**
   - Set `NODE_ENV=production`
   - Configure production database
   - Set up proper admin addresses
   - Configure blockchain RPC

2. **Database Setup**
   - Set up MongoDB cluster
   - Configure connection string
   - Set up backups

3. **Security**
   - Use HTTPS
   - Configure proper CORS
   - Set up rate limiting
   - Use environment variables for secrets

4. **Monitoring**
   - Set up logging
   - Monitor performance
   - Set up alerts

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **Blockchain Connection Error**
   - Verify RPC URL
   - Check contract address
   - Ensure sufficient gas

3. **Admin Authentication Error**
   - Verify admin addresses in .env
   - Check wallet address format
   - Ensure proper authorization header

### Logs

Check application logs for detailed error information:
```bash
# View logs
tail -f logs/app.log

# Or check console output
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.


