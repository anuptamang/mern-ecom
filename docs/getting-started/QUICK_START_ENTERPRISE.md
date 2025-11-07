# Quick Start: Enterprise Features

This guide helps you quickly get started with the enterprise-grade features.

## 🚀 Installation

### Step 1: Install Required Packages

```bash
cd server
npm install compression swagger-jsdoc swagger-ui-express prom-client
```

### Step 2: Restart Server

```bash
npm run dev
```

## ✅ Verify Installation

### 1. API Documentation (Swagger)

Visit: `http://localhost:3010/api-docs`

**Note**: You'll need to include the `X-API-Key` header. Use your application token from `server/.env`.

### 2. Metrics Endpoint

```bash
curl -H "X-API-Key: your-token" http://localhost:3010/metrics
```

You should see Prometheus metrics in text format.

### 3. Request ID

```bash
curl -H "X-API-Key: your-token" -I http://localhost:3010/api/v1/products
```

Check for `X-Request-ID` header in the response.

### 4. Request Logging

Check your server logs. You should see:
- Request logs with method, path, headers, body
- Response logs with status, time, size
- Sensitive data masked (passwords, tokens)

## 📊 Features Overview

### ✅ Implemented Features

1. **Request ID Tracking** - Unique ID for each request
2. **Request/Response Logging** - Comprehensive logging with sensitive data masking
3. **Response Compression** - Gzip/Brotli compression (requires package)
4. **Request Timeout** - Prevents hanging requests (30s default)
5. **Graceful Shutdown** - Clean resource cleanup
6. **API Documentation** - Interactive Swagger UI
7. **Metrics & Observability** - Prometheus metrics endpoint

### 📋 Next Steps

1. **Add JSDoc Comments** - Document all API endpoints in route files
2. **Configure Prometheus** - Set up Prometheus to scrape metrics
3. **Set up Grafana** - Create dashboards for visualization
4. **Use Business Metrics** - Track orders and revenue in controllers

## 🔧 Configuration

### Environment Variables

Add to `server/.env`:

```env
# Request Timeout (optional)
REQUEST_TIMEOUT_MS=30000

# Metrics (optional)
METRICS_ENABLED=true
```

### Application Token

Ensure you have `APPLICATION_TOKEN` set in `server/.env`:

```env
APPLICATION_TOKEN=your-secure-application-token
```

## 📚 Documentation

- [Implementation Guide](../enterprise/IMPLEMENTATION_GUIDE.md) - Detailed implementation steps
- [Enterprise Checklist](../enterprise/ENTERPRISE_IMPLEMENTATION_CHECKLIST.md) - Complete feature checklist
- [Installation Guide](./INSTALLATION.md) - Package installation guide

## 🐛 Troubleshooting

### Issue: Swagger UI not loading

**Solution**: Ensure packages are installed:
```bash
cd server
npm install swagger-jsdoc swagger-ui-express
```

### Issue: Metrics endpoint returns 401

**Solution**: Include the `X-API-Key` header:
```bash
curl -H "X-API-Key: your-token" http://localhost:3010/metrics
```

### Issue: Compression not working

**Solution**: Install the compression package:
```bash
cd server
npm install compression
```

## 🎯 Usage Examples

### Using Business Metrics

```javascript
import { metrics } from '../middlewares/metrics.js';

// In your controller
metrics.incrementOrder('created');
metrics.incrementRevenue(amount, 'usd');
```

### Adding JSDoc Comments

```javascript
/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/", getProducts);
```

## 🚀 Ready to Go!

All enterprise features are now implemented and ready to use. Start by installing the packages and verifying the endpoints!
