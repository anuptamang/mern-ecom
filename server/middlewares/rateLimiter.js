/**
 * Rate limiting middleware
 * Prevents abuse and ensures fair resource usage
 *
 * Note: Requires express-rate-limit package
 * Install: npm install express-rate-limit
 */

import config from "../config/index.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * Get the real client IP address from request
 * Handles load balancers and reverse proxies by checking X-Forwarded-For and X-Real-IP headers
 */
const getClientIp = (req) => {
  // Check X-Forwarded-For header (load balancers/proxies)
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
    // The first IP is the original client IP
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0];
  }

  // Check X-Real-IP header (nginx and other proxies)
  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to Express's req.ip (works when trust proxy is enabled)
  // Or use connection/socket remote address
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
};

export const createRateLimiter = (options = {}) => {
  // More lenient rate limiting in development
  const isDevelopment = config.server.env === "development";
  const defaultWindowMs = isDevelopment
    ? 1 * 60 * 1000
    : config.rateLimit.windowMs; // 1 minute in dev, 15 minutes in prod
  const defaultMax = isDevelopment ? 1000 : config.rateLimit.max; // 1000 requests per minute in dev, 100 per 15 min in prod

  // Skip rate limiting for localhost in development (unless explicitly overridden)
  const defaultSkip = isDevelopment
    ? (req) => {
        const ip = getClientIp(req);
        return (
          ip === "::1" ||
          ip === "127.0.0.1" ||
          ip === "::ffff:127.0.0.1" ||
          ip?.startsWith("::ffff:127.0.0.1")
        );
      }
    : undefined;

  // Create a custom key generator that uses ipKeyGenerator helper for IPv6 safety
  // This ensures proper handling of IPv6 addresses and prevents bypass
  const createKeyGenerator = () => {
    return (req) => {
      const clientIp = getClientIp(req);
      if (clientIp) {
        // Temporarily override req.ip with the extracted client IP
        // This allows ipKeyGenerator to properly handle IPv6 addresses
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

  return rateLimit({
    windowMs: options.windowMs || defaultWindowMs,
    max: options.max || defaultMax,
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use custom key generator that properly handles IPv6 addresses
    // This ensures rate limiting works correctly behind load balancers/proxies
    // and prevents IPv6 bypass vulnerabilities
    keyGenerator: options.keyGenerator || createKeyGenerator(),
    // Use provided skip function or default skip for development
    // Note: skip must be set before ...options spread to avoid override
    skip: options.skip !== undefined ? options.skip : defaultSkip,
    // Spread other options (skip and keyGenerator are already set above, so they won't be overridden)
    ...Object.fromEntries(
      Object.entries(options).filter(
        ([key]) => key !== "skip" && key !== "keyGenerator"
      )
    ),
  });
};

// Default rate limiter
export const defaultRateLimiter = createRateLimiter();

// Strict rate limiter for authentication endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
});

// API rate limiter
export const apiRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
});
