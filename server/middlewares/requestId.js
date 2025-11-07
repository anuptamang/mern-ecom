/**
 * Request ID Middleware
 * 
 * Generates a unique request ID for each request and includes it in:
 * - Request headers (X-Request-ID)
 * - Response headers (X-Request-ID)
 * - All logs
 * 
 * This enables request tracing across services and log correlation.
 */

import crypto from 'crypto';
import { logger } from '../utils/index.js';

/**
 * Generate a unique request ID
 */
const generateRequestId = () => {
  // Use crypto.randomUUID() if available (Node.js 14.17.0+)
  // Otherwise fall back to randomBytes
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Middleware to generate and track request IDs
 */
export const requestIdMiddleware = (req, res, next) => {
  // Get request ID from header or generate new one
  const requestId = req.headers['x-request-id'] || 
                    req.headers['X-Request-ID'] || 
                    generateRequestId();

  // Attach request ID to request object
  req.requestId = requestId;

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  // Add request ID to logger context (if logger supports it)
  req.loggerContext = {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  };

  // Log request with request ID
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  next();
};

export default requestIdMiddleware;
