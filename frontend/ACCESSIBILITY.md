# BlocPol Frontend Accessibility Guide

This document outlines accessibility best practices and implementation for the BlocPol frontend application.

## Accessibility Overview

The BlocPol frontend is designed to be accessible to all users, including those with disabilities:

- **Screen Reader Support**: Compatible with screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: High contrast ratios for readability
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper semantic structure

## WCAG 2.1 Compliance

### Level AA Standards

- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Keyboard Access**: All functionality accessible via keyboard
- **Focus Management**: Clear focus indicators
- **Screen Reader**: Compatible with assistive technologies
- **Alternative Text**: Images have descriptive alt text

## Semantic HTML

### Proper HTML Structure

```html
<!-- Use semantic HTML elements -->
<main>
  <header>
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/candidates">Candidates</a></li>
        <li><a href="/results">Results</a></li>
      </ul>
    </nav>
  </header>
  
  <section aria-labelledby="candidates-heading">
    <h1 id="candidates-heading">Election Candidates</h1>
    <!-- Content -->
  </section>
</main>
```

### ARIA Labels and Roles

```html
<!-- Use ARIA attributes for better accessibility -->
<button
  aria-label="Vote for John Doe"
  aria-describedby="candidate-description"
  role="button"
>
  Vote
</button>

<div
  id="candidate-description"
  aria-live="polite"
  aria-atomic="true"
>
  John Doe - Democratic Party
</div>
```

## Keyboard Navigation

### Focus Management

```javascript
// Manage focus programmatically
const focusFirstElement = (container) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
};

// Trap focus in modal
const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });
};
```

### Keyboard Shortcuts

```javascript
// Implement keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          openSearch();
          break;
        case 'r':
          e.preventDefault();
          refreshResults();
          break;
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Screen Reader Support

### Announcements

```javascript
// Announce important updates to screen readers
const announceToScreenReader = (message) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Usage
const handleVoteSuccess = () => {
  announceToScreenReader('Vote cast successfully for John Doe');
};
```

### Screen Reader Only Content

```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

## Color and Contrast

### Color Contrast

```css
/* Ensure sufficient color contrast */
.text-primary {
  color: #1a365d; /* 4.5:1 contrast ratio */
}

.text-secondary {
  color: #4a5568; /* 4.5:1 contrast ratio */
}

.bg-primary {
  background-color: #3182ce; /* 4.5:1 contrast ratio */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn-primary {
    border: 2px solid #000;
  }
}
```

### Color Independence

```javascript
// Don't rely on color alone to convey information
const VoteButton = ({ candidate, hasVoted }) => (
  <button
    className={`vote-button ${hasVoted ? 'voted' : 'not-voted'}`}
    aria-label={hasVoted ? `Voted for ${candidate.name}` : `Vote for ${candidate.name}`}
  >
    <span className="vote-icon" aria-hidden="true">
      {hasVoted ? '✓' : '○'}
    </span>
    <span className="vote-text">
      {hasVoted ? 'Voted' : 'Vote'}
    </span>
  </button>
);
```

## Form Accessibility

### Form Labels and Descriptions

```javascript
// Proper form labeling
const RegistrationForm = () => (
  <form>
    <div className="form-group">
      <label htmlFor="name" className="form-label">
        Full Name
        <span className="required" aria-label="required">*</span>
      </label>
      <input
        type="text"
        id="name"
        name="name"
        className="form-input"
        aria-describedby="name-help"
        required
      />
      <div id="name-help" className="form-help">
        Enter your full legal name as it appears on official documents
      </div>
    </div>
    
    <div className="form-group">
      <label htmlFor="email" className="form-label">
        Email Address
        <span className="required" aria-label="required">*</span>
      </label>
      <input
        type="email"
        id="email"
        name="email"
        className="form-input"
        aria-describedby="email-help"
        required
      />
      <div id="email-help" className="form-help">
        We'll use this to send you voting updates
      </div>
    </div>
  </form>
);
```

### Error Handling

```javascript
// Accessible error handling
const FormField = ({ error, children }) => (
  <div className="form-field">
    {children}
    {error && (
      <div
        className="form-error"
        role="alert"
        aria-live="polite"
      >
        {error}
      </div>
    )}
  </div>
);
```

