/**
 * Application Token Middleware
 * 
 * Enterprise-grade security: All API endpoints require a valid application token
 * This provides an additional layer of security beyond user authentication.
 * 
 * The application token should be sent in the X-API-Key header.
 * 
 * Security Principle: "Deny by default" - All endpoints are protected unless explicitly whitelisted
 */

import config from '../config/index.js';
import { logger } from '../utils/index.js';

/**
 * Middleware to verify application token
 * All API endpoints must include a valid X-API-Key header
 */
export const verifyApplicationToken = (req, res, next) => {
  try {
    // Get application token from header (case-insensitive)
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'] || req.headers['x-apikey'] || req.headers['X-Api-Key'];
    
    if (!apiKey) {
      logger.warn('API request without application token', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        headers: Object.keys(req.headers),
      });
      
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Application token required',
        error: 'Missing X-API-Key header',
        hint: 'Please include X-API-Key header in your request. Check client/.env for REACT_APP_APPLICATION_TOKEN',
      });
    }

    // Verify token matches configured secret
    const expectedToken = config.security.applicationToken || process.env.APPLICATION_TOKEN;
    
    if (!expectedToken) {
      logger.error('Application token not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'Application token not configured',
      });
    }

    // Compare tokens using constant-time comparison to prevent timing attacks
    if (!constantTimeCompare(apiKey, expectedToken)) {
      logger.warn('Invalid application token attempt', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid application token',
        error: 'Invalid X-API-Key',
      });
    }

    // Token is valid, proceed
    next();
  } catch (error) {
    logger.error('Error in application token verification', {
      error: error.message,
      stack: error.stack,
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Token verification failed',
    });
  }
};

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} - True if strings are equal
 */
function constantTimeCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

export default verifyApplicationToken;
