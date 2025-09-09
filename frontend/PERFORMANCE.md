# BlocPol Frontend Performance Guide

This document outlines performance optimization strategies and best practices for the BlocPol frontend application.

## Performance Overview

The BlocPol frontend is optimized for:
- **Fast Loading**: Quick initial page load times
- **Smooth Interactions**: Responsive user interface
- **Efficient Rendering**: Optimized React components
- **Minimal Bundle Size**: Small JavaScript bundles
- **Mobile Performance**: Optimized for mobile devices

## Performance Metrics

### Core Web Vitals

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Additional Metrics

- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.8s
- **Speed Index**: < 3.4s

## Bundle Optimization

### Code Splitting

```javascript
// Dynamic imports for code splitting
const LazyComponent = dynamic(() => import('./LazyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// Route-based code splitting
const CandidatesPage = dynamic(() => import('./pages/candidates'), {
  loading: () => <PageLoader message="Loading candidates..." />
});
```

### Tree Shaking

```javascript
// Import only what you need
import { formatAddress } from './utils/helpers';
// Instead of: import * as helpers from './utils/helpers';

// Use named exports
export { formatAddress, formatNumber };
// Instead of: export default { formatAddress, formatNumber };
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Check for duplicate dependencies
npx duplicate-package-checker
```

## Image Optimization

### Next.js Image Component

```javascript
import Image from 'next/image';

// Optimized image loading
<Image
  src="/candidate-photo.jpg"
  alt="Candidate photo"
  width={200}
  height={200}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Image Best Practices

- **WebP Format**: Use WebP for better compression
- **Responsive Images**: Different sizes for different devices
- **Lazy Loading**: Load images only when needed
- **Placeholder**: Show placeholder while loading

## Component Optimization

### React.memo

```javascript
import React, { memo } from 'react';

const CandidateCard = memo(({ candidate, onVote }) => {
  return (
    <div className="candidate-card">
      {/* Component content */}
    </div>
  );
});

export default CandidateCard;
```

### useMemo and useCallback

```javascript
import React, { useMemo, useCallback } from 'react';

const ResultsPage = ({ candidates }) => {
  // Memoize expensive calculations
  const totalVotes = useMemo(() => {
    return candidates.reduce((total, candidate) => total + candidate.votes, 0);
  }, [candidates]);

  // Memoize event handlers
  const handleRefresh = useCallback(() => {
    fetchResults();
  }, []);

  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

### Virtual Scrolling

```javascript
// For large lists of candidates
import { FixedSizeList as List } from 'react-window';

const CandidateList = ({ candidates }) => (
  <List
    height={600}
    itemCount={candidates.length}
    itemSize={200}
    itemData={candidates}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <CandidateCard candidate={data[index]} />
      </div>
    )}
  </List>
);
```

## State Management Optimization

### Context Optimization

```javascript
// Split contexts to avoid unnecessary re-renders
const WalletContext = createContext();
const VotingContext = createContext();

// Use separate contexts for different concerns
const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const value = useMemo(() => ({
    account,
    isConnected,
    connectWallet: () => {},
    disconnectWallet: () => {}
  }), [account, isConnected]);
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
```

### State Updates

```javascript
// Batch state updates
const [state, setState] = useState({
  loading: false,
  error: null,
  data: null
});

// Update multiple state properties at once
setState(prevState => ({
  ...prevState,
  loading: true,
  error: null
}));
```

## API Optimization

### Request Caching

```javascript
// Cache API responses
const useCachedData = (key, fetcher, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
    }
    
    fetcher().then(result => {
      setData(result);
      localStorage.setItem(key, JSON.stringify(result));
      setLoading(false);
    });
  }, deps);
  
  return { data, loading };
};
```

### Request Debouncing

```javascript
import { debounce } from './utils/helpers';

// Debounce search requests
const debouncedSearch = debounce((query) => {
  searchCandidates(query);
}, 300);

const handleSearch = (e) => {
  debouncedSearch(e.target.value);
};
```

### Request Cancellation

```javascript
// Cancel requests when component unmounts
useEffect(() => {
  const controller = new AbortController();
  
  fetchCandidates({ signal: controller.signal });
  
  return () => controller.abort();
}, []);
```

## CSS Optimization

### TailwindCSS Optimization

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // Purge unused styles
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}']
  }
};
```

### Critical CSS

```javascript
// Inline critical CSS
const criticalCSS = `
  .btn-primary { /* critical styles */ }
  .card { /* critical styles */ }
`;

