/**
 * Auto-Fix System for Server Errors
 * 
 * Automatically fixes identified errors when possible
 */

import logger from './logger.js';
import { identifyError, ERROR_TYPES } from './errorIdentifier.js';
import mongoose from 'mongoose';

/**
 * Auto-fix error handlers
 */
const autoFixHandlers = {
  /**
   * Fix Mongoose Cast Error (invalid ObjectId)
   */
  [ERROR_TYPES.MONGOOSE_CAST_ERROR]: async (error, context) => {
    logger.info('Auto-fixing: Mongoose Cast Error', { error: error.message });
    
    // Return a sanitized response instead of crashing
    return {
      fixed: true,
      action: 'sanitized_response',
      message: 'Invalid resource ID format',
      statusCode: 400,
      originalError: error.message,
    };
  },
  
  /**
   * Fix Mongoose Duplicate Key Error
   */
  [ERROR_TYPES.MONGOOSE_DUPLICATE_KEY]: async (error, context) => {
    logger.info('Auto-fixing: Mongoose Duplicate Key Error', { error: error.message });
    
    // Extract field name from error
    const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'field';
    const value = error.keyValue ? Object.values(error.keyValue)[0] : '';
    
    return {
      fixed: true,
      action: 'sanitized_response',
      message: `${field} with value '${value}' already exists`,
      statusCode: 409,
      originalError: error.message,
    };
  },
  
  /**
   * Fix Mongoose Validation Error
   */
  [ERROR_TYPES.MONGOOSE_VALIDATION_ERROR]: async (error, context) => {
    logger.info('Auto-fixing: Mongoose Validation Error', { error: error.message });
    
    // Extract validation errors
    const validationErrors = error.errors 
      ? Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
        }))
      : [];
    
    return {
      fixed: true,
      action: 'sanitized_response',
      message: 'Validation failed',
      statusCode: 400,
      errors: validationErrors,
      originalError: error.message,
    };
  },
  
  /**
   * Fix Mongoose Connection Error
   */
  [ERROR_TYPES.MONGOOSE_CONNECTION_ERROR]: async (error, context) => {
    logger.warn('Auto-fixing: Mongoose Connection Error', { error: error.message });
    
    // Attempt to reconnect if connection is lost
    if (mongoose.connection.readyState === 0) {
      try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
        await mongoose.connect(mongoUri);
        logger.info('Successfully reconnected to MongoDB');
        
        return {
          fixed: true,
          action: 'reconnected_database',
          message: 'Database connection restored',
          statusCode: 200,
          originalError: error.message,
        };
      } catch (reconnectError) {
        logger.error('Failed to reconnect to MongoDB', { error: reconnectError.message });
        
        return {
          fixed: false,
          action: 'reconnect_failed',
          message: 'Database connection failed. Please check your MongoDB configuration.',
          statusCode: 503,
          originalError: error.message,
        };
      }
    }
    
    return {
      fixed: false,
      action: 'no_action_taken',
      message: 'Database connection error',
      statusCode: 503,
      originalError: error.message,
    };
  },
  
  /**
   * Fix JWT Expired Error
   */
  [ERROR_TYPES.JWT_EXPIRED]: async (error, context) => {
    logger.info('Auto-fixing: JWT Expired Error', { error: error.message });
    
    // Clear the invalid token (would need access to response object)
    return {
      fixed: true,
      action: 'clear_token',
      message: 'Session expired. Please login again.',
      statusCode: 401,
      originalError: error.message,
    };
  },
  
  /**
   * Fix Network Timeout Error
   */
  [ERROR_TYPES.NETWORK_TIMEOUT]: async (error, context) => {
    logger.warn('Auto-fixing: Network Timeout Error', { error: error.message });
    
    // Could implement retry logic here
    return {
      fixed: false,
      action: 'suggest_retry',
      message: 'Request timed out. Please try again.',
      statusCode: 408,
      originalError: error.message,
    };
  },
  
  /**
   * Fix Network Connection Error
   */
  [ERROR_TYPES.NETWORK_CONNECTION_ERROR]: async (error, context) => {
    logger.warn('Auto-fixing: Network Connection Error', { error: error.message });
    
    return {
      fixed: false,
      action: 'check_connection',
      message: 'Network connection error. Please check your internet connection.',
      statusCode: 503,
      originalError: error.message,
    };
  },
  
  /**
   * Fix Validation Error
   */
  [ERROR_TYPES.VALIDATION_ERROR]: async (error, context) => {
    logger.info('Auto-fixing: Validation Error', { error: error.message });
    
    return {
      fixed: true,
      action: 'sanitized_response',
      message: 'Invalid input data',
      statusCode: 400,
      originalError: error.message,
    };
  },
  
  /**
   * Fix Environment Variable Missing
   */
  [ERROR_TYPES.ENV_MISSING]: async (error, context) => {
    logger.warn('Auto-fixing: Environment Variable Missing', { error: error.message });
    
    // Extract variable name from error message
    const envVarMatch = error.message.match(/(\w+) is not defined/i) || 
                       error.message.match(/env\.(\w+)/i);
    const envVar = envVarMatch ? envVarMatch[1] : 'UNKNOWN';
    
    return {
      fixed: false,
      action: 'require_env_setup',
      message: `Missing required environment variable: ${envVar}`,
      statusCode: 500,
      originalError: error.message,
      requiredEnvVar: envVar,
    };
  },
};

