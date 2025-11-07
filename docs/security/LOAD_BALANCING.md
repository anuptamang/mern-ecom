# Load Balancing Configuration Guide

This guide explains how the application is configured to work behind load balancers and reverse proxies.

## Overview

When deploying behind a load balancer (AWS ELB, Nginx, HAProxy, etc.), the server needs to:

1. **Trust proxy headers** - Extract real client IP from `X-Forwarded-For` and `X-Real-IP` headers
2. **Share rate limit state** - Use Redis for shared rate limiting across multiple instances (optional)

## Current Configuration

### 1. Trust Proxy Settings

The Express app is configured to trust proxy headers in production:

```javascript
// server/index.js
app.set('trust proxy', config.server.env === 'production' ? 1 : false);
```

- **Development**: `trust proxy` is `false` (no proxy)
- **Production**: `trust proxy` is `1` (trust first proxy)

### 2. Real Client IP Extraction

The rate limiter automatically extracts the real client IP from load balancer headers:

```javascript
// server/middlewares/rateLimiter.js
const getClientIp = (req) => {
  // Check X-Forwarded-For header (load balancers/proxies)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0]; // First IP is the original client
  }

  // Check X-Real-IP header (nginx and other proxies)
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to Express's req.ip
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
};
```

### 3. Rate Limiting with Load Balancers

The rate limiter uses a custom `keyGenerator` with IPv6 safety to ensure rate limiting works correctly:

```javascript
// server/middlewares/rateLimiter.js
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
        // This prevents IPv6 users from bypassing rate limits
        return ipKeyGenerator(req);
      } finally {
        // Restore original req.ip
        req.ip = originalIp;
      }
    }
    // Fallback to default ipKeyGenerator if we can't extract IP
    return ipKeyGenerator(req);
  };
};
```

This ensures that:
- Rate limiting is based on the **real client IP**, not the load balancer IP
- Each client is rate-limited consistently across all server instances
- **IPv6 addresses are handled correctly** - prevents IPv6 users from bypassing rate limits
- Uses `ipKeyGenerator` helper from `express-rate-limit` for proper IPv6 normalization

## Redis-Based Rate Limiting (Optional)

For **multiple server instances** behind a load balancer, use Redis to share rate limit state:

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
// Replace this:
import { defaultRateLimiter } from "./middlewares/rateLimiter.js";

// With this:
import { createRedisRateLimiter } from "./middlewares/rateLimiterRedis.js";
const defaultRateLimiter = createRedisRateLimiter();
```

### Benefits of Redis Rate Limiting

- ✅ **Shared state** - Rate limits are consistent across all instances
- ✅ **Accurate limiting** - A client hitting instance A and instance B is rate-limited correctly
- ✅ **Scalability** - Works with any number of server instances

### Fallback Behavior

If Redis is not available or packages are not installed, the system automatically falls back to in-memory rate limiting (per-instance).

## Load Balancer Configuration

### Nginx Configuration

```nginx
upstream backend {
    server 127.0.0.1:3010;
    server 127.0.0.1:3011;
    # Add more instances as needed
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### AWS Application Load Balancer (ALB)

ALB automatically sets `X-Forwarded-For` and `X-Forwarded-Proto` headers. No additional configuration needed.

### AWS Elastic Load Balancer (ELB)

ELB sets `X-Forwarded-For` header. Ensure your Express app trusts the proxy:

```javascript
app.set('trust proxy', true);
```

## Testing Load Balancer Setup

### 1. Check Real IP Extraction

Add a test endpoint to verify IP extraction:

```javascript
// server/routes/test.js
router.get('/ip', (req, res) => {
  const clientIp = getClientIp(req);
  res.json({
    clientIp,
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
    },
    expressIp: req.ip,
  });
});
```

### 2. Test Rate Limiting

Make multiple requests from the same IP and verify rate limiting works:

```bash
# Should work
curl http://your-domain.com/api/v1/test

# After exceeding limit, should return 429
for i in {1..101}; do curl http://your-domain.com/api/v1/test; done
```

## Environment Variables

### Required for Load Balancing

```env
# Trust proxy (automatically set based on NODE_ENV)
NODE_ENV=production

# Redis (optional, for shared rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Optional Configuration

```env
# Customize rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100           # 100 requests per window
```

## Troubleshooting

### Issue: Rate limiting not working correctly

**Solution**: Ensure `trust proxy` is enabled in production:

```javascript
app.set('trust proxy', 1); // or true
```

### Issue: All requests show same IP (load balancer IP)

**Solution**: Check that your load balancer is setting `X-Forwarded-For` or `X-Real-IP` headers.

### Issue: Rate limits inconsistent across instances

**Solution**: Use Redis-based rate limiting for shared state across instances.

### Issue: Redis connection errors

**Solution**: The system automatically falls back to in-memory rate limiting. Check Redis connection:

```bash
redis-cli ping
```

## Best Practices

1. **Always enable `trust proxy` in production** - Required for correct IP extraction
2. **Use Redis for multiple instances** - Ensures consistent rate limiting
3. **Monitor rate limit headers** - Check `X-RateLimit-*` headers in responses
4. **Test with load balancer** - Verify IP extraction and rate limiting work correctly
5. **Configure load balancer health checks** - Use `/health` endpoint

## Summary

✅ **Current Setup**:
- Trust proxy enabled in production
- Real client IP extraction from headers
- Custom key generator for rate limiting

✅ **Optional Enhancement**:
- Redis-based rate limiting for shared state
- Install `rate-limit-redis` and `ioredis` packages
- Update rate limiter import in `server/index.js`

The application is now ready for load-balanced deployments! 🚀
