# BlocPol Frontend Development Guide

This guide covers development setup, coding standards, and best practices for the BlocPol frontend.

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- MetaMask browser extension
- VS Code (recommended)

### Quick Start

1. **Clone and install:**
```bash
git clone <repository-url>
cd frontend
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start development:**
```bash
npm run dev
# or
./start.sh
```

4. **Open in browser:**
```
http://localhost:3000
```

## Project Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── Card.js         # Card component with variants
│   ├── LoadingSpinner.js
│   ├── Navbar.js       # Navigation component
│   ├── ErrorBoundary.js
│   └── PageLoader.js
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
├── utils/              # Utility functions
│   ├── constants.js   # App constants
│   └── helpers.js     # Helper functions
└── public/            # Static assets
```

## Coding Standards

### JavaScript/React

- Use functional components with hooks
- Prefer `const` over `let` and `var`
- Use arrow functions for event handlers
- Destructure props and state
- Use meaningful variable names
- Add JSDoc comments for complex functions

### CSS/Styling

- Use TailwindCSS utility classes
- Follow mobile-first responsive design
- Use consistent spacing and typography
- Implement dark mode support
- Use CSS custom properties for theming

### File Naming

- Use PascalCase for components: `Navbar.js`
- Use camelCase for utilities: `helpers.js`
- Use kebab-case for pages: `register.js`
- Use descriptive names: `LoadingSpinner.js`

## Component Guidelines

### Component Structure

```javascript
import React from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2, ...props }) => {
  // Hooks
  const [state, setState] = useState(initialValue);
  
  // Event handlers
  const handleClick = () => {
    // Handle click
  };
  
  // Render
  return (
    <div className="component-class">
      {/* Component content */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

export default ComponentName;
```

### Styling Guidelines

- Use TailwindCSS classes
- Create reusable component variants
- Use consistent spacing scale
- Implement hover and focus states
- Add smooth transitions

### State Management

- Use React hooks for local state
- Use Context API for global state
- Keep state as close to components as possible
- Use custom hooks for complex logic

## API Integration

### Service Layer

```javascript
// services/api.js
export const apiService = {
  async getCandidates() {
    try {
      const response = await api.get('/candidates');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'API Error');
    }
  }
};
```

### Error Handling

- Use try-catch blocks for async operations
- Display user-friendly error messages
- Log errors for debugging
- Implement retry logic for failed requests

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- --testNamePattern="ComponentName"

# Run tests in watch mode
npm test -- --watch
```

### Test Structure

```javascript
import { render, screen } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Performance Optimization

### Code Splitting

- Use dynamic imports for large components
- Implement lazy loading for routes
- Optimize bundle size

### Image Optimization

- Use Next.js Image component
- Implement responsive images
- Add proper alt text

### Caching

- Use React.memo for expensive components
- Implement proper dependency arrays
- Use useMemo and useCallback appropriately

## Debugging

### Development Tools

- React Developer Tools
- Redux DevTools (if using Redux)
- Network tab for API calls
- Console for logging

### Common Issues

1. **Hydration mismatch**: Check server/client rendering differences
2. **Memory leaks**: Clean up event listeners and timers
3. **Performance issues**: Use React DevTools Profiler
4. **API errors**: Check network requests and error handling

## Git Workflow

### Branch Naming

- `feature/component-name`
- `fix/issue-description`
- `refactor/component-name`
- `docs/update-readme`

### Commit Messages

- Use conventional commits
- Be descriptive and concise
- Reference issues when applicable

### Pull Request Process

1. Create feature branch
2. Make changes with tests
3. Run linting and tests
4. Create pull request
5. Request review
6. Merge after approval

## Deployment

### Environment Variables

- Never commit `.env.local`
- Use different configs for different environments
- Document all required variables

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Problems

1. **Module not found**: Check import paths and dependencies
2. **Build errors**: Check for syntax errors and missing dependencies
3. **Runtime errors**: Check browser console and network tab
4. **Styling issues**: Check TailwindCSS configuration

### Getting Help

1. Check the documentation
2. Search existing issues
3. Ask in team chat
4. Create a new issue

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