## Interactive Elements

### Button Accessibility

```javascript
// Accessible button component
const AccessibleButton = ({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  ariaLabel,
  ariaDescribedBy 
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    className={`btn ${loading ? 'loading' : ''}`}
  >
    {loading && <span className="sr-only">Loading...</span>}
    {children}
  </button>
);
```

### Modal Accessibility

```javascript
// Accessible modal component
const AccessibleModal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" ref={modalRef}>
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};
```

## Data Visualization

### Chart Accessibility

```javascript
// Accessible chart component
const AccessibleChart = ({ data, title }) => (
  <div className="chart-container">
    <h3 className="chart-title">{title}</h3>
    <div className="chart" role="img" aria-label={`Chart showing ${title}`}>
      {/* Chart implementation */}
    </div>
    <table className="chart-data" aria-label="Chart data">
      <thead>
        <tr>
          <th>Candidate</th>
          <th>Votes</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{item.name}</td>
            <td>{item.votes}</td>
            <td>{item.percentage}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

## Testing Accessibility

### Automated Testing

```javascript
// Jest accessibility testing
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<CandidatesPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing

```bash
# Install accessibility testing tools
npm install --save-dev @testing-library/jest-axe jest-axe

# Run accessibility tests
npm test -- --testNamePattern="accessibility"
```

### Screen Reader Testing

1. **NVDA** (Windows): Free screen reader
2. **JAWS** (Windows): Commercial screen reader
3. **VoiceOver** (macOS): Built-in screen reader
4. **TalkBack** (Android): Built-in screen reader

## Accessibility Checklist

### Content

- [ ] All images have alt text
- [ ] Headings are properly structured
- [ ] Links have descriptive text
- [ ] Color is not the only way to convey information
- [ ] Text is readable and understandable

### Navigation

- [ ] All functionality is keyboard accessible
- [ ] Focus is visible and logical
- [ ] Skip links are available
- [ ] Navigation is consistent
- [ ] Breadcrumbs are provided

### Forms

- [ ] All form fields have labels
- [ ] Error messages are clear and helpful
- [ ] Required fields are marked
- [ ] Form validation is accessible
- [ ] Help text is provided

### Interactive Elements

- [ ] Buttons have descriptive labels
- [ ] Links have meaningful text
- [ ] Interactive elements are keyboard accessible
- [ ] Focus management is proper
- [ ] ARIA attributes are used correctly

## Accessibility Tools

### Development Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Browser Extensions

- [axe DevTools Extension](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
- [WAVE Extension](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
- [ColorZilla](https://www.colorzilla.com/)

### Screen Readers

- [NVDA](https://www.nvaccess.org/) (Windows)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- [VoiceOver](https://www.apple.com/accessibility/vision/) (macOS)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) (Android)

## Best Practices

### General

1. **Test Early and Often**: Test accessibility throughout development
2. **Use Semantic HTML**: Prefer semantic elements over divs
3. **Provide Alternative Text**: Always include alt text for images
4. **Ensure Keyboard Access**: Test all functionality with keyboard only
5. **Use ARIA Appropriately**: Use ARIA attributes when needed

### React Specific

1. **Use React Aria**: For complex interactive components
2. **Manage Focus**: Handle focus management in modals and dropdowns
3. **Provide Live Regions**: Use aria-live for dynamic content
4. **Test with Screen Readers**: Test with actual screen readers
5. **Follow WCAG Guidelines**: Adhere to WCAG 2.1 AA standards

### Testing

1. **Automated Testing**: Use tools like axe-core
2. **Manual Testing**: Test with keyboard and screen readers
3. **User Testing**: Test with actual users with disabilities
4. **Regular Audits**: Conduct regular accessibility audits
5. **Continuous Improvement**: Continuously improve accessibility

## Resources

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

### Tools

- [axe-core](https://github.com/dequelabs/axe-core)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)
- [Reach UI](https://reach.tech/ui/)
- [Headless UI](https://headlessui.com/)

### Training

- [WebAIM Training](https://webaim.org/training/)
- [A11y Project Resources](https://www.a11yproject.com/resources/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
