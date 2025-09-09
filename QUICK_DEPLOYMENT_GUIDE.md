# 🚀 Quick Deployment Guide for BlocPol

## Step-by-Step Vercel Deployment

### Step 1: Set Up Required Services (15 minutes)

#### 1.1 MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (choose the free M0 tier)
4. Create a database user:
   - Username: `blocpol-user`
   - Password: Generate a strong password
5. Add IP address `0.0.0.0/0` to whitelist (for development)
6. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

#### 1.2 Get Blockchain RPC URL
1. Go to [Infura](https://infura.io) or [Alchemy](https://alchemy.com)
2. Create a free account
3. Create a new project
4. Get your RPC URL (looks like: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`)

#### 1.3 Get Testnet ETH
1. Go to [Sepolia Faucet](https://sepoliafaucet.com)
2. Enter your wallet address
3. Get testnet ETH (you'll need this for contract deployment)

### Step 2: Configure Environment Variables (10 minutes)

#### 2.1 Backend Environment
Edit `backend/.env` file:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://blocpol-user:YOUR_PASSWORD@cluster.mongodb.net/blocpol?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Blockchain Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=
PRIVATE_KEY=your_private_key_here

# Admin Configuration
ADMIN_ADDRESSES=0x1234567890123456789012345678901234567890

# Security
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
ENCRYPTION_KEY=your_encryption_key_here_32_characters_long
```

#### 2.2 Frontend Environment
Edit `frontend/.env.local` file:

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
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_CONTRACT_ABI_PATH=/abi/BlocPol.json

# App Configuration
NEXT_PUBLIC_APP_NAME=BlocPol
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Blockchain-based Voting System
```

### Step 3: Deploy Smart Contracts (20 minutes)

#### 3.1 Install Hardhat
```bash
cd contracts
npm install --save-dev hardhat
npx hardhat init
```

#### 3.2 Deploy to Sepolia
```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia (you'll need testnet ETH)
npx hardhat run scripts/deploy.js --network sepolia
```

#### 3.3 Update Contract Addresses
After deployment, update the contract addresses in your environment files.

### Step 4: Deploy to Vercel (15 minutes)

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
cd ../backend
vercel --prod
```

### Step 5: Configure Vercel Environment Variables

#### 5.1 Frontend Environment Variables
In Vercel dashboard, go to your frontend project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://your-backend.vercel.app
NEXT_PUBLIC_RPC_URL = https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID = 11155111
NEXT_PUBLIC_CONTRACT_ADDRESS = 0x... (from deployment)
```

#### 5.2 Backend Environment Variables
In Vercel dashboard, go to your backend project → Settings → Environment Variables:

```
MONGODB_URI = mongodb+srv://...
JWT_SECRET = your_jwt_secret
RPC_URL = https://sepolia.infura.io/v3/...
CONTRACT_ADDRESS = 0x... (from deployment)
PRIVATE_KEY = your_private_key
ADMIN_ADDRESSES = 0x...
```

### Step 6: Set Up Database (10 minutes)

#### 6.1 Run Database Setup
```bash
cd backend
node scripts/setup-database.js
```

#### 6.2 Verify Database Connection
Check that your MongoDB Atlas cluster is connected and the database is set up.

### Step 7: Test Your Deployment (10 minutes)

#### 7.1 Test Frontend
1. Visit your Vercel frontend URL
2. Check if the page loads
3. Test wallet connection
4. Navigate through pages

#### 7.2 Test Backend
1. Visit `https://your-backend.vercel.app/api/health`
2. Should return a JSON response with status

#### 7.3 Test Full Flow
1. Create an election (admin)
2. Register voters
3. Cast votes
4. View results

## 🎯 Quick Commands Summary

```bash
# 1. Set up environment
node setup-environment.js

# 2. Install Vercel CLI
npm install -g vercel

# 3. Login to Vercel
vercel login

# 4. Deploy frontend
cd frontend && vercel --prod

# 5. Deploy backend
cd ../backend && vercel --prod

# 6. Set up database
cd backend && node scripts/setup-database.js
```

## 🔧 Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**
   - Check Vercel dashboard settings
   - Redeploy after adding variables

2. **Database Connection Failed**
   - Verify MongoDB URI
   - Check IP whitelist

3. **Contract Not Found**
   - Verify contract address
   - Check RPC URL

4. **Build Failures**
   - Check Vercel build logs
   - Verify all dependencies

## 📞 Need Help?

If you encounter any issues:
1. Check the Vercel build logs
2. Verify environment variables
3. Test locally first with `npm run dev`
4. Check the detailed deployment guide

## 🎉 Success!

Once everything is deployed and working:
1. Your frontend will be at: `https://your-app.vercel.app`
2. Your backend API will be at: `https://your-backend.vercel.app`
3. You can start creating elections and testing the voting system!

---

**Total Time Required**: ~1 hour
**Difficulty**: Intermediate
**Prerequisites**: Basic knowledge of web development and blockchain
