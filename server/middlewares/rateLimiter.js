/**
 * Rate limiting middleware
 * Prevents abuse and ensures fair resource usage
 *
 * Note: Requires express-rate-limit package
 * Install: npm install express-rate-limit
 */

import config from "../config/index.js";
import rateLimit from "express-rate-limit";

export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.max || config.rateLimit.max,
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
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
