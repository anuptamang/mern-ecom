# Testing Documentation

Complete testing guide and documentation for the Enterprise E-Commerce Platform.

## 📚 Documentation

- **[Testing Credentials](./CREDENTIALS.md)** - Test user credentials for all roles

## 🧪 Testing Overview

The project uses a comprehensive testing strategy covering unit tests, integration tests, and end-to-end tests.

## 📋 Testing Strategy

### Test Types

1. **Unit Tests**
   - Component testing
   - Function testing
   - Utility function testing
   - Redux action/reducer testing

2. **Integration Tests**
   - API endpoint testing
   - Database interaction testing
   - Service layer testing
   - Authentication flow testing

3. **End-to-End Tests**
   - User flow testing
   - Payment flow testing
   - Order lifecycle testing
   - Multi-role workflow testing

## 🛠️ Testing Tools

### Frontend Testing

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing
- **Redux Testing** - State management testing
- **MSW (Mock Service Worker)** - API mocking

### Backend Testing

- **Jest** - Test runner
- **Supertest** - HTTP assertion library
- **MongoDB Memory Server** - In-memory database for testing

## 📝 Test Credentials

### Test Users

All test users use the password: `password123`

- **Admin**: `admin@example.com`
- **Buyer**: `test@example.com`
- **Seller**: `seller@example.com`
- **Delivery Agency**: `delivery@example.com`
- **Delivery Person 1**: `deliverer1@example.com`
- **Delivery Person 2**: `deliverer2@example.com`
- **Warehouse Operator**: `warehouse@example.com`
- **Support**: `support@example.com`
- **Support User**: `support_user@example.com`
- **Verification Team**: `verification@example.com`
- **Return Inspector**: `inspector@example.com`
- **Return Deliverer 1**: `return_deliverer1@example.com`
- **Return Deliverer 2**: `return_deliverer2@example.com`
- **Finance**: `finance@example.com`

See [Testing Credentials](./CREDENTIALS.md) for complete list.

## 🚀 Running Tests

### Frontend Tests

```bash
# Run all tests
cd client && npm test

# Run with coverage
cd client && npm test -- --coverage

# Run in watch mode
cd client && npm test -- --watch

# Run specific test file
cd client && npm test -- ComponentName.test.tsx
```

### Backend Tests

```bash
# Run all tests
cd server && npm test

# Run with coverage
cd server && npm test -- --coverage

# Run specific test file
cd server && npm test -- controllers/user.test.js
```

### Integration Tests

```bash
# Run integration tests (requires MongoDB)
cd server && npm run test:integration
```

## 📊 Test Coverage

### Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: >70% coverage
- **Critical Paths**: 100% coverage

### Coverage Reports

- Frontend: `client/coverage/`
- Backend: `server/coverage/`

## 🧩 Testing Patterns

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

test('renders component', () => {
  render(<Component />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### API Testing

```javascript
const request = require('supertest');
const app = require('../index');

test('GET /api/products', async () => {
  const response = await request(app)
    .get('/api/products')
    .expect(200);
  
  expect(response.body).toHaveProperty('products');
});
```

### Redux Testing

```typescript
import { renderWithProviders } from 'test-utils';
import { Component } from './Component';

test('handles action', () => {
  const { store } = renderWithProviders(<Component />);
  store.dispatch(someAction());
  expect(store.getState()).toMatchSnapshot();
});
```

## 🔍 Test Data Management

### Fixtures

- **Location**: `client/src/__tests__/fixtures/`
- **Purpose**: Reusable test data
- **Format**: JSON or TypeScript files

### Mocks

- **API Mocks**: MSW handlers
- **Component Mocks**: Jest mocks
- **Service Mocks**: Manual mocks

## 🎯 Test Scenarios

### Authentication

- Login with valid credentials
- Login with invalid credentials
- Registration flow
- Token refresh
- Logout

### Products

- Product listing
- Product details
- Product search
- Product filtering
- Product creation (seller/admin)

### Cart

- Add to cart
- Update cart item
- Remove from cart
- Clear cart
- Cart persistence

### Orders

- Order creation
- Order listing
- Order details
- Order status updates
- Order cancellation

### Payments

- Payment intent creation
- Payment confirmation
- Payment failure handling
- Refund processing

## 🔗 Related Documentation

- [Development Guide](../development/development-index.md) - Development practices
- [CI/CD Guide](../CI-CD/CI-CD-index.md) - Automated testing
- [API Documentation](../API/API-index.md) - API testing
- [Security Guide](../security/security-index.md) - Security testing

## 📝 Best Practices

### Test Organization

- Group related tests together
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent

### Test Data

- Use factories for test data
- Clean up after tests
- Use realistic test data
- Avoid hardcoded values

### Test Maintenance

- Update tests when code changes
- Remove obsolete tests
- Refactor tests regularly
- Keep tests fast and reliable

## 🚨 Common Issues

### Test Failures

1. **Flaky Tests**
   - Add proper wait conditions
   - Use stable selectors
   - Mock external dependencies

2. **Timeout Issues**
   - Increase timeout for slow tests
   - Optimize test setup
   - Use appropriate test types

3. **Database Issues**
   - Use in-memory database for tests
   - Clean up test data
   - Use transactions when possible

## 🔄 Continuous Improvement

- Increase test coverage
- Improve test speed
- Add more integration tests
- Enhance E2E test suite
- Regular test review
