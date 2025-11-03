#!/bin/bash

# Enterprise E-Commerce Platform Setup Script
# This script sets up a new project from this template

set -e

echo "🚀 Setting up Enterprise E-Commerce Platform..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${YELLOW}⚠️  Node.js version 18 or higher is required${NC}"
  exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Setup environment files
# Client and server have separate .env files for different deployment environments
if [ ! -f client/.env ]; then
  echo "📝 Creating client/.env file..."
  cp client/.env.example client/.env
  echo -e "${YELLOW}⚠️  Please update client/.env file with your configuration${NC}"
fi

if [ ! -f server/.env ]; then
  echo "📝 Creating server/.env file..."
  cp server/.env.example server/.env
  echo -e "${YELLOW}⚠️  Please update server/.env file with your configuration${NC}"
fi

# Setup git hooks
echo "🔧 Setting up git hooks..."
npx husky install || echo "Husky setup skipped"

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update client/.env and server/.env files with your configuration"
echo "2. Run 'npm run dev' to start development servers"
echo "3. Run 'docker-compose up -d' for Docker deployment"
echo ""
echo "Note: Client and server use separate .env files for independent deployment"
