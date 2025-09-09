# 🗳️ BlocPol - Secure Voting System on Blockchain

A comprehensive, secure voting system built on Ethereum blockchain with advanced features for transparency, security, and user experience.

## 🚀 Features

### 🛡️ Core Functionalities
- ✅ **Admin-only candidate registration** with IPFS profile support
- ✅ **Voting session management** (start/stop with time restrictions)
- ✅ **One vote per wallet** prevention system
- ✅ **Real-time vote tracking** per candidate
- ✅ **Comprehensive event logging** for transparency
- ✅ **Role-based access control** with modifiers
- ✅ **Vote hash and transaction hash** retrieval for proof
- ✅ **Transparent but anonymous** vote viewing

### 🧠 Advanced Features
- ✅ **Timestamp-based voting periods** with automatic restrictions
- ✅ **Blockchain proof of vote** with unique vote hashes
- ✅ **Transaction hash tracking** for audit trails
- ✅ **IPFS integration** for off-chain candidate profiles
- ✅ **Comprehensive event emission** for all major actions
- ✅ **Contract deployment timestamp** for transparency
- ✅ **Gas-optimized** contract design

## 📁 Project Structure

```
BlocPol/
├── contracts/
│   └── BlocPol.sol              # Main smart contract
├── scripts/
│   └── deploy.js                # Hardhat deployment script
├── test/
│   └── blocpol.test.js          # Comprehensive test suite
├── abi/
│   └── BlocPol.json             # Contract ABI for frontend
├── frontend/
│   └── integration.js           # Web3.js & Ethers.js integration
├── artifacts/                   # Compiled contract artifacts
├── hardhat.config.js            # Hardhat configuration
└── README.md                    # This file
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BlocPol
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile the contract**
   ```bash
   npx hardhat compile
   ```

4. **Run tests**
   ```bash
   npx hardhat test
   ```

5. **Deploy to local network**
   ```bash
   npx hardhat node
   npx hardhat run scripts/deploy.js --network localhost
   ```

## 📋 Smart Contract Functions

### Admin Functions
- `registerCandidate(string name, string ipfsHash)` - Register a new candidate
- `startVotingSession(uint durationSeconds)` - Start voting with time limit
- `stopVotingSession()` - Stop active voting session

### Voting Functions
- `vote(uint candidateId)` - Cast a vote for a candidate

### View Functions
- `getCandidates()` - Get all registered candidates
- `getCandidate(uint candidateId)` - Get specific candidate details
- `getTotalVotes(uint candidateId)` - Get vote count for candidate
- `isVotingActive()` - Check if voting is currently active
- `hasAddressVoted(address addr)` - Check if address has voted
- `getVoteHash(address voter)` - Get vote proof hash
- `getVoteTxHash(address voter)` - Get transaction hash for vote
- `getDeploymentTimestamp()` - Get contract deployment time
- `getAllVotes()` - Get all vote counts (anonymous)

## 🔗 Frontend Integration

### Web3.js Integration
```javascript
// Connect to MetaMask
const { web3, blocPolContract, account } = await connectMetaMaskWeb3();

// Cast a vote
await voteWeb3(candidateId);

// Get candidates
const candidates = await getCandidatesWeb3();

// Listen to events
await listenToVoteCastEventsWeb3();
```

### Ethers.js Integration
```javascript
// Connect to MetaMask
const { provider, signer, blocPolContract, account } = await connectMetaMaskEthers();

// Cast a vote
await voteEthers(candidateId);

// Get candidates
const candidates = await getCandidatesEthers();

// Listen to events
await listenToVoteCastEventsEthers();
```

## 🧪 Testing

The project includes comprehensive tests covering:

- ✅ Admin role verification
- ✅ Candidate registration
- ✅ Voting session management
- ✅ Vote casting and validation
- ✅ Vote tracking and counting
- ✅ Event emission verification
- ✅ Access control testing
- ✅ Error handling validation

Run tests with:
```bash
npx hardhat test
```

## 🔐 Security Features

### Access Control
- **Admin-only functions** for critical operations
- **Modifier-based** role verification
- **One-vote-per-address** enforcement

### Transparency
- **Event logging** for all major actions
- **Vote hash generation** for proof of vote
- **Transaction hash tracking** for audit trails
- **Public view functions** for transparency

### Gas Optimization
- **Efficient storage** patterns
- **Calldata usage** for strings
- **Minimal state changes** per transaction

## 🌐 Deployment

### Local Development
```bash
# Start local blockchain
npx hardhat node

# Deploy contract
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment
```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet Deployment
```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

## 📊 Usage Examples

### Complete Voting Flow
```javascript
// 1. Connect wallet
const { account } = await connectMetaMaskEthers();

// 2. Check voting status
const isActive = await isVotingActiveEthers();

// 3. Get candidates
const candidates = await getCandidatesEthers();

// 4. Check if already voted
const hasVoted = await hasAddressVotedEthers(account);

// 5. Cast vote
if (!hasVoted && isActive) {
  await voteEthers(0); // Vote for candidate 0
}

// 6. Get vote proof
const voteHash = await getVoteHashEthers(account);
const txHash = await getVoteTxHashEthers(account);
```

### Admin Setup Flow
```javascript
// 1. Register candidates
await registerCandidateEthers("Alice Johnson", "QmHash1");
await registerCandidateEthers("Bob Smith", "QmHash2");

// 2. Start voting session (24 hours)
const durationSeconds = 24 * 60 * 60;
await startVotingSessionEthers(durationSeconds);
```

## 🔧 Configuration

### Hardhat Configuration
The project uses Hardhat for development, testing, and deployment. Configure networks in `hardhat.config.js`:

```javascript
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [PRIVATE_KEY]
    }
  }
};
```

### Environment Variables
Create a `.env` file for sensitive data:
```env
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the test files for usage examples
- Review the integration examples in `frontend/integration.js`

## 🔮 Roadmap

- [ ] **Multi-signature admin** support
- [ ] **Vote delegation** system
- [ ] **Advanced IPFS** integration
- [ ] **Mobile app** integration
- [ ] **Real-time** vote updates
- [ ] **Advanced analytics** dashboard

---

**Built with ❤️ for secure, transparent, and accessible voting on the blockchain.**
