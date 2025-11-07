# Route Authentication/Authorization Fix Guide

## Problem

When accessing different URLs/features with different users, many authentication and authorization errors were occurring due to inconsistent application of security middleware across routes.

## Solution

A systematic approach has been implemented to ensure all routes have proper authentication and authorization:

### 1. Fixed `/user/:id` Route

**Issue**: The `/user/:id` route was public and allowed anyone to view any user's profile.

**Fix**:
- Added `Auth` middleware to require authentication
- Added `requirePermission("user", "read")` for RBAC check
- Updated controller to check ownership (users can only view their own profile, admins can view any profile)

**Changes**:
- `server/routes/users.js`: Added Auth and RBAC middleware
- `server/controllers/user.js`: Added ownership check in `getUser` controller

### 2. Route Audit Script

Created `server/scripts/audit-routes.js` to systematically check all routes for:
- Missing `Auth` middleware
- Missing RBAC checks (`requirePermission` or `requireAdmin`)
- Inconsistent security configuration

### 3. Route Fix Script

Created `server/scripts/fix-routes-auth.js` to automatically fix common issues:
- Add `Auth` middleware to routes missing it
- Add `requirePermission` based on HTTP method and resource
- Add `requireAdmin` for admin-only endpoints

## Public Endpoints (No Auth Required)

These endpoints are intentionally public and don't require authentication:

- **Health**: `/health`
- **Theme**: `/api/v1/theme/active`
- **Banners**: `/api/v1/banners`, `/api/v1/banners/:id`
- **Products**: 
  - `GET /api/v1/products` (list)
  - `GET /api/v1/products/tags`
  - `GET /api/v1/products/:id` (view)
  - `GET /api/v1/products/:id/related`
  - `GET /api/v1/products/:id/comments`
  - `GET /api/v1/products/:id/ratings`
  - `PATCH /api/v1/products/:id/viewcount`
- **Users**: 
  - `POST /api/v1/user/login`
  - `POST /api/v1/user/register`
  - `POST /api/v1/user/check-user`
  - `PUT /api/v1/user/change-password` (forgot password)
- **Swagger**: `/api-docs`, `/swagger.json`, `/swagger.yaml`
- **Metrics**: `/metrics` (development only)

## Protected Endpoints (Auth + RBAC Required)

All other endpoints require:
1. **Application Token** (`X-API-Key` header)
2. **JWT Authentication** (`Authorization: Bearer <token>` header)
3. **RBAC Permission** (based on user role)

### RBAC Permission Mapping

| Resource | Action | HTTP Method | Roles Allowed |
|----------|--------|-------------|---------------|
| `products` | `read` | GET | user, seller, admin |
| `products` | `create` | POST | seller, admin |
| `products` | `update` | PATCH/PUT | seller, admin |
| `products` | `delete` | DELETE | admin |
| `orders` | `create` | POST | user, admin |
| `orders` | `read` | GET | user, seller, admin |
| `orders` | `update` | PATCH/PUT | seller, admin |
| `carts` | `create` | POST | user, admin |
| `carts` | `read` | GET | user, admin |
| `carts` | `update` | PATCH/PUT | user, admin |
| `carts` | `delete` | DELETE | user, admin |
| `wishlist` | `create` | POST | user, admin |
| `wishlist` | `read` | GET | user, admin |
| `wishlist` | `update` | PATCH/PUT | user, admin |
| `wishlist` | `delete` | DELETE | user, admin |
| `user` | `read` | GET | user, seller, admin |
| `user` | `update` | PATCH/PUT | user, seller, admin |
| `user` | `delete` | DELETE | user, admin |
| `returns` | `create` | POST | user, admin |
| `returns` | `read` | GET | user, seller, admin |
| `returns` | `update` | PATCH/PUT | seller, support, admin |
| `deliveries` | `read` | GET | user, seller, admin |
| `deliveries` | `update` | PATCH/PUT | user, seller, admin |
| `payouts` | `read` | GET | seller, finance, admin |
| `payouts` | `update` | POST/PATCH | finance, admin |
| `chat` | `create` | POST | user, seller, admin |
| `chat` | `read` | GET | user, seller, support, admin |

