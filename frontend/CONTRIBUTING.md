# BlocPol Frontend Contributing Guide

This document outlines how to contribute to the BlocPol frontend project.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- MetaMask browser extension
- VS Code (recommended)

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/blocpol-frontend.git
   cd blocpol-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Contribution Process

### 1. Create a Branch

```bash
# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run type checking
npm run type-check

# Build the project
npm run build
```

### 4. Commit Your Changes

```bash
# Add your changes
git add .

# Commit with descriptive message
git commit -m "feat: add new voting component

- Add CandidateCard component
- Implement vote functionality
- Add loading states
- Include accessibility features"
```

### 5. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Coding Standards

### JavaScript/React

```javascript
// Use functional components with hooks
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  // Event handlers
  const handleClick = () => {
    // Handle click
  };
  
  return (
    <div className="my-component">
      {/* Component content */}
    </div>
  );
};

export default MyComponent;
```

### CSS/Styling

```css
/* Use TailwindCSS utility classes */
.component {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-lg;
}

/* Custom styles when needed */
.custom-style {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### File Naming

- **Components**: PascalCase (`CandidateCard.js`)
- **Utilities**: camelCase (`helpers.js`)
- **Pages**: kebab-case (`register.js`)
- **Styles**: kebab-case (`globals.css`)

## Code Review Process

### Before Submitting

- [ ] Code follows project standards
- [ ] All tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Accessibility considered
- [ ] Performance impact assessed

### Review Checklist

- [ ] Code is readable and maintainable
- [ ] Functions are well-documented
- [ ] Error handling is appropriate
- [ ] Security considerations addressed
- [ ] Performance is acceptable
- [ ] Accessibility requirements met

## Testing Requirements

### Unit Tests

```javascript
// Test component functionality
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidateCard } from '../components/CandidateCard';

