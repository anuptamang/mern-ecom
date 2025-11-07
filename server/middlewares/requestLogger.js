/**
 * Request/Response Logging Middleware
 * 
 * Comprehensive logging of all HTTP requests and responses for:
 * - Audit trail
 * - Debugging
 * - Security monitoring
 * - Performance analysis
 * 
 * Features:
 * - Logs request method, path, headers, body, query params
 * - Logs response status, time, size
 * - Masks sensitive data (passwords, tokens, credit cards)
 * - Performance metrics (response time)
 */

import { logger } from '../utils/index.js';

/**
 * Mask sensitive data in objects
 */
const maskSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sensitiveFields = [
    'password',
    'confirmPassword',
    'oldPassword',
    'newPassword',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'x-api-key',
    'x-apikey',
    'apiKey',
    'creditCard',
    'cardNumber',
    'cvv',
    'cvc',
    'ssn',
    'socialSecurityNumber',
  ];

  const masked = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in masked) {
    const lowerKey = key.toLowerCase();
    
    // Check if field is sensitive
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      // Recursively mask nested objects
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
};

/**
 * Extract relevant headers (excluding sensitive ones)
 */
const extractHeaders = (headers) => {
  const relevantHeaders = {};
  const excludeHeaders = [
    'authorization',
    'x-api-key',
    'x-apikey',
    'cookie',
    'set-cookie',
  ];

  for (const key in headers) {
    const lowerKey = key.toLowerCase();
    if (!excludeHeaders.some(exclude => lowerKey.includes(exclude))) {
      relevantHeaders[key] = headers[key];
    } else {
      relevantHeaders[key] = '***MASKED***';
    }
  }

  return relevantHeaders;
};

/**
 * Request/Response logging middleware
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = req.requestId || 'unknown';

  // Log incoming request
  const requestLog = {
    requestId,
    type: 'request',
    method: req.method,
    path: req.path,
    url: req.originalUrl,
    query: req.query,
    headers: extractHeaders(req.headers),
    body: maskSensitiveData(req.body),
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  };

  logger.info('HTTP Request', requestLog);

  // Capture original response methods
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;

  // Track response
  let responseBody = null;
  let responseSent = false;

  // Override res.json to capture response body
  res.json = function (body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Override res.send to capture response body
  res.send = function (body) {
    if (!responseSent) {
      responseBody = body;
    }
    return originalSend.call(this, body);
  };

  // Override res.end to log response
  res.end = function (chunk, encoding) {
    if (!responseSent) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const responseLog = {
        requestId,
        type: 'response',
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        responseTimeMs: responseTime,
        headers: extractHeaders(res.getHeaders()),
        body: maskSensitiveData(responseBody),
        contentLength: res.get('content-length') || 'unknown',
        timestamp: new Date().toISOString(),
      };

      // Log response based on status code
      if (res.statusCode >= 500) {
        logger.error('HTTP Response Error', responseLog);
      } else if (res.statusCode >= 400) {
        logger.warn('HTTP Response Warning', responseLog);
      } else {
        logger.info('HTTP Response', responseLog);
      }

      responseSent = true;
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default requestLogger;
