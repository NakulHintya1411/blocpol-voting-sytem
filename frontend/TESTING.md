# BlocPol Frontend Testing Guide

This document outlines testing strategies and best practices for the BlocPol frontend application.

## Testing Overview

The BlocPol frontend implements comprehensive testing to ensure:

- **Functionality**: All features work as expected
- **Accessibility**: Application is accessible to all users
- **Performance**: Application meets performance requirements
- **Security**: Application is secure from common vulnerabilities
- **Compatibility**: Application works across different browsers and devices

## Testing Strategy

### Testing Pyramid

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test component interactions
3. **End-to-End Tests**: Test complete user workflows
4. **Visual Tests**: Test UI appearance and behavior
5. **Accessibility Tests**: Test accessibility compliance

## Unit Testing

### Component Testing

```javascript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidateCard } from '../components/CandidateCard';

describe('CandidateCard', () => {
  const mockCandidate = {
    id: '1',
    name: 'John Doe',
    party: 'Democratic Party',
    votes: 150
  };

  it('renders candidate information', () => {
    render(<CandidateCard candidate={mockCandidate} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Democratic Party')).toBeInTheDocument();
    expect(screen.getByText('150 votes')).toBeInTheDocument();
  });

  it('calls onVote when vote button is clicked', () => {
    const mockOnVote = jest.fn();
    render(<CandidateCard candidate={mockCandidate} onVote={mockOnVote} />);
    
    fireEvent.click(screen.getByText('Vote'));
    expect(mockOnVote).toHaveBeenCalledWith(mockCandidate.id);
  });
});
```

### Hook Testing

```javascript
// Custom hook test example
import { renderHook, act } from '@testing-library/react';
import { useWallet } from '../contexts/WalletContext';

describe('useWallet', () => {
  it('should initialize with null account', () => {
    const { result } = renderHook(() => useWallet());
    
    expect(result.current.account).toBeNull();
    expect(result.current.isConnected).toBe(false);
  });

  it('should connect wallet successfully', async () => {
    const { result } = renderHook(() => useWallet());
    
    await act(async () => {
      await result.current.connectWallet();
    });
    
    expect(result.current.isConnected).toBe(true);
  });
});
```

### Utility Function Testing

```javascript
// Utility function test example
import { formatAddress, formatNumber, formatPercentage } from '../utils/helpers';

describe('Helper Functions', () => {
  describe('formatAddress', () => {
    it('should format address correctly', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const formatted = formatAddress(address);
      
      expect(formatted).toBe('0x1234...5678');
    });

    it('should handle short addresses', () => {
      const address = '0x1234';
      const formatted = formatAddress(address);
      
      expect(formatted).toBe('0x1234');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(25, 100)).toBe('25.0%');
      expect(formatPercentage(0, 100)).toBe('0%');
    });
  });
});
```

## Integration Testing

### API Integration

```javascript
// API integration test example
import { apiService } from '../services/api';
import { mockCandidates } from '../__mocks__/api';

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should fetch candidates successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCandidates
    });

    const result = await apiService.getCandidates();
    
    expect(result).toEqual(mockCandidates);
    expect(fetch).toHaveBeenCalledWith('/api/candidates');
  });

  it('should handle API errors', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    await expect(apiService.getCandidates()).rejects.toThrow('API Error');
  });
});
```

### Component Integration

```javascript
// Component integration test example
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CandidatesPage } from '../pages/candidates';
import { WalletProvider } from '../contexts/WalletContext';

const renderWithProviders = (component) => {
  return render(
    <WalletProvider>
      {component}
    </WalletProvider>
  );
};

describe('CandidatesPage Integration', () => {
  it('should display candidates after loading', async () => {
    renderWithProviders(<CandidatesPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should handle vote submission', async () => {
    renderWithProviders(<CandidatesPage />);
    
    // Wait for candidates to load
    await waitFor(() => {
      expect(screen.getByText('Vote')).toBeInTheDocument();
    });
    
    // Click vote button
    fireEvent.click(screen.getByText('Vote'));
    
    // Wait for confirmation
    await waitFor(() => {
      expect(screen.getByText('Vote cast successfully!')).toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing

### User Workflow Testing

```javascript
// E2E test example using Playwright
import { test, expect } from '@playwright/test';

