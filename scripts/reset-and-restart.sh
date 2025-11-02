#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Reset Database and Restart Dev Server${NC}"
echo ""

# Step 1: Stop dev server
echo -e "${YELLOW}Step 1: Stopping dev server...${NC}"

# Find and kill Node.js processes for client and server
# Kill React dev server (usually runs on port 3000)
REACT_PID=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$REACT_PID" ]; then
  echo -e "  Found React dev server (PID: $REACT_PID), stopping..."
  kill $REACT_PID 2>/dev/null || kill -9 $REACT_PID 2>/dev/null
  sleep 1
fi

# Kill server (usually runs on port 3010)
SERVER_PID=$(lsof -ti:3010 2>/dev/null)
if [ ! -z "$SERVER_PID" ]; then
  echo -e "  Found server (PID: $SERVER_PID), stopping..."
  kill $SERVER_PID 2>/dev/null || kill -9 $SERVER_PID 2>/dev/null
  sleep 1
fi

# Also kill nodemon processes
NODEMON_PIDS=$(pgrep -f nodemon 2>/dev/null)
if [ ! -z "$NODEMON_PIDS" ]; then
  echo -e "  Found nodemon processes, stopping..."
  pkill -f nodemon 2>/dev/null || true
  sleep 1
fi

# Kill concurrently processes
CONCURRENTLY_PIDS=$(pgrep -f concurrently 2>/dev/null)
if [ ! -z "$CONCURRENTLY_PIDS" ]; then
  echo -e "  Found concurrently processes, stopping..."
  pkill -f concurrently 2>/dev/null || true
  sleep 1
fi

# Additional check: kill any remaining node processes in client/server directories
CLIENT_NODE_PIDS=$(pgrep -f "node.*client" 2>/dev/null)
if [ ! -z "$CLIENT_NODE_PIDS" ]; then
  pkill -f "node.*client" 2>/dev/null || true
fi

SERVER_NODE_PIDS=$(pgrep -f "node.*server" 2>/dev/null)
if [ ! -z "$SERVER_NODE_PIDS" ]; then
  pkill -f "node.*server" 2>/dev/null || true
fi

echo -e "${GREEN}✓ Dev server stopped${NC}"
echo ""

# Step 2: Run reset-and-seed script
echo -e "${YELLOW}Step 2: Resetting and seeding database...${NC}"
cd server || exit 1

if [ ! -f "scripts/reset-and-seed.js" ]; then
  echo -e "${RED}✗ Error: reset-and-seed.js not found${NC}"
  exit 1
fi

node scripts/reset-and-seed.js

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Error: Database reset failed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Database reset and seeded successfully${NC}"
echo ""

# Step 3: Go back to root and start dev server
echo -e "${YELLOW}Step 3: Starting dev server...${NC}"
cd .. || exit 1

# Wait a moment to ensure ports are free
sleep 2

# Start dev server in background
npm run dev &
DEV_PID=$!

# Wait a moment to check if it started successfully
sleep 3

if ps -p $DEV_PID > /dev/null; then
  echo -e "${GREEN}✓ Dev server started (PID: $DEV_PID)${NC}"
  echo ""
  echo -e "${GREEN}════════════════════════════════════════${NC}"
  echo -e "${GREEN}✓ All done! Dev server is running.${NC}"
  echo -e "${GREEN}════════════════════════════════════════${NC}"
  echo ""
  echo -e "To stop the dev server, use: ${BLUE}npm run dev:stop${NC} or kill $DEV_PID"
  echo ""
else
  echo -e "${RED}✗ Error: Dev server failed to start${NC}"
  exit 1
fi
