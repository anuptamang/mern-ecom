# Setup Security - Application Token and RBAC Workflow

Complete setup workflow for enterprise-grade security features.

## Purpose
Configure application tokens, JWT authentication, and Role-Based Access Control (RBAC) for secure API access.

## Steps

### 1. Generate Application Token

Generate a secure random token for application authentication:

```bash
# Generate random token (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Or use online tool: https://www.random.org/strings/

### 2. Configure Application Token

**Server Configuration** (`server/.env`):
```env
APPLICATION_TOKEN=your_generated_token_here
```

**Client Configuration** (`client/.env`):
```env
REACT_APP_APPLICATION_TOKEN=your_generated_token_here
```

**Important**: Both must use the same token!

### 3. Configure JWT Secret

Generate a secure JWT secret:

```bash
# Generate random JWT secret (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**Server Configuration** (`server/.env`):
```env
JWT_SECRET=your_generated_jwt_secret_here
```

### 4. Configure Backend URL

**Client Configuration** (`client/.env`):
```env
REACT_APP_BACKEND_API_URL=http://localhost:3010/api/v1
```

For production:
```env
REACT_APP_BACKEND_API_URL=https://api.yourdomain.com/api/v1
```

### 5. Verify Security Configuration

1. **Check Application Token Middleware**
   - All API endpoints should require `X-API-Key` header
   - Verify in `server/middlewares/verifyApplicationToken.js`

2. **Check JWT Authentication**
   - Protected endpoints should use `Auth` middleware
   - Verify in `server/middlewares/auth.js`

3. **Check RBAC Configuration**
   - Review role permissions in `server/config/rolePermissions.js`
   - Verify protected routes use `requirePermission` middleware

### 6. Test Security Setup

```bash
# Test without token (should fail)
curl http://localhost:3010/api/v1/products

# Test with token (should succeed)
curl -H "X-API-Key: your_application_token" http://localhost:3010/api/v1/products

# Test with authentication (should succeed)
curl -H "X-API-Key: your_application_token" \
     -H "Authorization: Bearer your_jwt_token" \
     http://localhost:3010/api/v1/products
```

### 7. Restart Servers

```bash
# Stop servers
npm run dev:stop

# Start servers
npm run dev
```

## Security Checklist

- [ ] Application token is configured in both server and client
- [ ] JWT secret is set and secure
- [ ] All protected endpoints use `Auth` middleware
- [ ] All protected endpoints use `requirePermission` middleware
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Security headers are enabled
- [ ] Input validation is enabled
- [ ] No sensitive data in logs

## Role Permissions

Review and customize role permissions in `server/config/rolePermissions.js`:

- **Admin**: All permissions
- **Seller**: Products (create, read, update), Orders (read)
- **Buyer**: Products (read), Orders (create, read, update), Cart (all)
- **Delivery**: Deliveries (read, update)
- **Support**: Orders (read, update), Users (read)
- **Finance**: Orders (read), Payouts (all)

## Production Security

For production, ensure:

1. **Strong Secrets**: Use long, random secrets (32+ characters)
2. **HTTPS Only**: Enforce HTTPS in production
3. **Token Rotation**: Rotate application tokens periodically
4. **Rate Limiting**: Configure stricter rate limits
5. **Monitoring**: Monitor for suspicious activity
6. **Logging**: Log all authentication attempts
7. **Backup**: Backup secrets securely

## Documentation
See `docs/security/` for detailed security documentation.
