#!/bin/bash

# Start script for BlocPol frontend
# This script handles environment setup and starts the development server

set -e

echo "🚀 Starting BlocPol Frontend..."

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

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running"
else
    echo "⚠️  Backend is not running. Please start the backend first."
    echo "   You can start it with: npm run dev (in the backend directory)"
fi

# Start the development server
echo "🌐 Starting development server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop the server"
echo ""

npm run dev
