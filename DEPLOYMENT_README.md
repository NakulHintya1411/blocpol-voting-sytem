# 🚀 BlocPol Deployment Guide

## Complete Step-by-Step Deployment Instructions

### Prerequisites

Before starting the deployment process, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Git repository set up
- ✅ MongoDB Atlas account
- ✅ Vercel account
- ✅ MetaMask wallet
- ✅ Testnet ETH (for Sepolia testnet)

### Phase 1: Environment Setup

#### 1.1 Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd BlocPol

# Run the environment setup script
node setup-environment.js
```

#### 1.2 Configure Environment Variables

**Backend Environment (`backend/.env`):**

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blocpol?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Blockchain Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
PRIVATE_KEY=your_private_key_here

# Admin Configuration
ADMIN_ADDRESSES=0x1234567890123456789012345678901234567890

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

**Frontend Environment (`frontend/.env.local`):**

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_WS_URL=wss://your-backend.vercel.app

# Blockchain Configuration
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAIN_NAME=Sepolia Testnet
NEXT_PUBLIC_BLOCK_EXPLORER=https://sepolia.etherscan.io

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_CONTRACT_ABI_PATH=/abi/BlocPol.json
```

### Phase 2: Database Setup

#### 2.1 MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Choose the free tier (M0)

2. **Configure Database Access**
   - Create a database user
   - Set up IP whitelist (0.0.0.0/0 for development)
   - Get connection string

3. **Set up Database**
   ```bash
   cd backend
   node scripts/setup-database.js
   ```

#### 2.2 Redis Setup (Optional)

For production, use Redis Cloud or similar service:

```bash
cd backend
node scripts/setup-redis.js
```

### Phase 3: Smart Contract Deployment

#### 3.1 Deploy to Sepolia Testnet

```bash
# Install Hardhat
npm install --save-dev hardhat

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

#### 3.2 Update Contract Addresses

Update the contract addresses in your environment files after deployment.

### Phase 4: Vercel Deployment

#### 4.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 4.2 Login to Vercel

```bash
vercel login
```

#### 4.3 Deploy Frontend

```bash
cd frontend
vercel --prod
```

#### 4.4 Deploy Backend

```bash
cd backend
vercel --prod
```

#### 4.5 Set Environment Variables in Vercel

**Frontend Environment Variables:**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`

**Backend Environment Variables:**
- `MONGODB_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `RPC_URL`
- `CONTRACT_ADDRESS`
- `PRIVATE_KEY`
- `ADMIN_ADDRESSES`

### Phase 5: Testing and Verification

#### 5.1 Run Tests

```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test
```

#### 5.2 Test Deployment

1. **Health Check**
   - Visit `https://your-frontend.vercel.app/api/health`
   - Should return status 200

2. **Frontend Test**
   - Visit `https://your-frontend.vercel.app`
   - Test wallet connection
   - Test navigation

3. **Backend Test**
   - Test API endpoints
   - Verify database connection
   - Check blockchain integration

### Phase 6: Production Optimization

#### 6.1 Security Hardening

- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Enable audit logging

#### 6.2 Performance Optimization

- [ ] Enable Redis caching
- [ ] Optimize database queries
- [ ] Implement CDN
- [ ] Enable compression
- [ ] Monitor performance

#### 6.3 Monitoring Setup

- [ ] Set up error tracking (Sentry)
- [ ] Configure logging
- [ ] Set up uptime monitoring
- [ ] Create alerts

### Troubleshooting

#### Common Issues

1. **Environment Variables Not Loading**
   - Check `.env` file location
   - Verify variable names
   - Restart the application

2. **Database Connection Failed**
   - Check MongoDB URI
   - Verify network access
   - Check credentials

3. **Blockchain Connection Issues**
   - Verify RPC URL
   - Check network configuration
   - Ensure sufficient testnet ETH

4. **Vercel Deployment Failed**
   - Check build logs
   - Verify environment variables
   - Check function timeout limits

#### Getting Help

- Check the logs in Vercel dashboard
- Review error messages in browser console
- Check MongoDB Atlas logs
- Verify smart contract deployment

### Post-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database connected and populated
- [ ] Smart contracts deployed and verified
- [ ] Frontend accessible and functional
- [ ] Backend API responding
- [ ] Wallet integration working
- [ ] Voting functionality tested
- [ ] Admin panel accessible
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Documentation updated

### Maintenance

#### Regular Tasks

- Monitor application performance
- Update dependencies
- Backup database
- Review security logs
- Update smart contracts if needed

#### Scaling Considerations

- Database sharding
- CDN implementation
- Load balancing
- Caching strategies
- Smart contract optimization

---

## 🎉 Congratulations!

Your BlocPol voting system is now deployed and ready for use. The system provides:

- ✅ Secure blockchain-based voting
- ✅ Transparent and auditable results
- ✅ User-friendly interface
- ✅ Admin management panel
- ✅ Real-time vote tracking
- ✅ Comprehensive audit logs

For support or questions, please refer to the documentation or create an issue in the repository.
