# BlocPol Frontend Troubleshooting Guide

This guide helps resolve common issues when developing or running the BlocPol frontend.

## Common Issues

### 1. Installation Issues

#### Node.js Version Error
**Problem:** `Node.js version 18+ is required`

**Solution:**
```bash
# Check current version
node -v

# Install Node.js 18+ from https://nodejs.org/
# Or use nvm
nvm install 18
nvm use 18
```

#### Package Installation Fails
**Problem:** `npm install` fails with errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### 2. Development Server Issues

#### Port Already in Use
**Problem:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### Hot Reload Not Working
**Problem:** Changes not reflecting in browser

**Solution:**
```bash
# Restart development server
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev
```

### 3. Build Issues

#### Build Fails
**Problem:** `npm run build` fails

**Solution:**
```bash
# Check for syntax errors
npm run lint

# Fix linting issues
npm run lint:fix

# Clear cache and rebuild
npm run clean
npm run build
```

#### TypeScript Errors
**Problem:** TypeScript compilation errors

**Solution:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix type errors
npm run type-check
```

### 4. Wallet Connection Issues

#### MetaMask Not Detected
**Problem:** "MetaMask is not installed" error

**Solution:**
1. Install MetaMask browser extension
2. Refresh the page
3. Check if MetaMask is enabled
4. Try different browser

#### Wallet Connection Fails
**Problem:** Wallet connection button doesn't work

**Solution:**
1. Check browser console for errors
2. Ensure MetaMask is unlocked
3. Check network connection
4. Try refreshing the page

#### Wrong Network
**Problem:** Connected to wrong Ethereum network

**Solution:**
1. Switch to correct network in MetaMask
2. Check network configuration in `.env.local`
3. Update `NEXT_PUBLIC_NETWORK_ID` if needed

### 5. API Integration Issues

#### API Connection Failed
**Problem:** "Failed to fetch" or network errors

**Solution:**
1. Check if backend is running
2. Verify API URL in `.env.local`
3. Check CORS configuration
4. Test API endpoint directly

#### Authentication Errors
**Problem:** "Invalid signature" or authentication failed

**Solution:**
1. Check wallet connection
2. Verify message signing
3. Check signature format
4. Ensure wallet is unlocked

### 6. Styling Issues

#### TailwindCSS Not Working
**Problem:** Styles not applying

**Solution:**
1. Check TailwindCSS configuration
2. Restart development server
3. Verify class names
4. Check for conflicting styles

#### Dark Mode Not Working
**Problem:** Dark mode toggle not working

**Solution:**
1. Check dark mode implementation
2. Verify CSS classes
3. Check browser support
4. Clear browser cache

### 7. Performance Issues

#### Slow Loading
**Problem:** Page loads slowly

**Solution:**
1. Check network tab for slow requests
2. Optimize images
3. Enable code splitting
4. Check bundle size

#### Memory Leaks
**Problem:** Browser becomes slow over time

**Solution:**
1. Check for event listener cleanup
2. Remove unused components
3. Check for memory leaks in dev tools
4. Optimize re-renders

## Debugging Tools

### Browser Developer Tools

1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Monitor API requests
3. **Elements Tab**: Inspect DOM and styles
4. **Performance Tab**: Analyze performance issues

### React Developer Tools

1. Install React DevTools extension
2. Check component state and props
3. Monitor re-renders
4. Debug hooks

### Next.js Debugging

```bash
# Enable debug mode
DEBUG=* npm run dev

# Check build output
npm run build
npm start
```

## Environment Issues

### Environment Variables Not Loading

**Problem:** Environment variables not available

**Solution:**
1. Check `.env.local` file exists
2. Verify variable names start with `NEXT_PUBLIC_`
3. Restart development server
4. Check file permissions

### Wrong Environment

**Problem:** Using wrong environment configuration

**Solution:**
1. Check `NODE_ENV` variable
2. Verify environment file
3. Update configuration
4. Restart application

## Network Issues

### CORS Errors

**Problem:** Cross-origin request blocked

**Solution:**
1. Check backend CORS configuration
2. Verify allowed origins
3. Check request headers
4. Use proxy if needed

### SSL Certificate Issues

**Problem:** HTTPS certificate errors

**Solution:**
1. Check certificate validity
2. Use HTTP for development
3. Update certificate
4. Check domain configuration

## Browser Compatibility

### Internet Explorer Issues

**Problem:** App doesn't work in IE

**Solution:**
1. Use modern browsers (Chrome, Firefox, Safari, Edge)
2. Check polyfills
3. Update browser
4. Use fallbacks

### Mobile Browser Issues

**Problem:** App doesn't work on mobile

**Solution:**
1. Check responsive design
2. Test on different devices
3. Check touch events
4. Verify viewport settings

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Search existing issues
3. Check browser console
4. Try basic solutions

### When Reporting Issues

Include:
1. Browser and version
2. Node.js version
3. Error messages
4. Steps to reproduce
5. Screenshots if applicable

### Useful Commands

```bash
# Check system info
node -v
npm -v
npm list

# Check project status
npm run lint
npm run build
npm test

# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

## Prevention

### Best Practices

1. Keep dependencies updated
2. Use version control
3. Test regularly
4. Follow coding standards
5. Document changes

### Regular Maintenance

1. Update dependencies monthly
2. Check for security vulnerabilities
3. Review and update documentation
4. Test on different browsers
5. Monitor performance

## Emergency Recovery

### Complete Reset

```bash
# Backup important files
cp .env.local .env.local.backup

# Clean everything
rm -rf node_modules package-lock.json .next out

# Reinstall
npm install

# Restore environment
cp .env.local.backup .env.local

# Start fresh
npm run dev
```

### Rollback to Previous Version

```bash
# Check git history
git log --oneline

# Rollback to previous commit
git reset --hard HEAD~1

# Reinstall dependencies
npm install

# Start development
npm run dev
```
