# BlocPol Frontend Deployment Guide

This guide covers different deployment options for the BlocPol frontend.

## Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Domain name (optional)

## Environment Setup

1. Create environment file:
```bash
cp .env.example .env.local
```

2. Update environment variables:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_NETWORK_ID=1
NEXT_PUBLIC_NETWORK_NAME=mainnet
```

## Deployment Options

### 1. Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### 2. Netlify

1. Build the project:
```bash
npm run build
npm run export
```

2. Deploy the `out` folder to Netlify

3. Set environment variables in Netlify dashboard

### 3. AWS S3 + CloudFront

1. Build the project:
```bash
npm run build
npm run export
```

2. Upload `out` folder to S3 bucket

3. Configure CloudFront distribution

4. Set up custom domain

### 4. Docker

1. Create Dockerfile:
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

2. Build and run:
```bash
docker build -t blocpol-frontend .
docker run -p 3000:3000 blocpol-frontend
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_NETWORK_ID` | Ethereum network ID | Yes |
| `NEXT_PUBLIC_NETWORK_NAME` | Network name | Yes |

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Export static files
npm run export

# Lint and fix
npm run lint:fix

# Clean build files
npm run clean
```

## Performance Optimization

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Automatic with Next.js
3. **Caching**: Configure appropriate cache headers
4. **CDN**: Use CloudFront or similar for static assets

## Security Considerations

1. **Environment Variables**: Never commit `.env.local`
2. **API Keys**: Use environment variables for sensitive data
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure CORS properly for API calls

## Monitoring

1. **Error Tracking**: Consider Sentry or similar
2. **Analytics**: Google Analytics or similar
3. **Performance**: Web Vitals monitoring
4. **Uptime**: Uptime monitoring service

## Troubleshooting

### Common Issues

1. **Build Errors**: Check Node.js version and dependencies
2. **API Connection**: Verify API URL and CORS settings
3. **Wallet Connection**: Ensure MetaMask is installed
4. **Environment Variables**: Check if all required variables are set

### Debug Mode

Enable debug mode by setting:
```env
NODE_ENV=development
```

## Support

For deployment issues, check:
1. Next.js documentation
2. Deployment platform documentation
3. Project README
4. GitHub issues
