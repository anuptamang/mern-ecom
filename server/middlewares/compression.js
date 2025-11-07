/**
 * Compression Middleware
 * 
 * Compresses HTTP responses using gzip/brotli compression.
 * Reduces bandwidth usage and improves performance, especially for mobile users.
 * 
 * Note: Requires 'compression' package
 * Install: npm install compression
 */

import compression from 'compression';
import config from '../config/index.js';

/**
 * Filter function to determine which responses to compress
 */
const shouldCompress = (req, res) => {
  // Don't compress if client doesn't support compression
  if (req.headers['x-no-compression']) {
    return false;
  }

  // Compress JSON, text, HTML, CSS, JS, XML
  const contentType = res.getHeader('content-type') || '';
  const compressibleTypes = [
    'application/json',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'text/xml',
    'application/xml',
    'text/plain',
  ];

  return compressibleTypes.some(type => contentType.includes(type));
};

/**
 * Create compression middleware with configuration
 */
export const compressionMiddleware = compression({
  // Filter function to determine which responses to compress
  filter: shouldCompress,
  // Compression level (1-9, higher = better compression but slower)
  level: config.server.env === 'production' ? 6 : 1,
  // Threshold: only compress responses larger than this (bytes)
  threshold: 1024, // 1KB
});

export default compressionMiddleware;
