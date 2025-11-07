# Development Workflow - Daily Development Commands

Common development commands and workflows for daily development tasks.

## Purpose
Quick reference for common development tasks and commands.

## Server Management

### Start Development Servers

```bash
# Start both client and server
npm run dev

# Or separately:
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm start
```

### Stop Development Servers

```bash
# Stop all servers
npm run dev:stop

# Or manually kill processes:
lsof -ti:3000 | xargs kill  # Client
lsof -ti:3010 | xargs kill  # Server
```

### Restart Servers

```bash
# Stop and start
npm run dev:stop
npm run dev
```

## Code Quality

### Linting

```bash
# Lint all code
npm run lint

# Lint with auto-fix
npm run lint:fix

# Lint client only
cd client && npm run lint

# Lint server only
cd server && npm run lint
```

### Type Checking

```bash
# Type check client (TypeScript)
cd client && npm run type-check

# Or with watch mode
cd client && npm run type-check:watch
```

### Format Code

```bash
# Format all code
npm run format

# Format client only
cd client && npm run format

# Format server only
cd server && npm run format
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run client tests
cd client && npm test

# Run server tests
cd server && npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Database Operations

### Reset Database

```bash
# Reset and restart (recommended)
npm run reset-and-restart

# Reset only
cd server && npm run reset-db
```

### Seed Database

```bash
cd server && npm run seed
```

## Monitoring

### Start Monitoring

```bash
# Start Prometheus and Grafana
npm run monitoring

# Access:
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001
# - Metrics: http://localhost:3010/metrics
```

### Generate Sample Metrics

```bash
# Generate API traffic for metrics
npm run generate-metrics
```

## API Documentation

### Access Swagger UI

```bash
# Open in browser
http://localhost:3010/api-docs

# Export OpenAPI spec
curl http://localhost:3010/api-docs/swagger.json > swagger.json
```

## Git Workflow

### Create Feature Branch

```bash
# Create and checkout feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b bugfix/issue-description
```

### Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
```

### Push Changes

```bash
# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Debugging

### Client Debugging

```bash
# Start with React DevTools
cd client && npm start

# Use browser DevTools
# - React DevTools extension
# - Redux DevTools extension
# - Network tab for API calls
```

### Server Debugging

```bash
# Start with Node.js debugger
cd server && node --inspect index.js

# Or with nodemon
cd server && nodemon --inspect index.js

# Connect Chrome DevTools:
# chrome://inspect
```

### API Testing

```bash
# Test endpoint
curl http://localhost:3010/api/v1/health

# Test with authentication
curl -H "X-API-Key: your_token" \
     -H "Authorization: Bearer jwt_token" \
     http://localhost:3010/api/v1/products
```

## Environment Variables

### Check Environment Variables

```bash
# Client
cd client && cat .env

# Server
cd server && cat .env
```

### Update Environment Variables

```bash
# Edit client .env
cd client && nano .env

# Edit server .env
cd server && nano .env

# Restart servers after changes
npm run dev:stop && npm run dev
```

## Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -ti:3000  # Client
lsof -ti:3010  # Server

# Kill process
lsof -ti:3000 | xargs kill
lsof -ti:3010 | xargs kill
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Client
cd client && rm -rf node_modules package-lock.json && npm install

# Server
cd server && rm -rf node_modules package-lock.json && npm install
```

### Build Errors

```bash
# Clear cache and rebuild
cd client && rm -rf .next build && npm run build

# Check for TypeScript errors
cd client && npm run type-check
```

## Quick Reference

| Task | Command |
|------|---------|
| Start servers | `npm run dev` |
| Stop servers | `npm run dev:stop` |
| Reset database | `npm run reset-and-restart` |
| Lint code | `npm run lint` |
| Run tests | `npm test` |
| Start monitoring | `npm run monitoring` |
| View API docs | `http://localhost:3010/api-docs` |
| View metrics | `http://localhost:3010/metrics` |

## Documentation
See `.cursor/rules` for detailed coding guidelines and best practices.
