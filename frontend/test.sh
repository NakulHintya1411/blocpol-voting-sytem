#!/bin/bash

# Test script for BlocPol frontend
# This script runs various tests and checks

set -e

echo "🧪 Running BlocPol Frontend Tests..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run linting
echo "🔍 Running ESLint..."
npm run lint

# Run type checking (if TypeScript is configured)
if [ -f "tsconfig.json" ]; then
    echo "🔍 Running TypeScript type checking..."
    npm run type-check
fi

# Run unit tests (if test files exist)
if [ -d "tests" ] || [ -d "__tests__" ] || [ -f "*.test.js" ] || [ -f "*.test.ts" ]; then
    echo "🧪 Running unit tests..."
    npm test
fi

# Run integration tests
echo "🔗 Running integration tests..."
node integration-test.js

# Run helper function tests
echo "🛠️  Running helper function tests..."
node test-setup.js

# Check if all required files exist
echo "📁 Checking required files..."
REQUIRED_FILES=(
    "package.json"
    "next.config.js"
    "tailwind.config.js"
    "postcss.config.js"
    "pages/_app.js"
    "pages/index.js"
    "pages/register.js"
    "pages/candidates.js"
    "pages/confirmation.js"
    "pages/results.js"
    "components/Navbar.js"
    "components/Card.js"
    "components/LoadingSpinner.js"
    "contexts/WalletContext.js"
    "services/api.js"
    "styles/globals.css"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ All required files exist"
else
    echo "❌ Missing required files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

# Check if build works
echo "🏗️  Testing build process..."
npm run build

if [ -d ".next" ]; then
    echo "✅ Build test passed"
else
    echo "❌ Build test failed"
    exit 1
fi

# Clean up build files
echo "🧹 Cleaning up build files..."
npm run clean

echo "🎉 All tests passed!"
echo "   Frontend is ready for development and production"
