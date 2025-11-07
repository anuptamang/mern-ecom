# Enterprise-Grade Security Implementation

This document describes the comprehensive security implementation for the MERN E-Commerce Platform.

## Overview

The security implementation follows enterprise-grade security principles including:

- **Deny by default** - All endpoints are protected unless explicitly whitelisted
- **Least privilege** - Users only get minimum permissions needed
- **Defense in depth** - Multiple layers of security
- **Zero trust** - Every request is verified

## Security Layers

### 1. Application Token (X-API-Key)

**Purpose**: First layer of security - All API endpoints require a valid application token.

**Implementation**:

- Middleware: `server/middlewares/applicationToken.js`
- Header: `X-API-Key` or `x-api-key`
- Configuration: `APPLICATION_TOKEN` environment variable

**Usage**:

```javascript
// All API requests must include:
headers: {
  'X-API-Key': 'your-application-token'
}
```

**Security Features**:

- Constant-time comparison to prevent timing attacks
- Comprehensive error handling
- Security event logging

### 2. Authentication (JWT)

**Purpose**: Verify user identity using JWT tokens.

**Implementation**:

- Middleware: `server/middlewares/auth.js`
- Header: `Authorization: Bearer <token>`
- Configuration: `JWT_SECRET` environment variable

**Security Features**:

- Token expiration handling
- User existence verification
- Role assignment
- Comprehensive error messages
- Security event logging

### 3. Role-Based Access Control (RBAC)

**Purpose**: Granular permissions based on user roles.

**Implementation**:

- Middleware: `server/middlewares/rbac.js`
- Permissions: `server/config/rolePermissions.js`

**Available Middleware**:

- `requireRole(['seller', 'admin'])` - Require specific role(s)
- `requirePermission('products', 'create')` - Require specific permission
- `requireAdmin` - Require admin role
- `requireSeller` - Require seller role
- `requireBuyer` - Require buyer role

**Role Permissions**:

- **Admin**: Full access to everything (`*: *`)
- **Buyer (user)**: Read products, manage cart/wishlist, create orders, manage returns
- **Seller**: Full product management, read orders, read payouts
- **Delivery Agency**: Manage deliveries, create delivery persons
- **Delivery Person**: Update assigned deliveries
- **Warehouse Operator**: Manage deliveries in facility
- **Support**: Manage returns, create support users
- **Support User**: Manage assigned returns
- **Verification Team**: Manage returns, create inspectors
- **Return Inspector**: Inspect returns
- **Return Deliverer**: Handle return deliveries
- **Finance**: Process refunds, manage payouts

### 4. Security Headers

**Purpose**: Protect against common web vulnerabilities.

**Implementation**:

- Middleware: `server/middlewares/securityHeaders.js`
- Applied globally to all responses

**Headers Set**:

- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Strict-Transport-Security` - HSTS (production only)
- `Content-Security-Policy` - CSP headers
- `Referrer-Policy` - Control referrer information
- `Permissions-Policy` - Feature permissions
- Removes `X-Powered-By` header

### 5. Input Sanitization

**Purpose**: Prevent injection attacks (XSS, SQL injection, command injection).

**Implementation**:

- Middleware: `server/middlewares/inputSanitization.js`
- Applied globally to all requests

**Features**:

- Recursive object sanitization
- XSS prevention (removes `<`, `>`, `javascript:`, event handlers)
- String trimming
- MongoDB ObjectId validation
- Email validation
- URL validation

### 6. API Versioning

**Purpose**: Manage API changes without breaking existing clients.

**Implementation**:

- All routes are versioned: `/api/v1/*`
- Configuration: `API_VERSION` environment variable (default: `v1`)

**Example**:

```
GET /api/v1/products
POST /api/v1/orders
```

### 7. Rate Limiting

**Purpose**: Prevent abuse and DoS attacks.

**Implementation**:

- Middleware: `server/middlewares/rateLimiter.js`
- Applied to all `/api/*` routes
- Uses `ipKeyGenerator` helper from `express-rate-limit` for IPv6 safety

**Configuration**:

- **Production**: 100 requests per 15 minutes
- **Development**: 1000 requests per minute (more lenient for testing)
- **Auth endpoints**: 5 requests per 15 minutes
- **API endpoints**: 60 requests per minute

**Features**:

- ✅ **IPv6 Support** - Uses `ipKeyGenerator` helper to properly handle IPv6 addresses
- ✅ **Load Balancer Support** - Extracts real client IP from `X-Forwarded-For` and `X-Real-IP` headers
- ✅ **Development Mode** - More lenient limits and skips rate limiting for localhost
- ✅ **Redis Support** - Optional Redis-based rate limiting for shared state across instances

**Load Balancer Support**:

The rate limiter automatically extracts the real client IP from load balancer headers:

```javascript
// Extracts IP from X-Forwarded-For or X-Real-IP headers
const clientIp = getClientIp(req);
// Uses ipKeyGenerator helper for IPv6 safety
return ipKeyGenerator(req);
```

**Redis-Based Rate Limiting** (Optional):

For multiple server instances, use Redis to share rate limit state:

```bash
npm install rate-limit-redis ioredis
```

See `LOAD_BALANCING.md` for detailed setup instructions.

## Security Flow

### Request Flow

1. **Security Headers** - Set security headers
2. **Input Sanitization** - Sanitize all input
3. **Rate Limiting** - Check rate limits
4. **Application Token** - Verify X-API-Key header
5. **Authentication** - Verify JWT token (if required)
6. **Authorization** - Check role-based permissions
7. **Controller** - Process request

### Example Request

```javascript
// Request
GET /api/v1/products
Headers:
  X-API-Key: your-application-token
  Authorization: Bearer your-jwt-token

// Flow
1. Security headers applied
2. Input sanitized
3. Rate limit checked
4. Application token verified
5. JWT token verified
6. User role checked
7. Permission checked (products: read)
8. Controller executed
```

## Environment Variables

### Server Environment Variables (`server/.env`)

Required environment variables for the server:

```env
# Application Token (REQUIRED)
# This token is used to verify X-API-Key header from client requests
APPLICATION_TOKEN=your-secure-application-token

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=7d

# API Versioning
API_VERSION=v1

# Security
BCRYPT_ROUNDS=10
```

### Client Environment Variables (`client/.env`)

Required environment variables for the client:

```env
# Application Token (REQUIRED)
# This token must match APPLICATION_TOKEN in server/.env
# React requires REACT_APP_ prefix for environment variables
REACT_APP_APPLICATION_TOKEN=your-secure-application-token

# Backend API URL (REQUIRED)
# Include /api/v1 in the URL for simplicity
REACT_APP_BACKEND_API_URL=http://localhost:3010/api/v1

# Alternative: You can also use REACT_APP_API_KEY
# REACT_APP_API_KEY=your-secure-application-token
```

**Important**: The `REACT_APP_APPLICATION_TOKEN` in `client/.env` must match the `APPLICATION_TOKEN` in `server/.env`. They should be the same value.

### Setup Instructions

1. **Server Setup**:

   ```bash
   cd server
   cp .env.example .env
   # Edit .env and set APPLICATION_TOKEN
   ```

2. **Client Setup**:

   ```bash
   cd client
   cp .env.example .env
   # Edit .env and set:
   # - REACT_APP_APPLICATION_TOKEN (same value as server)
   # - REACT_APP_BACKEND_API_URL=http://localhost:3010/api/v1
   ```

3. **Generate a Secure Token**:

   ```bash
   # Generate a secure random token
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Use the generated token for both `APPLICATION_TOKEN` (server) and `REACT_APP_APPLICATION_TOKEN` (client).

## Route Protection Examples

### Public Endpoint (No Auth Required)

```javascript
router.get("/", getProducts); // No middleware
```

### Authenticated Endpoint

```javascript
router.get("/me", Auth, getMyProducts); // Requires authentication
```

### Role-Based Endpoint

```javascript
router.post("/", Auth, requireSeller, createProduct); // Requires seller role
```

### Permission-Based Endpoint

```javascript
router.post("/", Auth, requirePermission("products", "create"), createProduct);
```

### Admin-Only Endpoint

```javascript
router.get("/list", Auth, requireAdmin, getUsers); // Requires admin role
```

## Security Best Practices

1. **Never trust user input** - Always validate and sanitize
2. **Use HTTPS everywhere** - Enforce TLS in production
3. **Store secrets securely** - Use environment variables, never hardcode
4. **Log security events** - Monitor authentication attempts, permission denials
5. **Regular security audits** - Review permissions, update dependencies
6. **Principle of least privilege** - Users only get minimum permissions needed
7. **Defense in depth** - Multiple layers of security
8. **Zero trust** - Verify every request

## Testing Security

### Test Application Token

```bash
# Without token (should fail)
curl http://localhost:3010/api/v1/products

# With token (should succeed)
curl -H "X-API-Key: your-token" http://localhost:3010/api/v1/products
```

### Test Authentication

```bash
# Without auth (should fail for protected endpoints)
curl -H "X-API-Key: your-token" http://localhost:3010/api/v1/products/me

# With auth (should succeed)
curl -H "X-API-Key: your-token" \
     -H "Authorization: Bearer your-jwt-token" \
     http://localhost:3010/api/v1/products/me
```

### Test RBAC

```bash
# Buyer trying to create product (should fail)
curl -X POST \
     -H "X-API-Key: your-token" \
     -H "Authorization: Bearer buyer-token" \
     http://localhost:3010/api/v1/products

# Seller creating product (should succeed)
curl -X POST \
     -H "X-API-Key: your-token" \
     -H "Authorization: Bearer seller-token" \
     http://localhost:3010/api/v1/products
```

## Monitoring and Logging

All security events are logged:

- Application token verification failures
- Authentication failures
- Authorization failures (permission denials)
- Invalid input attempts
- Rate limit violations

Check logs for security events:

```bash
# Development
tail -f server/logs/app.log

# Production
# Use your logging service (e.g., CloudWatch, Datadog)
```

## Migration Guide

### Updating Existing Routes

**Before**:

```javascript
router.post("/", Auth, blockBuyers, createProduct);
```

**After**:

```javascript
router.post("/", Auth, requirePermission("products", "create"), createProduct);
```

### Updating Client Code

**Before**:

```javascript
fetch("/products");
```

**After**:

```javascript
fetch("/api/v1/products", {
  headers: {
    "X-API-Key": process.env.REACT_APP_API_KEY,
    Authorization: `Bearer ${token}`,
  },
});
```

## Troubleshooting

### "Unauthorized - Application token required"

- Ensure `X-API-Key` header is included
- Verify `APPLICATION_TOKEN` environment variable is set

### "Unauthorized - Invalid application token"

- Verify `APPLICATION_TOKEN` matches the token in the request header

### "Unauthorized - Token expired"

- User needs to log in again
- Check `JWT_EXPIRES_IN` configuration

### "Forbidden - Insufficient permissions"

- User role doesn't have required permission
- Check `rolePermissions.js` for role permissions
- Admin has access to everything

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