test.describe('Voting Workflow', () => {
  test('should complete full voting process', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    
    // Connect wallet
    await page.click('[data-testid="connect-wallet"]');
    
    // Submit registration
    await page.click('[data-testid="register-button"]');
    
    // Wait for redirect to candidates page
    await page.waitForURL('/candidates');
    
    // Select candidate and vote
    await page.click('[data-testid="vote-button-1"]');
    
    // Wait for confirmation page
    await page.waitForURL('/confirmation');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

### Cross-Browser Testing

```javascript
// Cross-browser test example
import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test('should work in Chrome', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('BlocPol');
  });

  test('should work in Firefox', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('BlocPol');
  });

  test('should work in Safari', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('BlocPol');
  });
});
```

## Visual Testing

### Screenshot Testing

```javascript
// Visual regression test example
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('should match homepage design', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('should match candidates page design', async ({ page }) => {
    await page.goto('/candidates');
    await expect(page).toHaveScreenshot('candidates-page.png');
  });

  test('should match mobile design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });
});
```

### Component Visual Testing

```javascript
// Component visual test example
import { render } from '@testing-library/react';
import { CandidateCard } from '../components/CandidateCard';

test('CandidateCard visual appearance', () => {
  const { container } = render(
    <CandidateCard 
      candidate={{
        id: '1',
        name: 'John Doe',
        party: 'Democratic Party',
        votes: 150
      }}
    />
  );
  
  expect(container.firstChild).toMatchSnapshot();
});
```

## Accessibility Testing

### Automated Accessibility Testing

```javascript
// Accessibility test example
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CandidatesPage } from '../pages/candidates';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<CandidatesPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Accessibility Testing

```javascript
// Manual accessibility test example
import { render, screen } from '@testing-library/react';
import { CandidateCard } from '../components/CandidateCard';

test('should be keyboard accessible', () => {
  render(<CandidateCard candidate={mockCandidate} />);
  
  const voteButton = screen.getByRole('button', { name: /vote/i });
  expect(voteButton).toBeInTheDocument();
  
  // Test keyboard navigation
  voteButton.focus();
  expect(voteButton).toHaveFocus();
});
```

## Performance Testing

### Performance Metrics Testing

```javascript
// Performance test example
import { render } from '@testing-library/react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

test('should meet performance requirements', async () => {
  const { container } = render(<CandidatesPage />);
  
  // Measure Core Web Vitals
  const metrics = await new Promise((resolve) => {
    const results = {};
    
    getCLS((metric) => { results.CLS = metric.value; });
    getFID((metric) => { results.FID = metric.value; });
    getFCP((metric) => { results.FCP = metric.value; });
    getLCP((metric) => { results.LCP = metric.value; });
    getTTFB((metric) => { results.TTFB = metric.value; });
    
    setTimeout(() => resolve(results), 1000);
  });
  
  expect(metrics.CLS).toBeLessThan(0.1);
  expect(metrics.FID).toBeLessThan(100);
  expect(metrics.FCP).toBeLessThan(1800);
  expect(metrics.LCP).toBeLessThan(2500);
});
```

### Load Testing

```javascript
// Load test example
import { test, expect } from '@playwright/test';

test.describe('Load Testing', () => {
  test('should handle multiple concurrent users', async ({ page }) => {
    // Simulate multiple users
    const promises = Array.from({ length: 10 }, () => 
      page.goto('/candidates')
    );
    
    await Promise.all(promises);
    
    // Verify page loads correctly
    await expect(page.locator('h1')).toContainText('Election Candidates');
  });
});
```

## Security Testing

### Input Validation Testing

```javascript
// Security test example
import { render, screen, fireEvent } from '@testing-library/react';
import { RegistrationForm } from '../components/RegistrationForm';

test('should prevent XSS attacks', () => {
  render(<RegistrationForm />);
  
  const nameInput = screen.getByLabelText(/name/i);
  const maliciousInput = '<script>alert("XSS")</script>';
  
  fireEvent.change(nameInput, { target: { value: maliciousInput } });
  fireEvent.submit(screen.getByRole('form'));
  
  // Verify script is not executed
  expect(screen.queryByText('XSS')).not.toBeInTheDocument();
});
```

### Authentication Testing

```javascript
// Authentication test example
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletProvider } from '../contexts/WalletContext';

test('should require wallet connection for voting', () => {
  render(
    <WalletProvider>
      <CandidatesPage />
    </WalletProvider>
  );
  
  const voteButton = screen.getByRole('button', { name: /vote/i });
  fireEvent.click(voteButton);
  
  expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx}',
    'pages/**/*.{js,jsx}',
    'utils/**/*.{js,jsx}',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Playwright Configuration

```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
};
```

## Test Data Management

### Mock Data

```javascript
// __mocks__/api.js
export const mockCandidates = [
  {
    id: '1',
    name: 'John Doe',
    party: 'Democratic Party',
    votes: 150
  },
  {
    id: '2',
    name: 'Jane Smith',
    party: 'Republican Party',
    votes: 120
  }
];

export const mockResults = {
  candidates: mockCandidates,
  totalVotes: 270,
  winner: mockCandidates[0]
};
```

### Test Utilities

```javascript
// test-utils.js
import { render } from '@testing-library/react';
import { WalletProvider } from '../contexts/WalletContext';

const renderWithProviders = (ui, options = {}) => {
  const { walletState = {}, ...renderOptions } = options;
  
  const Wrapper = ({ children }) => (
    <WalletProvider value={walletState}>
      {children}
    </WalletProvider>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from '@testing-library/react';
export { renderWithProviders };
```

## Running Tests

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- candidates.test.js

# Run E2E tests
npm run test:e2e

# Run visual tests
npm run test:visual

# Run accessibility tests
npm run test:a11y
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm test
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Run accessibility tests
        run: npm run test:a11y
```

## Best Practices

### General

1. **Write Tests First**: Use TDD approach when possible
2. **Test Behavior, Not Implementation**: Focus on what the component does
3. **Keep Tests Simple**: One test should verify one thing
4. **Use Descriptive Names**: Test names should describe what they test
5. **Maintain Test Data**: Keep test data up to date

### React Specific

1. **Test User Interactions**: Test what users actually do
2. **Mock External Dependencies**: Mock APIs and external services
3. **Test Error States**: Test error handling and edge cases
4. **Use Testing Library**: Prefer Testing Library over Enzyme
5. **Test Accessibility**: Include accessibility in your tests

### Performance

1. **Test Performance**: Include performance tests
2. **Monitor Metrics**: Track performance metrics over time
3. **Test on Real Devices**: Test on actual devices when possible
4. **Optimize Tests**: Keep tests fast and efficient
5. **Parallel Execution**: Run tests in parallel when possible