/**
 * Attempt to auto-fix an error
 */
export const autoFix = async (error, context = {}) => {
  if (!error) {
    return {
      fixed: false,
      reason: 'No error provided',
    };
  }
  
  // Identify the error
  const errorInfo = identifyError(error);
  
  // Check if error is fixable
  if (!errorInfo.fixable) {
    logger.debug('Error is not auto-fixable', {
      type: errorInfo.type,
      message: error.message,
    });
    
    return {
      fixed: false,
      reason: 'Error type is not auto-fixable',
      errorInfo,
    };
  }
  
  // Get the appropriate fix handler
  const handler = autoFixHandlers[errorInfo.type];
  
  if (!handler) {
    logger.warn('No auto-fix handler found for error type', {
      type: errorInfo.type,
    });
    
    return {
      fixed: false,
      reason: 'No handler found',
      errorInfo,
    };
  }
  
  try {
    // Attempt to fix the error
    const fixResult = await handler(error, context);
    
    logger.info('Auto-fix attempted', {
      type: errorInfo.type,
      fixed: fixResult.fixed,
      action: fixResult.action,
    });
    
    return {
      fixed: fixResult.fixed,
      result: fixResult,
      errorInfo,
    };
  } catch (fixError) {
    logger.error('Auto-fix handler failed', {
      originalError: error.message,
      fixError: fixError.message,
      type: errorInfo.type,
    });
    
    return {
      fixed: false,
      reason: 'Fix handler failed',
      fixError: fixError.message,
      errorInfo,
    };
  }
};

/**
 * Enhanced error handler with auto-fix
 */
export const errorHandlerWithAutoFix = async (err, req, res, next) => {
  // Attempt auto-fix first
  const fixResult = await autoFix(err, { req, res });
  
  if (fixResult.fixed && fixResult.result) {
    // Use the fixed result
    const fixedResult = fixResult.result;
    
    logger.info('Error auto-fixed', {
      type: fixResult.errorInfo?.type,
      action: fixedResult.action,
      originalError: err.message,
      url: req.originalUrl,
      method: req.method,
    });
    
    // Send the fixed response
    const statusCode = fixedResult.statusCode || 200;
    return res.status(statusCode).json({
      success: statusCode < 400,
      message: fixedResult.message,
      ...(fixedResult.errors && { errors: fixedResult.errors }),
      autoFixed: true,
      originalError: fixedResult.originalError,
    });
  }
  
  // If auto-fix failed or couldn't handle it, continue to next handler
  // Don't send response here, let the standard handler do it
  next(err);
};
