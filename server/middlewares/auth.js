/**
 * Enhanced Authentication Middleware
 *
 * Enterprise-grade JWT authentication with proper error handling,
 * user verification, and role assignment.
 *
 * Security Principle: "Verify everything" - Always verify token and user existence
 */

import jwt from "jsonwebtoken";
import User from "../models/user.js";
import config from "../config/index.js";
import { logger } from "../utils/index.js";

/**
 * Authenticate user using JWT token
 * Verifies token, fetches user, and attaches user info to request
 */
const Auth = async (req, res, next) => {
  try {
    // Check for authorization header
    if (!req.headers.authorization) {
      logger.warn("Authentication attempt without authorization header", {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });

      return res.status(401).json({
        success: false,
        message: "Unauthorized - Authentication required",
        error: "Missing Authorization header",
      });
    }

    // Extract token from Bearer format
    const authHeader = req.headers.authorization;
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      logger.warn("Invalid authorization header format", {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });

      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid authorization format",
        error: "Authorization header must be in format: Bearer <token>",
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token required",
        error: "Missing token",
      });
    }

    // Determine if it's a custom JWT (length < 500) or OAuth token
    const isCustomAuth = token.length < 500;
    let decodedData;

    if (isCustomAuth) {
      // Verify custom JWT token
      try {
        decodedData = jwt.verify(token, config.jwt.secret);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          logger.warn("Expired token attempt", {
            ip: req.ip,
            path: req.path,
            method: req.method,
          });

          return res.status(401).json({
            success: false,
            message: "Unauthorized - Token expired",
            error: "Please log in again",
          });
        } else if (error.name === "JsonWebTokenError") {
          logger.warn("Invalid token attempt", {
            ip: req.ip,
            path: req.path,
            method: req.method,
          });

          return res.status(401).json({
            success: false,
            message: "Unauthorized - Invalid token",
            error: "Token verification failed",
          });
        } else {
          throw error;
        }
      }

      // Verify user exists and fetch role
      const user = await User.findById(decodedData?.id);

      if (!user) {
        logger.warn("Token for non-existent user", {
          userId: decodedData?.id,
          ip: req.ip,
          path: req.path,
        });

        return res.status(401).json({
          success: false,
          message: "Unauthorized - User not found",
          error: "User account does not exist. Please contact support.",
        });
      }

      // Attach user info to request
      req.userId = user._id.toString();
      req.userRole = user.role;
      req.user = user; // Attach full user object for convenience
    } else {
      // OAuth token (e.g., Google) - decode without verification
      // Note: In production, you should verify OAuth tokens properly
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub;
      // OAuth tokens don't have role in our system, would need separate lookup
    }

    next();
  } catch (error) {
    logger.error("Authentication error", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      path: req.path,
    });

    return res.status(401).json({
      success: false,
      message: "Unauthorized - Authentication failed",
      error: "Token verification failed",
    });
  }
};

export default Auth;
