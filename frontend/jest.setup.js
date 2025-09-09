import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))

// Mock Web3
jest.mock('web3', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      eth: {
        personal: {
          sign: jest.fn().mockResolvedValue('0x1234567890abcdef'),
        },
        getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
      },
      utils: {
        fromWei: jest.fn().mockReturnValue('1.0'),
      },
    })),
  }
})

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    isMetaMask: true,
    request: jest.fn().mockResolvedValue(['0x1234567890abcdef1234567890abcdef12345678']),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
  writable: true,
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock fetch
global.fetch = jest.fn()

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
})

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock process.env
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api'
process.env.NEXT_PUBLIC_NETWORK_ID = '1'
process.env.NEXT_PUBLIC_NETWORK_NAME = 'mainnet'
process.env.NODE_ENV = 'test'

// Setup global test utilities
global.testUtils = {
  mockUser: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  },
  mockCandidate: {
    id: '1',
    name: 'John Doe',
    party: 'Democratic Party',
    votes: 150,
    description: 'Test candidate',
  },
  mockResults: {
    candidates: [
      {
        id: '1',
        name: 'John Doe',
        party: 'Democratic Party',
        votes: 150,
        percentage: 55.6,
      },
      {
        id: '2',
        name: 'Jane Smith',
        party: 'Republican Party',
        votes: 120,
        percentage: 44.4,
      },
    ],
    totalVotes: 270,
    winner: {
      id: '1',
      name: 'John Doe',
      votes: 150,
    },
  },
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

