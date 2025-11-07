# Rate Limiting Documentation

## Overview

The application implements comprehensive rate limiting to prevent abuse and DoS attacks. The rate limiter is configured to work correctly behind load balancers and supports both IPv4 and IPv6 addresses.

## Features

- ✅ **IPv6 Support** - Uses `ipKeyGenerator` helper from `express-rate-limit` for proper IPv6 handling
- ✅ **Load Balancer Support** - Extracts real client IP from `X-Forwarded-For` and `X-Real-IP` headers
- ✅ **Development Mode** - More lenient limits and skips rate limiting for localhost
- ✅ **Redis Support** - Optional Redis-based rate limiting for shared state across instances
- ✅ **Environment-Based** - Different limits for development and production

## Configuration

### Default Limits

**Production**:
- Default: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 60 requests per minute

**Development**:
- Default: 1000 requests per minute
- Skips rate limiting for localhost (`127.0.0.1`, `::1`)

### Environment Variables

```env
# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes (default)
RATE_LIMIT_MAX=100            # 100 requests per window (default)
```

## Implementation Details

### IPv6 Safety

The rate limiter uses the `ipKeyGenerator` helper from `express-rate-limit` to ensure IPv6 addresses are handled correctly:

```javascript
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const createKeyGenerator = () => {
  return (req) => {
    const clientIp = getClientIp(req);
    if (clientIp) {
      // Temporarily override req.ip with the extracted client IP
      const originalIp = req.ip;
      req.ip = clientIp;
      try {
        // Use ipKeyGenerator helper to properly handle IPv6 addresses
        return ipKeyGenerator(req);
      } finally {
        // Restore original req.ip
        req.ip = originalIp;
      }
    }
    return ipKeyGenerator(req);
  };
};
```

This prevents IPv6 users from bypassing rate limits by ensuring proper IP normalization.

### Load Balancer Support

The rate limiter automatically extracts the real client IP from load balancer headers:

```javascript
const getClientIp = (req) => {
  // Check X-Forwarded-For header (load balancers/proxies)
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0]; // First IP is the original client
  }

  // Check X-Real-IP header (nginx and other proxies)
  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to Express's req.ip
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
};
```

### Trust Proxy Configuration

Express is configured to trust proxy headers in production:

```javascript
// server/index.js
app.set("trust proxy", config.server.env === "production" ? 1 : false);
```

- **Development**: `trust proxy` is `false` (no proxy)
- **Production**: `trust proxy` is `1` (trust first proxy)

## Rate Limiter Types

### 1. Default Rate Limiter

Applied to all `/api/*` routes:

```javascript
import { defaultRateLimiter } from "./middlewares/rateLimiter.js";
app.use("/api/", defaultRateLimiter);
```

### 2. Auth Rate Limiter

Stricter limits for authentication endpoints:

```javascript
import { authRateLimiter } from "./middlewares/rateLimiter.js";
// 5 requests per 15 minutes
```

### 3. API Rate Limiter

For general API endpoints:

```javascript
import { apiRateLimiter } from "./middlewares/rateLimiter.js";
// 60 requests per minute
```

## Redis-Based Rate Limiting (Optional)

For multiple server instances behind a load balancer, use Redis to share rate limit state:

### Installation

```bash
npm install rate-limit-redis ioredis
```

### Configuration

1. **Update `.env`** with Redis connection details:

```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password  # Optional
```

2. **Update `server/index.js`** to use Redis rate limiter:

```javascript
import { createRedisRateLimiter } from "./middlewares/rateLimiterRedis.js";
const defaultRateLimiter = createRedisRateLimiter();
```

### Benefits

- ✅ **Shared state** - Rate limits are consistent across all instances
- ✅ **Accurate limiting** - A client hitting instance A and instance B is rate-limited correctly
- ✅ **Scalability** - Works with any number of server instances

### Fallback Behavior

If Redis is not available or packages are not installed, the system automatically falls back to in-memory rate limiting (per-instance).

## Response Headers

The rate limiter sets standard headers in responses:

- `RateLimit-Limit` - Maximum number of requests allowed
- `RateLimit-Remaining` - Number of requests remaining
- `RateLimit-Reset` - Time when the rate limit resets

## Error Response

When rate limit is exceeded:

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

HTTP Status: `429 Too Many Requests`

## Testing

### Test Rate Limiting

```bash
# Make multiple requests
for i in {1..101}; do 
  curl -H "X-API-Key: your-token" http://localhost:3010/api/v1/test
done
```

After 100 requests, you should receive `429 Too Many Requests`.

### Test Load Balancer IP Extraction

```bash
# Simulate load balancer with X-Forwarded-For header
curl -H "X-API-Key: your-token" \
     -H "X-Forwarded-For: 192.168.1.100" \
     http://localhost:3010/api/v1/test
```

## Troubleshooting

### Issue: Rate limiting not working correctly

**Solution**: Ensure `trust proxy` is enabled in production:

```javascript
app.set("trust proxy", 1); // or true
```

### Issue: All requests show same IP (load balancer IP)

**Solution**: Check that your load balancer is setting `X-Forwarded-For` or `X-Real-IP` headers.

### Issue: Rate limits inconsistent across instances

**Solution**: Use Redis-based rate limiting for shared state across instances.

### Issue: IPv6 validation error

**Solution**: The rate limiter now uses `ipKeyGenerator` helper. Ensure you're using the latest version of the code.

## Best Practices

1. **Monitor rate limit headers** - Check `RateLimit-*` headers in responses
2. **Use Redis for multiple instances** - Ensures consistent rate limiting
3. **Test with load balancer** - Verify IP extraction and rate limiting work correctly
4. **Adjust limits based on usage** - Monitor and adjust limits as needed
5. **Log rate limit violations** - Track and analyze rate limit violations

## Related Documentation

- [Load Balancing Guide](./LOAD_BALANCING.md) - Detailed load balancer configuration
- [Security Implementation](./SECURITY_IMPLEMENTATION.md) - Complete security documentation
