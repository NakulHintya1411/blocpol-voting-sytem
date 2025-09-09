# BlocPol Deployment Guide

## 🚀 Complete Deployment Guide for BlocPol Voting System

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Vercel account
- MetaMask wallet
- Git repository

### Phase 1: Environment Setup

#### 1.1 Backend Environment Configuration

Create `backend/.env` file:

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
ADMIN_ADDRESSES=0x1234567890123456789012345678901234567890,0x0987654321098765432109876543210987654321

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### 1.2 Frontend Environment Configuration

Create `frontend/.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com/api
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# App Configuration
NEXT_PUBLIC_APP_NAME=BlocPol
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Phase 2: Database Setup

#### 2.1 MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Choose the free tier (M0) for development

2. **Configure Database**
   - Create a database named `blocpol`
   - Create collections: `elections`, `candidates`, `voters`, `auditlogs`, `adminsettings`
   - Set up database user with read/write permissions

3. **Network Access**
   - Add your IP address to the whitelist
   - For production, add `0.0.0.0/0` (allow all IPs)

#### 2.2 Redis Setup (Optional)

For production, use Redis Cloud:
1. Create account at [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Create a new database
3. Get the connection URL

### Phase 3: Smart Contract Deployment

#### 3.1 Deploy to Testnet (Sepolia)

1. **Install Dependencies**
   ```bash
   cd contracts
   npm install
   ```

2. **Configure Hardhat**
   Update `hardhat.config.js`:
   ```javascript
   module.exports = {
     networks: {
       sepolia: {
         url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
         accounts: [process.env.PRIVATE_KEY]
       }
     }
   };
   ```

3. **Deploy Contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **Verify Contracts**
   ```bash
   npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
   ```

#### 3.2 Update Contract Addresses

Update the contract addresses in:
- `backend/.env`
- `frontend/.env.local`
- `abi/BlocPol.json`

### Phase 4: Backend Deployment

#### 4.1 Deploy to Heroku

1. **Create Heroku App**
   ```bash
   heroku create blocpol-backend
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set RPC_URL=your_rpc_url
   heroku config:set CONTRACT_ADDRESS=your_contract_address
   heroku config:set ADMIN_ADDRESSES=your_admin_addresses
   ```

3. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

#### 4.2 Alternative: Deploy to Railway

1. Connect your GitHub repository
2. Select the backend folder
3. Set environment variables in Railway dashboard
4. Deploy automatically

### Phase 5: Frontend Deployment to Vercel

#### 5.1 Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Select the frontend folder

2. **Configure Build Settings**
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set Environment Variables**
   - `NEXT_PUBLIC_API_URL`: Your backend URL
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your contract address
   - `NEXT_PUBLIC_RPC_URL`: Your RPC URL

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

#### 5.2 Custom Domain (Optional)

1. Go to your project settings
2. Add your custom domain
3. Update DNS records as instructed

### Phase 6: Testing and Verification

#### 6.1 End-to-End Testing

1. **Test Voter Registration**
   - Connect MetaMask wallet
   - Register as a voter
   - Verify registration in database

2. **Test Candidate Management**
   - Access admin dashboard
   - Register candidates
   - Approve/reject candidates

3. **Test Voting Process**
   - Create an election
   - Start voting session
   - Cast votes
   - Verify votes on blockchain

4. **Test Results Display**
   - View live results
   - Verify vote counts
   - Check transaction hashes

#### 6.2 Security Testing

1. **Test Access Controls**
   - Verify admin-only functions
   - Test voter authentication
   - Check signature verification

2. **Test Smart Contract Security**
   - Verify vote immutability
   - Test double-voting prevention
   - Check access controls

### Phase 7: Production Monitoring

#### 7.1 Set Up Monitoring

1. **Backend Monitoring**
   - Use Heroku metrics
   - Set up error tracking (Sentry)
   - Monitor database performance

2. **Frontend Monitoring**
   - Use Vercel analytics
   - Set up error tracking
   - Monitor user interactions

#### 7.2 Backup Strategy

1. **Database Backups**
   - Enable MongoDB Atlas backups
   - Set up automated daily backups
   - Test restore procedures

2. **Code Backups**
   - Use Git for version control
   - Tag stable releases
   - Maintain deployment documentation

### Phase 8: Launch Checklist

#### 8.1 Pre-Launch

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Documentation updated
- [ ] Team training completed

#### 8.2 Launch Day

- [ ] Deploy to production
- [ ] Monitor system health
- [ ] Test all functionality
- [ ] Announce to users
- [ ] Monitor for issues

#### 8.3 Post-Launch

- [ ] Monitor system performance
- [ ] Collect user feedback
- [ ] Fix any issues
- [ ] Plan future improvements

### Troubleshooting

#### Common Issues

1. **MetaMask Connection Issues**
   - Check network configuration
   - Verify contract address
   - Clear browser cache

2. **Database Connection Issues**
   - Check MongoDB URI
   - Verify network access
   - Check credentials

3. **Smart Contract Issues**
   - Verify contract address
   - Check RPC URL
   - Verify gas settings

#### Support

For technical support:
- Check the troubleshooting guide
- Review error logs
- Contact the development team

### Security Considerations

1. **Private Key Security**
   - Never commit private keys
   - Use environment variables
   - Consider hardware wallets

2. **Database Security**
   - Use strong passwords
   - Enable authentication
   - Restrict network access

3. **API Security**
   - Use HTTPS
   - Implement rate limiting
   - Validate all inputs

### Performance Optimization

1. **Frontend Optimization**
   - Use CDN for static assets
   - Implement lazy loading
   - Optimize images

2. **Backend Optimization**
   - Use database indexing
   - Implement caching
   - Optimize queries

3. **Smart Contract Optimization**
   - Minimize gas usage
   - Use efficient data structures
   - Batch operations when possible

---

## 🎉 Congratulations!

Your BlocPol voting system is now deployed and ready for use! 

For ongoing maintenance and updates, refer to the maintenance guide in the project documentation.
