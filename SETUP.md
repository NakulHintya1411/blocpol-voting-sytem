# BlocPol Setup Guide

Complete setup guide for the BlocPol blockchain voting system.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 16 or higher
- **MongoDB** 4.4 or higher
- **Git** for version control
- **MetaMask** browser extension
- **Ethereum node** (local or Infura/Alchemy)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BlocPol
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install smart contract dependencies
cd ../contracts
npm install
```

### 3. Database Setup

#### MongoDB Installation

**Ubuntu/Debian:**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Start MongoDB service: `net start MongoDB`

### 4. Smart Contract Deployment

#### Deploy to Local Network

```bash
cd contracts

# Start local blockchain (in separate terminal)
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

#### Deploy to Testnet

```bash
# Deploy to Goerli testnet
npx hardhat run scripts/deploy.js --network goerli
```

### 5. Backend Configuration

```bash
cd backend

# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

**Required .env variables:**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/blocpol
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
ADMIN_ADDRESSES=0x1234567890123456789012345678901234567890
```

### 6. Frontend Configuration

```bash
cd frontend

# Copy environment file
cp env.local.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

**Required .env.local variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=1337
```

### 7. Start the Application

#### Start Backend Server

```bash
cd backend

# Development mode
npm run dev

# Or use startup script
./start.sh dev    # Linux/macOS
start.bat dev     # Windows
```

#### Start Frontend Server

```bash
cd frontend

# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### 8. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3000/admin

## Configuration Details

### Admin Setup

1. **Add Admin Addresses**
   - Add your wallet addresses to `ADMIN_ADDRESSES` in backend `.env`
   - Add the same addresses to `NEXT_PUBLIC_ADMIN_ADDRESSES` in frontend `.env.local`

2. **Admin Authentication**
   - Connect your wallet to the frontend
   - Navigate to `/admin` - you should see the admin dashboard
   - If access is denied, check your wallet address is in the admin list

### Blockchain Configuration

1. **Local Development**
   - Use Hardhat local network
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337`

2. **Testnet Deployment**
   - Use Goerli or Sepolia testnet
   - Get RPC URL from Infura or Alchemy
   - Update contract address after deployment

### Database Configuration

1. **Local MongoDB**
   - Default connection: `mongodb://localhost:27017/blocpol`
   - No authentication required for local development

2. **Production MongoDB**
   - Use MongoDB Atlas or self-hosted cluster
   - Update connection string with credentials
   - Enable authentication and SSL

## Testing the Setup

### 1. Test Backend API

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test admin status (replace with your wallet address)
curl http://localhost:3001/api/admin/status/0x1234567890123456789012345678901234567890
```

### 2. Test Frontend

1. Open http://localhost:3000
2. Connect your wallet
3. Try registering as a voter
4. Access admin dashboard (if you're an admin)

### 3. Test Smart Contract

```bash
cd contracts

# Run tests
npx hardhat test

# Run specific test
npx hardhat test test/blocpol.test.js
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service
```bash
# Linux/macOS
sudo systemctl start mongod

# macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# Windows
net start MongoDB
```

#### 2. Blockchain Connection Error
```
Error: could not detect network
```
**Solution**: 
- Check RPC URL is correct
- Ensure blockchain node is running
- Verify network ID matches

#### 3. Admin Access Denied
```
Access denied. Admin privileges required.
```
**Solution**:
- Check wallet address is in `ADMIN_ADDRESSES`
- Ensure wallet is connected
- Verify address format (lowercase)

#### 4. Frontend Build Error
```
Module not found: Can't resolve 'fs'
```
**Solution**: This is a Next.js issue with server-side code in client components. Check imports and use dynamic imports where needed.

#### 5. CORS Error
```
Access to fetch at 'http://localhost:3001' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution**: Check CORS configuration in backend server.js

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=* npm run dev

# Frontend
NODE_ENV=development npm run dev
```

### Logs

Check application logs:

```bash
# Backend logs
cd backend
npm run dev

# Frontend logs
cd frontend
npm run dev
```

## Production Deployment

### 1. Environment Setup

- Set `NODE_ENV=production`
- Use production database
- Configure production blockchain RPC
- Set up proper admin addresses

### 2. Security

- Use HTTPS
- Configure proper CORS
- Set up rate limiting
- Use environment variables for secrets
- Enable MongoDB authentication

### 3. Monitoring

- Set up application monitoring
- Configure log aggregation
- Set up alerts
- Monitor blockchain transactions

### 4. Scaling

- Use MongoDB cluster
- Set up load balancing
- Configure CDN for frontend
- Use Redis for caching

## Support

If you encounter issues:

1. Check the troubleshooting section
2. Review logs for error messages
3. Verify all prerequisites are installed
4. Check environment configuration
5. Create an issue in the repository

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

