# Installation Guide for Enterprise Features

This guide provides installation instructions for all enterprise-grade features.

## Required Packages

### Phase 1: Critical Features

```bash
cd server
npm install compression
```

### Phase 2: API Documentation & Metrics

```bash
cd server
npm install swagger-jsdoc swagger-ui-express prom-client
```

### Complete Installation (All Features)

```bash
cd server
npm install compression swagger-jsdoc swagger-ui-express prom-client
```

## Installation Steps

1. **Navigate to server directory**:

   ```bash
   cd server
   ```

2. **Install packages**:

   ```bash
   npm install compression swagger-jsdoc swagger-ui-express prom-client
   ```

3. **Restart server**:
   ```bash
   npm run dev
   ```

## Verification

### 1. Verify Compression

Check response headers for `Content-Encoding: gzip`:

```bash
curl -H "X-API-Key: your-token" -I http://localhost:3010/api/v1/products
```

### 2. Verify API Documentation

Visit: `http://localhost:3010/api-docs`

You should see the Swagger UI with interactive API documentation.

### 3. Verify Metrics

Check metrics endpoint:

```bash
curl -H "X-API-Key: your-token" http://localhost:3010/metrics
```

You should see Prometheus metrics in text format.

### 4. Verify Request ID

Check response headers for `X-Request-ID`:

```bash
curl -H "X-API-Key: your-token" -I http://localhost:3010/api/v1/products
```

### 5. Verify Request Logging

Check server logs for request/response logging. You should see:

- Request logs with method, path, headers, body
- Response logs with status, time, size
- Sensitive data masked (passwords, tokens)

## Troubleshooting

### Issue: Compression not working

**Solution**: Ensure `compression` package is installed:

```bash
cd server
npm install compression
```

### Issue: Swagger UI not loading

**Solution**: Ensure packages are installed:

```bash
cd server
npm install swagger-jsdoc swagger-ui-express
```

### Issue: Metrics endpoint returns 401

**Solution**: Ensure you're including the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-token" http://localhost:3010/metrics
```

### Issue: Request ID not in headers

**Solution**: Ensure `requestIdMiddleware` is applied early in the middleware chain (already done in `server/index.js`).

## Package Versions

Recommended versions:

- `compression`: ^1.7.4
- `swagger-jsdoc`: ^6.2.8
- `swagger-ui-express`: ^5.0.0
- `prom-client`: ^15.1.0

## Next Steps

After installation, see:

- [Implementation Guide](../enterprise/IMPLEMENTATION_GUIDE.md) - Detailed implementation steps
- [Enterprise Implementation Checklist](../enterprise/ENTERPRISE_IMPLEMENTATION_CHECKLIST.md) - Complete feature checklist
