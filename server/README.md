# Server Documentation

Backend server for the Enterprise E-Commerce Platform.

## Structure

```
server/
├── config/          # Configuration management
├── controllers/     # Request handlers
├── models/          # Database models
├── routes/          # API routes
├── middlewares/     # Express middlewares
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/       # Input validation
└── index.js         # Entry point
```

## Configuration

Configuration is managed in `config/index.js`. It reads from environment variables and provides sensible defaults.

### Key Configuration Sections

1. **Server**: Port, environment, API version
2. **Database**: MongoDB connection string and options
3. **JWT**: Token secrets and expiration
4. **CORS**: Allowed origins
5. **Upload**: File size limits and types
6. **Rate Limiting**: Request throttling
7. **Logging**: Log level and format

## Utilities

### Logger

Centralized logging system with different log levels:

```javascript
import { logger } from './utils/index.js';

logger.info('Information message', { meta: 'data' });
logger.error('Error message', { error: err });
logger.warn('Warning message');
logger.debug('Debug message');
```

### Error Handler

Centralized error handling:

```javascript
import { createError, errorHandler } from './utils/errorHandler.js';

// Create error
throw createError('Error message', 400);

// Use in Express app
app.use(errorHandler);
```

### Response Handler

Consistent API responses:

```javascript
import { successResponse, errorResponse, paginatedResponse } from './utils/responseHandler.js';

// Success response
successResponse(res, 200, data, 'Success message');

// Error response
errorResponse(res, 400, 'Error message', errors);

// Paginated response
paginatedResponse(res, 200, data, pagination, 'Success message');
```

### Pagination

Pagination utilities:

```javascript
import { getPaginationParams, createPaginationResponse } from './utils/pagination.js';

// Get pagination params from query
const { page, limit, skip } = getPaginationParams(req.query);

// Create paginated response
const response = createPaginationResponse(data, { page, limit }, total);
```

## Middlewares

### Authentication

```javascript
import Auth from './middlewares/auth.js';

router.get('/protected', Auth, handler);
```

### Admin Check

```javascript
import checkAdmin from './middlewares/checkAdmin.js';

router.post('/admin', Auth, checkAdmin, handler);
```

### Rate Limiting

```javascript
import { defaultRateLimiter, authRateLimiter } from './middlewares/rateLimiter.js';

// Default rate limiter
app.use('/api/', defaultRateLimiter);

// Strict rate limiter for auth
router.post('/login', authRateLimiter, handler);
```

### Validation

```javascript
import { validate } from './middlewares/validation.js';
import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

router.post('/register', validate(schema), handler);
```

## API Routes

All routes are organized by resource in the `routes/` directory.

### Available Routes

- `/products` - Product management
- `/user` - User management
- `/carts` - Shopping cart
- `/checkout` - Checkout process
- `/orders` - Order management
- `/delivery` - Delivery tracking
- `/returns` - Return management
- `/banners` - Banner management
- `/health` - Health check

## Health Check

Health check endpoint provides system status:

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "database": {
      "status": "connected",
      "readyState": 1
    },
    "memory": {
      "used": 150,
      "total": 512
    }
  }
}
```

## Development

### Start Development Server

```bash
npm run dev
```

### Start Production Server

```bash
npm start
```

### Seed Database

```bash
npm run seed
```

### Reset and Seed

```bash
npm run reset-and-seed
```

## Testing

```bash
npm test
```

## Environment Variables

Required environment variables (see `.env.example`):

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origins

## Dependencies

Key dependencies:

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT handling
- `bcryptjs` - Password hashing
- `express-rate-limit` - Rate limiting
- `socket.io` - WebSocket support
- `stripe` - Payment processing

## Production Considerations

1. **Environment Variables**: Set all required variables
2. **Database**: Use connection pooling
3. **Logging**: Use structured logging
4. **Error Handling**: Proper error responses
5. **Rate Limiting**: Enable rate limiting
6. **Security**: Enable HTTPS, security headers
7. **Monitoring**: Set up monitoring and alerts