## Admin-Only Endpoints

These endpoints require `requireAdmin` middleware:

- **Banners**: 
  - `POST /api/v1/banners` (create)
  - `PUT /api/v1/banners/:id` (update)
  - `DELETE /api/v1/banners/:id` (delete)
  - `POST /api/v1/banners/reorder` (reorder)
- **Theme**: 
  - `GET /api/v1/theme/history` (history)
  - `PUT /api/v1/theme/update` (update)
  - `POST /api/v1/theme/reset` (reset)
  - `POST /api/v1/theme/upload-logo` (upload logo)
- **Users**: 
  - `GET /api/v1/user/list` (list all users)
  - `POST /api/v1/user/create` (create user)
  - `GET /api/v1/user/stats` (user statistics)

## Controller-Level Authorization

Some controllers have additional authorization checks beyond RBAC:

### User Profile Access

**Controller**: `getUser` in `server/controllers/user.js`

**Check**: Users can only view their own profile unless they are admin.

```javascript
// Check if user is viewing their own profile or is admin
if (String(userId) !== String(id) && userRole !== "admin") {
  return res.status(403).json({
    success: false,
    message: "Forbidden - You can only view your own profile",
    error: "Insufficient permissions",
  });
}
```

### Order Ownership

**Controller**: `listMyOrders` in `server/controllers/orders.js`

**Check**: Users can only view their own orders (filtered by `userId`).

### Product Ownership

**Controller**: `getMyProducts` in `server/controllers/products.js`

**Check**: Sellers can only view their own products (filtered by `userID`).

## How to Use the Audit Script

1. **Run the audit script**:
   ```bash
   node server/scripts/audit-routes.js
   ```

2. **Review the output** for missing Auth or RBAC checks.

3. **Fix issues manually** or use the fix script (use with caution).

## How to Use the Fix Script

⚠️ **Warning**: The fix script makes automatic changes. Review changes before committing.

1. **Backup your routes**:
   ```bash
   cp -r server/routes server/routes.backup
   ```

2. **Run the fix script**:
   ```bash
   node server/scripts/fix-routes-auth.js
   ```

3. **Review the changes**:
   ```bash
   git diff server/routes/
   ```

4. **Test all endpoints** to ensure they work correctly.

5. **Commit changes** if everything works:
   ```bash
   git add server/routes/
   git commit -m "Fix: Add authentication and authorization to all routes"
   ```

## Testing Checklist

After applying fixes, test with different user roles:

- [ ] **Public endpoints** work without authentication
- [ ] **Protected endpoints** require authentication
- [ ] **Buyer (user)** can access buyer-specific endpoints
- [ ] **Seller** can access seller-specific endpoints
- [ ] **Admin** can access all endpoints
- [ ] **Users cannot access other users' data** (ownership checks)
- [ ] **RBAC permissions** are enforced correctly

## Common Issues and Solutions

### Issue: "Unauthorized - Authentication required"

**Cause**: Missing `Auth` middleware or invalid JWT token.

**Solution**: 
- Ensure route has `Auth` middleware
- Check that JWT token is valid and not expired
- Verify `X-API-Key` header is included

### Issue: "Forbidden - Insufficient permissions"

**Cause**: User role doesn't have required permission.

**Solution**:
- Check `server/config/rolePermissions.js` for role permissions
- Verify user has correct role
- Ensure route has correct `requirePermission` check

### Issue: "Forbidden - You can only view your own profile"

**Cause**: User trying to access another user's profile.

**Solution**: This is expected behavior. Users can only view their own profile unless they are admin.

## Next Steps

1. **Run the audit script** to identify any remaining issues
2. **Test all endpoints** with different user roles
3. **Update documentation** if route permissions change
4. **Monitor logs** for authentication/authorization errors

## Related Files

- `server/routes/*.js` - Route definitions
- `server/middlewares/auth.js` - Authentication middleware
- `server/middlewares/rbac.js` - RBAC middleware
- `server/config/rolePermissions.js` - Role permissions configuration
- `server/scripts/audit-routes.js` - Route audit script
- `server/scripts/fix-routes-auth.js` - Route fix script
