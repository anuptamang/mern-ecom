/**
 * Security Headers Middleware
 * 
 * Implements security best practices by setting HTTP security headers.
 * Protects against common attacks like XSS, clickjacking, MIME sniffing, etc.
 * 
 * Security Principle: "Defense in depth" - Multiple layers of security
 */

import { logger } from '../utils/index.js';
import config from '../config/index.js';

/**
 * Set security headers for all responses
 */
export const securityHeaders = (req, res, next) => {
  try {
    // Prevent XSS attacks
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // XSS Protection (legacy, but still useful)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict Transport Security (HSTS) - Only in production with HTTPS
    if (config.server.env === 'production' && req.secure) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
    
    // Content Security Policy
    // Adjust based on your frontend requirements
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust for production
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', csp);
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy (formerly Feature Policy)
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    );
    
    // Remove X-Powered-By header (information disclosure)
    res.removeHeader('X-Powered-By');
    
    next();
  } catch (error) {
    logger.error('Error setting security headers', {
      error: error.message,
      stack: error.stack,
    });
    
    // Continue even if headers fail (don't break the request)
    next();
  }
};

export default securityHeaders;
