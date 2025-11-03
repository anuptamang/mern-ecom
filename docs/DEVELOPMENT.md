# Development Guide

Complete guide for developers working on the Enterprise E-Commerce Platform.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 7.0
- npm >= 9.0.0
- Git

### Setup

```bash
# Clone repository
git clone <repository-url>
cd ecommerce

# Run setup script
./scripts/setup.sh

# Or manually:
npm install
cd client && npm install
cd ../server && npm install
```

### Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

### Start Development Servers

```bash
# From root - runs both client and server
npm run dev

# Or separately:
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm start
```

## Project Structure

### Frontend (Client)

```
client/src/
├── api/              # API client configuration
├── components/       # Reusable UI components
├── features/         # Feature modules
├── hooks/            # Custom React hooks
├── layouts/          # Layout components
├── pages/            # Page components
├── redux/            # Redux store and slices
├── routes/           # Route configuration
├── services/         # API services
├── types/            # TypeScript types
├── utils/            # Utility functions
├── constants/        # Constants
└── configs/          # Configuration
```

### Backend (Server)

```
server/
├── controllers/      # Request handlers
├── models/           # Database models
├── routes/           # API routes
├── middlewares/      # Express middlewares
├── services/         # Business logic
├── utils/            # Utility functions
├── validators/       # Input validation
└── config/           # Configuration
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for frontend
- Use ES6+ features
- Follow ESLint rules
- Use Prettier for formatting

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: Match component name
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase with `I` prefix (`IUser`)

### Code Organization

1. **Imports Order**:
   - React and third-party libraries
   - Internal components
   - Utilities and hooks
   - Types
   - Styles

2. **Component Structure**:
   ```typescript
   // 1. Imports
   import React from 'react';
   
   // 2. Types
   interface Props { ... }
   
   // 3. Component
   export const Component: React.FC<Props> = () => {
     // Hooks
     // State
     // Effects
     // Handlers
     // Render
   };
   ```

## Development Workflow

### Branch Strategy

- `master` - Production code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve cart calculation bug
docs: update API documentation
refactor: reorganize utility functions
test: add unit tests for user service
chore: update dependencies
```

### Pull Requests

1. Create feature branch
2. Make changes with descriptive commits
3. Run tests and linting
4. Create PR with description
5. Request review
6. Address feedback
7. Merge after approval

## Testing

### Running Tests

```bash
# All tests
npm test

# Frontend tests
cd client && npm test

# Backend tests
cd server && npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Writing Tests

- Unit tests for utilities
- Integration tests for API
- Component tests for UI
- E2E tests for critical flows

## Debugging

### Frontend

- React DevTools
- Redux DevTools
- Browser DevTools
- Console logging (remove in production)

### Backend

- Node.js debugger
- Console logging with logger utility
- Postman/Insomnia for API testing
- MongoDB Compass for database

### Common Issues

1. **Port already in use**
   ```bash
   lsof -i :3010
   kill -9 <PID>
   ```

2. **Module not found**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Type errors**
   ```bash
   cd client && npm run type-check
   ```

## Performance

### Frontend Optimization

- Code splitting with React.lazy
- Image optimization
- Memoization (useMemo, useCallback)
- Bundle analysis

### Backend Optimization

- Database indexing
- Query optimization
- Caching strategies
- Connection pooling

## Best Practices

1. **Code Quality**
   - Write clean, readable code
   - Add comments for complex logic
   - Follow SOLID principles
   - Keep functions small

2. **Error Handling**
   - Always handle errors
   - Provide meaningful messages
   - Log errors appropriately
   - Fail gracefully

3. **Security**
   - Never commit secrets
   - Validate all inputs
   - Use parameterized queries
   - Keep dependencies updated

4. **Performance**
   - Optimize images
   - Minimize bundle size
   - Use lazy loading
   - Cache when appropriate

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Documentation](https://docs.mongodb.com)
