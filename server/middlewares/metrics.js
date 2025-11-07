/**
 * Metrics Middleware
 * 
 * Collects Prometheus metrics for:
 * - HTTP request duration
 * - HTTP request count
 * - HTTP error count
 * - Response time percentiles
 * 
 * Provides metrics endpoint at /metrics
 */

import promClient from 'prom-client';
import config from '../config/index.js';

// Create a Registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, event loop, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
});

// Custom HTTP metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  register,
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  register,
});

const httpRequestErrors = new promClient.Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'status_code'],
  register,
});

const httpRequestSize = new promClient.Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000],
  register,
});

const httpResponseSize = new promClient.Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000],
  register,
});

// Business metrics
const ordersTotal = new promClient.Counter({
  name: 'orders_total',
  help: 'Total number of orders',
  labelNames: ['status'],
  register,
});

const revenueTotal = new promClient.Counter({
  name: 'revenue_total',
  help: 'Total revenue in cents',
  labelNames: ['currency'],
  register,
});

/**
 * Metrics middleware to collect HTTP metrics
 */
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const route = req.route?.path || req.path || req.originalUrl.split('?')[0];

  // Track request size
  const requestSize = req.headers['content-length'] 
    ? parseInt(req.headers['content-length'], 10) 
    : 0;

  if (requestSize > 0) {
    httpRequestSize.observe({ method: req.method, route }, requestSize);
  }

  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode;

    // Track duration
    httpRequestDuration.observe(
      { method: req.method, route, status_code: statusCode },
      duration
    );

    // Track total requests
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });

    // Track errors
    if (statusCode >= 400) {
      httpRequestErrors.inc({
        method: req.method,
        route,
        status_code: statusCode,
      });
    }

    // Track response size
    const responseSize = res.get('content-length')
      ? parseInt(res.get('content-length'), 10)
      : 0;

    if (responseSize > 0) {
      httpResponseSize.observe(
        { method: req.method, route, status_code: statusCode },
        responseSize
      );
    }
  });

  next();
};

/**
 * Metrics endpoint handler
 */
export const metricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating metrics',
      error: error.message,
    });
  }
};

/**
 * Business metrics helpers
 */
export const metrics = {
  /**
   * Increment order count
   */
  incrementOrder: (status = 'created') => {
    ordersTotal.inc({ status });
  },

  /**
   * Increment revenue
   */
  incrementRevenue: (amount, currency = 'usd') => {
    revenueTotal.inc({ currency }, amount);
  },
};

export { register };

export default metricsMiddleware;
