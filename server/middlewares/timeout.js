/**
 * Request Timeout Middleware
 * 
 * Prevents hanging requests and resource exhaustion by:
 * - Setting global request timeout
 * - Configuring per-route timeouts
 * - Graceful timeout handling
 */

import { logger } from '../utils/index.js';
import config from '../config/index.js';

/**
 * Default timeout in milliseconds
 */
const DEFAULT_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10); // 30 seconds

/**
 * Request timeout middleware
 * 
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000)
 */
export const requestTimeout = (timeoutMs = DEFAULT_TIMEOUT) => {
  return (req, res, next) => {
    // Set timeout
    const timeout = setTimeout(() => {
      // Log timeout
      logger.warn('Request timeout', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        timeout: timeoutMs,
        ip: req.ip,
      });

      // Send timeout response if response hasn't been sent
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Request timeout',
          error: `Request took longer than ${timeoutMs}ms to process`,
          requestId: req.requestId,
        });
      }

      // Destroy request to free resources
      req.destroy();
    }, timeoutMs);

    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * Default timeout middleware (30 seconds)
 */
export const defaultTimeout = requestTimeout();

export default requestTimeout;
