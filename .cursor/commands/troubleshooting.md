# Troubleshooting - Common Issues and Solutions

Quick reference for troubleshooting common issues in the project.

## Purpose
Common problems and their solutions for quick resolution.

## Authentication Issues

### 401 Unauthorized - Application Token Required

**Problem**: API requests return 401 with "Application token required"

**Solutions**:
1. Verify `REACT_APP_APPLICATION_TOKEN` is set in `client/.env`
2. Verify `APPLICATION_TOKEN` is set in `server/.env`
3. Ensure both tokens match exactly
4. Restart both client and server after changes
5. Check browser console for token errors

**Test**:
```bash
curl -H "X-API-Key: your_token" http://localhost:3010/api/v1/health
```

### 401 Unauthorized - Invalid Token

**Problem**: JWT token verification fails

**Solutions**:
1. Verify `JWT_SECRET` is set in `server/.env`
2. Ensure JWT secret matches between token generation and verification
3. Check token expiration
4. Verify token format: `Bearer <token>`
5. Check token in browser DevTools → Application → Local Storage

### Login Redirect Loop

**Problem**: User is redirected to login immediately after login

**Solutions**:
1. Check login grace period in `client/src/configs/axios/axiosInterceptor.ts`
2. Verify token is stored after login
3. Check for 401 errors in network tab
4. Verify token is included in subsequent requests
5. Clear browser cache and localStorage

## Database Issues

### Database Connection Failed

**Problem**: Cannot connect to MongoDB

**Solutions**:
1. Verify MongoDB is running:
   ```bash
   mongosh  # Should connect
   ```
2. Check connection string in `server/.env`:
   ```env
   DATABASE_URL=mongodb://localhost:27017/ecommerce
   ```
3. Verify MongoDB port (default: 27017)
4. Check firewall settings
5. For production: Verify credentials and network access

### CastError: Cast to ObjectId failed

**Problem**: Invalid MongoDB ObjectId in route parameters

**Solutions**:
1. Verify route ordering (specific routes before parameterized routes)
2. Check ID format in URL
3. Add validation in controller:
   ```javascript
   if (!mongoose.Types.ObjectId.isValid(id)) {
     return res.status(400).json({ message: 'Invalid ID format' });
   }
   ```

## Image Upload Issues

### Cloudflare R2 SignatureDoesNotMatch

**Problem**: R2 upload fails with signature mismatch

**Solutions**:
1. Verify endpoint format: `https://{accountId}.r2.cloudflarestorage.com` (NO bucket name)
2. Check credentials are correct (no extra spaces)
3. Verify bucket name matches exactly
4. Ensure public access is enabled in Cloudflare Dashboard
5. Check R2 API token permissions

### Images Not Uploading

**Problem**: File upload fails

**Solutions**:
1. Check file size limits in `server/config/index.js`
2. Verify allowed MIME types
3. Check Cloudflare credentials
4. Verify fallback to local storage works
5. Check server logs for errors

### Image URLs Not Working

**Problem**: Images return 404

**Solutions**:
1. Verify `IMAGE_BUCKET_URL` is set correctly
2. Check Cloudflare R2 public access is enabled
3. Verify custom domain DNS (if using)
4. Check image path in database
5. Verify static file serving is configured

## API Issues

### 429 Too Many Requests

**Problem**: Rate limit exceeded

**Solutions**:
1. Wait for rate limit window to reset
2. Check rate limit configuration in `server/middlewares/rateLimiter.js`
3. For development: Verify localhost is excluded
4. Check if using load balancer (may need Redis for shared state)

### CORS Errors

**Problem**: CORS policy blocks requests

**Solutions**:
1. Verify CORS origin in `server/index.js` matches client URL
2. Check CORS credentials setting
3. Verify preflight (OPTIONS) requests are handled
4. Check browser console for CORS errors

### Endpoint Not Found (404)

**Problem**: API endpoint returns 404

**Solutions**:
1. Verify route is registered in `server/index.js`
2. Check route path matches exactly
3. Verify API version prefix: `/api/v1/`
4. Check route ordering (specific before general)
5. Verify HTTP method matches (GET, POST, etc.)

## Build Issues

### Module Not Found

**Problem**: Cannot find module

**Solutions**:
1. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check import paths are correct
3. Verify package is installed
4. Check for case sensitivity in file names
5. Clear build cache

### TypeScript Errors

**Problem**: TypeScript compilation fails

**Solutions**:
1. Run type check: `cd client && npm run type-check`
2. Fix type errors shown
3. Check `tsconfig.json` configuration
4. Verify all types are defined
5. Check for missing type definitions

### Build Fails

**Problem**: Production build fails

**Solutions**:
1. Check for TypeScript errors
2. Verify all imports are correct
3. Check for missing dependencies
4. Review build logs for specific errors
5. Try clean build: `rm -rf build .next && npm run build`

## Monitoring Issues

### No Metrics Showing

**Problem**: Prometheus shows no metrics

**Solutions**:
1. Verify metrics endpoint: `curl http://localhost:3010/metrics`
2. Generate sample traffic: `npm run generate-metrics`
3. Check Prometheus targets: http://localhost:9090/targets
4. Verify Prometheus configuration
5. Check server logs for errors

### Grafana Shows "No Data"

**Problem**: Grafana dashboard shows no data

**Solutions**:
1. Verify Prometheus data source is configured
2. Check Prometheus has metrics: http://localhost:9090/graph
3. Verify time range in Grafana
4. Check query syntax in panels
5. Verify data source URL is correct

## Performance Issues

### Slow API Responses

**Problem**: API requests are slow

**Solutions**:
1. Check database query performance
2. Verify indexes are created
3. Check for N+1 query problems
4. Review response compression
5. Check server resources (CPU, memory)

### High Memory Usage

**Problem**: Server uses too much memory

**Solutions**:
1. Check for memory leaks
2. Review large data processing
3. Check image upload buffer sizes
4. Verify proper cleanup of resources
5. Monitor with Prometheus/Grafana

## Quick Fixes

### Restart Everything

```bash
# Stop all
npm run dev:stop
lsof -ti:3000 | xargs kill
lsof -ti:3010 | xargs kill

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart
npm run dev
```

### Reset Environment

```bash
# Reset database and restart
npm run reset-and-restart

# Or manually:
npm run dev:stop
cd server && npm run reset-db && npm run seed
cd .. && npm run dev
```

### Clear Cache

```bash
# Client
cd client && rm -rf .next build node_modules/.cache

# Server
cd server && rm -rf node_modules/.cache
```

## Getting Help

1. **Check Logs**: Review server logs for errors
2. **Browser Console**: Check for client-side errors
3. **Network Tab**: Review API requests/responses
4. **Documentation**: See `docs/` for detailed guides
5. **GitHub Issues**: Search for similar issues

## Documentation
See specific troubleshooting guides:
- `docs/enterprise/CLOUDFLARE_SETUP.md` - Cloudflare issues
- `docs/security/` - Security issues
- `docs/development/` - Development issues
