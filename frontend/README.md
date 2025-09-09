# BlocPol Frontend

A modern, responsive frontend for the BlocPol secure voting system built with Next.js and blockchain integration.

## Features

- 🔐 **Wallet Integration**: MetaMask connection with Web3.js
- 🗳️ **Voting Interface**: Clean, intuitive candidate selection
- 📊 **Real-time Results**: Live charts and statistics with Recharts
- 📱 **Responsive Design**: Mobile-first approach with TailwindCSS
- ✅ **Form Validation**: Formik + Yup for robust form handling
- 🔔 **Notifications**: Toast notifications for user feedback
- 🎨 **Modern UI**: Gradient designs, smooth animations, and dark mode support

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: TailwindCSS
- **Blockchain**: Web3.js
- **Forms**: Formik + Yup
- **Charts**: Recharts
- **Notifications**: react-toastify
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask browser extension

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_NETWORK_ID=1
NEXT_PUBLIC_NETWORK_NAME=mainnet
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── Card.js         # Card component with variants
│   ├── LoadingSpinner.js
│   └── Navbar.js       # Navigation component
├── contexts/           # React contexts
│   └── WalletContext.js # Wallet state management
├── pages/              # Next.js pages
│   ├── _app.js         # App wrapper with providers
│   ├── index.js        # Home page
│   ├── register.js     # Voter registration
│   ├── candidates.js   # Candidate selection
│   ├── confirmation.js # Vote confirmation
│   └── results.js      # Live results
├── services/           # API services
│   └── api.js         # Axios configuration
├── styles/             # Global styles
│   └── globals.css    # TailwindCSS + custom styles
└── public/            # Static assets
```

## Key Features

### Wallet Integration
- MetaMask detection and connection
- Wallet state management with Context API
- Message signing for authentication
- Account change detection

### Voting Flow
1. **Registration**: Name, email, and wallet connection
2. **Candidate Selection**: Browse and select candidates
3. **Vote Confirmation**: Transaction hash display
4. **Results**: Live charts and statistics

### UI/UX
- Modern gradient designs
- Smooth hover animations
- Responsive layout
- Dark mode support
- Accessibility features

## API Integration

The frontend integrates with the backend API through the following endpoints:

- `POST /api/register` - Voter registration
- `GET /api/candidates` - Fetch candidates
- `POST /api/vote` - Cast vote
- `GET /api/results` - Get election results
- `GET /api/voter-status/:address` - Check voter status
- `GET /api/verify-vote/:txHash` - Verify vote

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_NETWORK_ID` | Ethereum network ID | `1` |
| `NEXT_PUBLIC_NETWORK_NAME` | Network name | `mainnet` |

## Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