describe('CandidateCard', () => {
  it('renders candidate information', () => {
    render(<CandidateCard candidate={mockCandidate} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Integration Tests

```javascript
// Test component interactions
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CandidatesPage } from '../pages/candidates';

describe('CandidatesPage Integration', () => {
  it('should handle vote submission', async () => {
    render(<CandidatesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Vote')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Vote'));
    
    await waitFor(() => {
      expect(screen.getByText('Vote cast successfully!')).toBeInTheDocument();
    });
  });
});
```

### Accessibility Tests

```javascript
// Test accessibility
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CandidateCard } from '../components/CandidateCard';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<CandidateCard candidate={mockCandidate} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Documentation

### Code Documentation

```javascript
/**
 * Formats a wallet address for display
 * @param {string} address - The wallet address to format
 * @param {number} startLength - Number of characters to show at start
 * @param {number} endLength - Number of characters to show at end
 * @returns {string} Formatted address
 */
const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};
```

### README Updates

- Update README.md for new features
- Include setup instructions
- Document configuration options
- Add troubleshooting information

### API Documentation

- Document new API endpoints
- Include request/response examples
- Document error codes
- Update integration examples

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, browser, version information
6. **Screenshots**: If applicable
7. **Console Logs**: Any error messages

### Feature Requests

When requesting features, include:

1. **Description**: Clear description of the feature
2. **Use Case**: Why this feature is needed
3. **Proposed Solution**: How you think it should work
4. **Alternatives**: Other solutions considered
5. **Additional Context**: Any other relevant information

## Pull Request Guidelines

### PR Title

Use conventional commit format:

```
feat: add new voting component
fix: resolve wallet connection issue
docs: update API documentation
style: format code with prettier
refactor: improve component structure
test: add unit tests for voting
chore: update dependencies
```

### PR Description

Include:

1. **Summary**: Brief description of changes
2. **Changes**: Detailed list of changes
3. **Testing**: How you tested the changes
4. **Screenshots**: If UI changes
5. **Breaking Changes**: If any
6. **Related Issues**: Link to related issues

### PR Template

```markdown
## Description
Brief description of changes

## Changes
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility testing completed

## Screenshots
If applicable, add screenshots

## Breaking Changes
If any, describe breaking changes

## Related Issues
Closes #123
```

## Development Workflow

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push branch
git push origin feature/new-feature

# 4. Create pull request
# 5. Address review feedback
# 6. Merge after approval
```

### Branch Naming

- `feature/component-name` - New features
- `fix/issue-description` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/component-name` - Code refactoring
- `test/add-tests` - Test additions
- `chore/update-deps` - Maintenance tasks

### Commit Messages

Follow conventional commit format:

```
type(scope): description

feat(auth): add wallet connection
fix(voting): resolve vote submission issue
docs(api): update endpoint documentation
style(components): format code with prettier
refactor(utils): improve helper functions
test(voting): add unit tests for voting
chore(deps): update dependencies
```

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific files
npx eslint src/components/CandidateCard.js
```

### Formatting

```bash
# Format code with Prettier
npx prettier --write src/

# Check formatting
npx prettier --check src/
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check

# Check specific files
npx tsc --noEmit src/components/CandidateCard.tsx
```

## Performance Considerations

### Bundle Size

- Keep bundle size small
- Use dynamic imports for large components
- Optimize images and assets
- Remove unused dependencies

### Performance Testing

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Run Lighthouse audit
npm run lighthouse
```

### Performance Best Practices

1. **Code Splitting**: Use dynamic imports
2. **Image Optimization**: Use Next.js Image component
3. **Memoization**: Use React.memo, useMemo, useCallback
4. **Lazy Loading**: Load components when needed
5. **Caching**: Implement proper caching strategies

## Security Considerations

### Security Best Practices

1. **Input Validation**: Validate all user inputs
2. **XSS Prevention**: Sanitize user content
3. **CSRF Protection**: Implement CSRF tokens
4. **Secure Headers**: Use security headers
5. **Dependency Security**: Keep dependencies updated

### Security Testing

```bash
# Check for vulnerabilities
npm audit

# Fix security issues
npm audit fix

# Run security scan
npm run security-scan
```

## Accessibility

### Accessibility Requirements

1. **Keyboard Navigation**: All functionality keyboard accessible
2. **Screen Reader Support**: Compatible with screen readers
3. **Color Contrast**: Sufficient color contrast ratios
4. **Focus Management**: Clear focus indicators
5. **Semantic HTML**: Proper semantic structure

### Accessibility Testing

```bash
# Run accessibility tests
npm run test:a11y

# Check with axe
npx axe http://localhost:3000
```

## Release Process

### Versioning

Follow semantic versioning:

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Deployment tested

## Getting Help

### Resources

- [Project Documentation](./README.md)
- [API Documentation](./API.md)
- [Development Guide](./DEVELOPMENT.md)
- [Testing Guide](./TESTING.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

### Community

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Discord**: Real-time chat and support
- **Email**: [Contact information]

### Mentorship

- **Code Review**: Get feedback on your code
- **Pair Programming**: Work with experienced developers
- **Documentation**: Help improve documentation
- **Testing**: Help improve test coverage

## Recognition

### Contributors

Contributors are recognized in:

- **README.md**: Listed as contributors
- **CHANGELOG.md**: Mentioned in release notes
- **GitHub**: Listed in contributors section
- **Documentation**: Credited in relevant sections

### Contribution Types

We welcome contributions in:

- **Code**: Bug fixes, new features, improvements
- **Documentation**: Guides, tutorials, API docs
- **Testing**: Unit tests, integration tests, E2E tests
- **Design**: UI/UX improvements, accessibility
- **Community**: Help others, answer questions

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or inflammatory comments
- Personal attacks or political discussions
- Public or private harassment
- Publishing private information without permission
- Other unprofessional conduct

### Enforcement

Violations will be addressed through:

1. **Warning**: First offense
2. **Temporary Ban**: Repeated offenses
3. **Permanent Ban**: Severe violations

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

## Questions?

If you have questions about contributing, please:

1. Check the documentation
2. Search existing issues
3. Create a new issue
4. Join our community discussions
5. Contact the maintainers

Thank you for contributing to BlocPol! 🚀
