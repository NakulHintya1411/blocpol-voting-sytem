#!/bin/bash

# Build script for BlocPol frontend
# This script handles the production build process

set -e

echo "🏗️  Building BlocPol Frontend..."

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

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from .env.example"
    else
        echo "❌ .env.example not found. Please create .env.local manually."
        exit 1
    fi
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
npm run clean

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the application
echo "🏗️  Building application..."
npm run build

# Check if build was successful
if [ -d ".next" ]; then
    echo "✅ Build completed successfully!"
    echo "   Build output: .next/"
    echo "   Static export: out/"
else
    echo "❌ Build failed!"
    exit 1
fi

# Optional: Export static files
read -p "Do you want to export static files? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Exporting static files..."
    npm run export
    
    if [ -d "out" ]; then
        echo "✅ Static export completed successfully!"
        echo "   Static files: out/"
    else
        echo "❌ Static export failed!"
        exit 1
    fi
fi

echo "🎉 Build process completed!"
echo "   To start the production server, run: npm start"
echo "   To serve static files, use any static file server on the 'out' directory"
