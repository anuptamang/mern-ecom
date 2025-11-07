/**
 * Graceful Shutdown Handler
 * 
 * Handles graceful shutdown of the server to:
 * - Prevent data loss
 * - Clean up resources
 * - Finish in-flight requests
 * - Close database connections
 */

import { logger } from './index.js';
import mongoose from 'mongoose';

/**
 * Graceful shutdown handler
 * 
 * @param {Object} server - HTTP server instance
 * @param {Object} options - Shutdown options
 */
export const gracefulShutdown = (server, options = {}) => {
  const {
    timeout = 10000, // 10 seconds default timeout
    onShutdown = null, // Custom shutdown callback
  } = options;

  let isShuttingDown = false;
  let shutdownTimeout = null;

  const shutdown = async (signal) => {
    // Prevent multiple shutdown attempts
    if (isShuttingDown) {
      logger.warn('Shutdown already in progress, ignoring signal');
      return;
    }

    isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    // Set timeout to force exit if shutdown takes too long
    shutdownTimeout = setTimeout(() => {
      logger.error('Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, timeout);

    try {
      // Stop accepting new connections
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close database connections
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
      } catch (error) {
        logger.error('Error closing MongoDB connection', {
          error: error.message,
          stack: error.stack,
        });
      }

      // Execute custom shutdown callback
      if (onShutdown && typeof onShutdown === 'function') {
        try {
          await onShutdown();
        } catch (error) {
          logger.error('Error in custom shutdown callback', {
            error: error.message,
            stack: error.stack,
          });
        }
      }

      // Clear timeout since shutdown completed successfully
      if (shutdownTimeout) {
        clearTimeout(shutdownTimeout);
      }

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    }
  };

  // Handle termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack,
    });
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
    });
    shutdown('unhandledRejection');
  });
};

export default gracefulShutdown;