// Load non-critical CSS asynchronously
<link
  rel="preload"
  href="/styles/non-critical.css"
  as="style"
  onLoad="this.onload=null;this.rel='stylesheet'"
/>
```

## Network Optimization

### Preloading

```javascript
// Preload important resources
<link rel="preload" href="/api/candidates" as="fetch" />
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
```

### Service Worker

```javascript
// sw.js
const CACHE_NAME = 'blocpol-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

### CDN Usage

```javascript
// Use CDN for static assets
const CDN_URL = 'https://cdn.blocpol.com';

// Load images from CDN
<Image
  src={`${CDN_URL}/images/candidate-photo.jpg`}
  alt="Candidate photo"
  width={200}
  height={200}
/>
```

## Mobile Performance

### Touch Optimization

```css
/* Optimize touch interactions */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}

/* Prevent zoom on input focus */
input, select, textarea {
  font-size: 16px;
}
```

### Viewport Optimization

```html
<!-- Optimize viewport for mobile -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

### Mobile-Specific Optimizations

```javascript
// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Use different strategies for mobile
const useMobileOptimizations = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);
  
  return isMobile;
};
```

## Performance Monitoring

### Web Vitals Monitoring

```javascript
// Monitor Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Performance API

```javascript
// Measure performance
const measurePerformance = (name, fn) => {
  performance.mark(`${name}-start`);
  fn();
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);
};

// Usage
measurePerformance('candidate-render', () => {
  renderCandidates(candidates);
});
```

### Error Tracking

```javascript
// Track performance errors
window.addEventListener('error', (event) => {
  // Send error to monitoring service
  console.error('Performance error:', event.error);
});
```

## Performance Testing

### Lighthouse Testing

```bash
# Run Lighthouse audit
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html

# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

### Performance Testing Tools

```bash
# WebPageTest
# https://www.webpagetest.org/

# GTmetrix
# https://gtmetrix.com/

# PageSpeed Insights
# https://pagespeed.web.dev/
```

## Performance Budget

### Bundle Size Limits

```javascript
// next.config.js
module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 244000, // 244KB
        },
      };
    }
    return config;
  },
};
```

### Performance Budget Rules

- **JavaScript Bundle**: < 244KB
- **CSS Bundle**: < 50KB
- **Images**: < 100KB each
- **Total Page Weight**: < 1MB
- **Time to Interactive**: < 3.8s

## Performance Checklist

### Development

- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Components memoized
- [ ] State updates batched
- [ ] API requests cached
- [ ] CSS purged

### Build

- [ ] Bundle size within limits
- [ ] Tree shaking enabled
- [ ] Minification enabled
- [ ] Gzip compression enabled
- [ ] Critical CSS inlined

### Runtime

- [ ] Core Web Vitals monitored
- [ ] Performance errors tracked
- [ ] Mobile performance optimized
- [ ] Network requests optimized
- [ ] Caching strategy implemented

## Performance Tools

### Development Tools

- [React DevTools Profiler](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)
- [Chrome DevTools Performance](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

### Production Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

### Monitoring Tools

- [Google Analytics](https://analytics.google.com/)
- [Sentry Performance](https://sentry.io/for/performance/)
- [New Relic](https://newrelic.com/)
- [DataDog](https://www.datadoghq.com/)

## Best Practices

### General

1. **Measure First**: Always measure before optimizing
2. **Optimize Critical Path**: Focus on critical rendering path
3. **Progressive Enhancement**: Build for mobile first
4. **Monitor Continuously**: Set up performance monitoring
5. **Test Regularly**: Test performance regularly

### React Specific

1. **Use React.memo**: For expensive components
2. **Optimize Re-renders**: Minimize unnecessary re-renders
3. **Lazy Load**: Load components when needed
4. **Code Split**: Split code by routes and features
5. **Optimize State**: Keep state as local as possible

### Network Specific

1. **Minimize Requests**: Reduce number of HTTP requests
2. **Compress Assets**: Use gzip/brotli compression
3. **Cache Strategically**: Implement proper caching
4. **Use CDN**: Serve static assets from CDN
5. **Preload Resources**: Preload critical resources
