# Quick Start Guide

## Reset Database & Restart Dev Server

### Option 1: NPM Script (Recommended - One Command)

```bash
npm run reset-and-restart
```

This single command will:

1. ✅ Stop the dev server (client on port 3000, server on port 3010)
2. ✅ Reset the database and seed with fresh data
3. ✅ Restart the dev server automatically

### Option 2: VS Code Task (Click to Run)

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Tasks: Run Task"
3. Select "Reset Database & Restart Dev Server"

Or:

- Go to Terminal → Run Task → "Reset Database & Restart Dev Server"

### Option 3: VS Code Launch Configuration

1. Go to Run and Debug (Cmd+Shift+D / Ctrl+Shift+D)
2. Select "Reset & Restart Dev Server" from dropdown
3. Click the green play button

### Option 4: Shell Script (Direct)

```bash
./scripts/reset-and-restart.sh
```

### Option 5: Windows Batch Script

```cmd
scripts\reset-and-restart.bat
```

## Additional Useful Commands

### Stop Dev Server Only

```bash
npm run dev:stop
```

### Start Dev Server Only

```bash
npm run dev
```

### Reset Database Only (without restarting)

```bash
cd server && npm run reset && cd ..
```

## Test Credentials (After Reset)

After running reset-and-restart, use these credentials to login:

- **Admin**: `admin@example.com` / `password123`
- **Buyer**: `buyer@example.com` / `password123`
- **Seller**: `seller@example.com` / `password123`
- **Delivery Agency**: `delivery@example.com` / `password123`
- **Delivery Person 1 (Warehouse)**: `deliverer1@example.com` / `password123`
- **Delivery Person 2 (Customer)**: `deliverer2@example.com` / `password123`
- **Warehouse Operator**: `warehouse@example.com` / `password123`
- **Support**: `support@example.com` / `password123`
