# 🚀 Immediate Deployment Steps for BlocPol

## What You Should Do Right Now

### Step 1: Set Up Required Accounts (15 minutes)

#### 1.1 MongoDB Atlas (Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create a new cluster (choose M0 free tier)
4. Create database user:
   - Username: `blocpol-user`
   - Password: Generate a strong password (save this!)
5. Add IP address `0.0.0.0/0` to whitelist
6. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

#### 1.2 Infura/Alchemy (Free)
1. Go to [Infura](https://infura.io) or [Alchemy](https://alchemy.com)
2. Create free account
3. Create new project
4. Get RPC URL (looks like: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`)

#### 1.3 Get Testnet ETH
1. Go to [Sepolia Faucet](https://sepoliafaucet.com)
2. Enter your MetaMask wallet address
3. Get testnet ETH (you need this for deployment)

### Step 2: Install Vercel CLI (2 minutes)

```bash
npm install -g vercel
vercel login
```

### Step 3: Configure Environment Variables (10 minutes)

#### 3.1 Backend Environment
Edit `backend/.env`:

```env
MONGODB_URI=mongodb+srv://blocpol-user:YOUR_PASSWORD@cluster.mongodb.net/blocpol?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=
PRIVATE_KEY=your_private_key_here
ADMIN_ADDRESSES=0x1234567890123456789012345678901234567890
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
ENCRYPTION_KEY=your_encryption_key_here_32_characters_long
```

#### 3.2 Frontend Environment
Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAIN_NAME=Sepolia Testnet
NEXT_PUBLIC_BLOCK_EXPLORER=https://sepolia.etherscan.io
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_APP_NAME=BlocPol
```

### Step 4: Deploy to Vercel (10 minutes)

#### 4.1 Deploy Frontend
```bash
cd frontend
vercel --prod
```

#### 4.2 Deploy Backend
```bash
cd ../backend
vercel --prod
```

### Step 5: Set Environment Variables in Vercel

#### 5.1 Frontend Variables (in Vercel Dashboard)
- `NEXT_PUBLIC_API_URL` = `https://your-backend.vercel.app`
- `NEXT_PUBLIC_RPC_URL` = `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
- `NEXT_PUBLIC_CHAIN_ID` = `11155111`
- `NEXT_PUBLIC_CONTRACT_ADDRESS` = (leave empty for now)

#### 5.2 Backend Variables (in Vercel Dashboard)
- `MONGODB_URI` = `mongodb+srv://...`
- `JWT_SECRET` = `your_jwt_secret`
- `RPC_URL` = `https://sepolia.infura.io/v3/...`
- `CONTRACT_ADDRESS` = (leave empty for now)
- `PRIVATE_KEY` = `your_private_key`
- `ADMIN_ADDRESSES` = `0x...`

### Step 6: Test Your Deployment (5 minutes)

1. Visit your frontend URL (from Vercel)
2. Check if it loads
3. Test wallet connection
4. Check backend health: `https://your-backend.vercel.app/api/health`

## 🎯 Quick Commands

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy frontend
cd frontend && vercel --prod

# 4. Deploy backend
cd ../backend && vercel --prod

# 5. Set up database (after deployment)
cd backend && node scripts/setup-database.js
```

## 🔧 What Happens Next

1. **Your frontend will be live** at: `https://your-app.vercel.app`
2. **Your backend API will be live** at: `https://your-backend.vercel.app`
3. **You can start testing** the basic functionality
4. **Later you can deploy smart contracts** and update the contract addresses

## ⚠️ Important Notes

- **This is a test deployment** - perfect for development and testing
- **Smart contracts are not deployed yet** - you'll do that later
- **Use testnet only** - never use mainnet for testing
- **Keep your private keys secure** - never commit them to git

## 🆘 If You Get Stuck

1. **Check Vercel build logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Test locally first** with `npm run dev`
4. **Check the detailed guides** in the project

## 🎉 Success!

Once deployed, you'll have:
- ✅ A live voting system
- ✅ User interface
- ✅ Database connection
- ✅ API endpoints
- ✅ Ready for smart contract integration

**Total time needed: ~45 minutes**
**Difficulty: Beginner to Intermediate**

---

## Next Steps After Deployment

1. **Deploy smart contracts** to Sepolia testnet
2. **Update contract addresses** in environment variables
3. **Test the full voting flow**
4. **Add more features** as needed
5. **Deploy to mainnet** when ready for production

The system is designed to work even without smart contracts initially, so you can start testing the UI and basic functionality right away!
