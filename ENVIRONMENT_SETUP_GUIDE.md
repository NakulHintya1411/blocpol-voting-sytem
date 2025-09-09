# 🔧 Environment Setup Guide

## Step 1: MongoDB Atlas Setup ✅

### What you need to do:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create M0 cluster (free tier)
4. Create database user: `blocpol-user`
5. Set password (save this!)
6. Allow access from anywhere (0.0.0.0/0)
7. Get connection string

### Your MongoDB connection string will look like:
```
mongodb+srv://blocpol-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Step 2: Infura API Key Setup ✅

### What you need to do:
1. Go to [Infura](https://infura.io)
2. Create free account
3. Create new project: "BlocPol Voting System"
4. Get Project ID

### Your Infura RPC URL will look like:
```
https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

## Step 3: Update Environment Files

### Backend Environment (`backend/.env`)

Replace the placeholder values in `backend/.env`:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://blocpol-user:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/blocpol?retryWrites=true&w=majority

# Blockchain Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_ACTUAL_PROJECT_ID

# Security (generate these)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters
ENCRYPTION_KEY=your_encryption_key_here_32_characters_long

# Admin Configuration (your wallet address)
ADMIN_ADDRESSES=0xYOUR_WALLET_ADDRESS_HERE
```

### Frontend Environment (`frontend/.env.local`)

Create `frontend/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_WS_URL=wss://your-backend.vercel.app

# Blockchain Configuration
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_ACTUAL_PROJECT_ID
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

## Step 4: Generate Security Keys

### JWT Secret (32+ characters):
```bash
# Generate a random JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Encryption Key (32 characters):
```bash
# Generate a random encryption key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Step 5: Get Your Wallet Address

1. Open MetaMask
2. Copy your wallet address (starts with 0x...)
3. Use this as your ADMIN_ADDRESSES

## Step 6: Test Your Setup

After updating the environment files:

```bash
# Test backend
cd backend
npm start

# Test frontend (in another terminal)
cd frontend
npm run dev
```

## 🎯 Quick Checklist

- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created
- [ ] Database user created
- [ ] MongoDB connection string copied
- [ ] Infura account created
- [ ] Infura project created
- [ ] Infura Project ID copied
- [ ] Backend .env file updated
- [ ] Frontend .env.local file created
- [ ] Security keys generated
- [ ] Wallet address added
- [ ] Local testing completed

## 🚀 Ready for Deployment!

Once you've completed all the steps above, you can deploy to Vercel:

```bash
# Deploy to Vercel
node quick-deploy.js
```

## 🆘 Need Help?

If you get stuck on any step:
1. Check the MongoDB Atlas documentation
2. Check the Infura documentation
3. Make sure you're using the correct network (Sepolia testnet)
4. Verify your environment variables are correct
