/**
 * Redis-based Rate Limiting Middleware
 * 
 * For load-balanced environments with multiple server instances,
 * use Redis to share rate limit state across all instances.
 * 
 * This ensures consistent rate limiting regardless of which server
 * instance handles the request.
 * 
 * Installation:
 *   npm install rate-limit-redis ioredis
 * 
 * Usage:
 *   import { createRedisRateLimiter } from './middlewares/rateLimiterRedis.js';
 *   const rateLimiter = createRedisRateLimiter();
 */

import config from "../config/index.js";
import rateLimit from "express-rate-limit";

/**
 * Create a Redis-based rate limiter (optional - for load-balanced environments)
 * This requires rate-limit-redis and ioredis packages
 */
export const createRedisRateLimiter = async (options = {}) => {
  try {
    // Try to import Redis store (optional dependency)
    // Use dynamic import for ES modules
    const { default: RedisStore } = await import("rate-limit-redis");
    const { default: Redis } = await import("ioredis");

    // Create Redis client
    const redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      retryStrategy: (times) => {
        // Retry with exponential backoff
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    // Handle Redis connection errors
    redisClient.on("error", (error) => {
      console.error("Redis connection error:", error);
      // Fall back to in-memory rate limiting if Redis fails
    });

    const isDevelopment = config.server.env === "development";
    const defaultWindowMs = isDevelopment
      ? 1 * 60 * 1000
      : config.rateLimit.windowMs;
    const defaultMax = isDevelopment ? 1000 : config.rateLimit.max;

    return rateLimit({
      store: new RedisStore({
        client: redisClient,
        prefix: "rl:", // Redis key prefix
      }),
      windowMs: options.windowMs || defaultWindowMs,
      max: options.max || defaultMax,
      message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
      // Use custom key generator to extract real client IP from load balancer headers
      keyGenerator: options.keyGenerator || ((req) => {
        return getClientIp(req) || req.ip || 'unknown';
      }),
      ...options,
    });
  } catch (error) {
    // If Redis packages are not installed, fall back to in-memory rate limiting
    console.warn(
      "Redis rate limiting not available. Install rate-limit-redis and ioredis for shared rate limiting across instances."
    );
    console.warn("Falling back to in-memory rate limiting.");
    
    // Import and use the regular rate limiter
    const { createRateLimiter } = await import("./rateLimiter.js");
    return createRateLimiter(options);
  }
};

/**
 * Get the real client IP address from request
 * Handles load balancers and reverse proxies
 */
const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0];
  }

  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return realIp.trim();
  }

  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
};

export default {
  createRedisRateLimiter,
};
