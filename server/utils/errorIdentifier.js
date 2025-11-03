/**
 * Error Identification and Classification System
 * 
 * Identifies and classifies errors for automatic fixing
 */

export const ERROR_TYPES = {
  // Database Errors
  MONGOOSE_CAST_ERROR: 'MONGOOSE_CAST_ERROR',
  MONGOOSE_DUPLICATE_KEY: 'MONGOOSE_DUPLICATE_KEY',
  MONGOOSE_VALIDATION_ERROR: 'MONGOOSE_VALIDATION_ERROR',
  MONGOOSE_CONNECTION_ERROR: 'MONGOOSE_CONNECTION_ERROR',
  
  // Authentication Errors
  JWT_INVALID: 'JWT_INVALID',
  JWT_EXPIRED: 'JWT_EXPIRED',
  JWT_MISSING: 'JWT_MISSING',
  
  // Network Errors
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_CONNECTION_ERROR: 'NETWORK_CONNECTION_ERROR',
  
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource Errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Configuration Errors
  ENV_MISSING: 'ENV_MISSING',
  CONFIG_INVALID: 'CONFIG_INVALID',
  
  // Unknown Errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Identify error type from error object
 */
export const identifyError = (error) => {
  if (!error) return { type: ERROR_TYPES.UNKNOWN_ERROR, fixable: false };
  
  const errorString = JSON.stringify(error).toLowerCase();
  const message = (error.message || '').toLowerCase();
  const name = (error.name || '').toLowerCase();
  const code = error.code;
  
  // Mongoose Cast Error (invalid ObjectId)
  if (name === 'casterror' || message.includes('cast to') || message.includes('invalid id')) {
    return {
      type: ERROR_TYPES.MONGOOSE_CAST_ERROR,
      fixable: true,
      severity: 'medium',
      category: 'database',
    };
  }
  
  // Mongoose Duplicate Key
  if (code === 11000 || message.includes('duplicate') || message.includes('e11000')) {
    return {
      type: ERROR_TYPES.MONGOOSE_DUPLICATE_KEY,
      fixable: true,
      severity: 'medium',
      category: 'database',
      details: error.keyPattern || error.keyValue,
    };
  }
  
  // Mongoose Validation Error
  if (name === 'validationerror' || message.includes('validation')) {
    return {
      type: ERROR_TYPES.MONGOOSE_VALIDATION_ERROR,
      fixable: true,
      severity: 'medium',
      category: 'database',
      details: error.errors,
    };
  }
  
  // Mongoose Connection Error
  if (name === 'mongoneteerror' || 
      message.includes('mongodb') || 
      message.includes('connection') ||
      message.includes('connect econnrefused')) {
    return {
      type: ERROR_TYPES.MONGOOSE_CONNECTION_ERROR,
      fixable: true,
      severity: 'high',
      category: 'database',
    };
  }
  
  // JWT Errors
  if (name === 'jsonwebtokenerror' || message.includes('jwt') || message.includes('token')) {
    if (message.includes('expired')) {
      return {
        type: ERROR_TYPES.JWT_EXPIRED,
        fixable: true,
        severity: 'low',
        category: 'authentication',
      };
    }
    if (message.includes('invalid') || message.includes('malformed')) {
      return {
        type: ERROR_TYPES.JWT_INVALID,
        fixable: false,
        severity: 'medium',
        category: 'authentication',
      };
    }
    return {
      type: ERROR_TYPES.JWT_MISSING,
      fixable: false,
      severity: 'low',
      category: 'authentication',
    };
  }
  
  // Network Timeout
  if (message.includes('timeout') || code === 'ECONNABORTED' || code === 'ETIMEDOUT') {
    return {
      type: ERROR_TYPES.NETWORK_TIMEOUT,
      fixable: true,
      severity: 'medium',
      category: 'network',
    };
  }
  
  // Network Connection Error
  if (message.includes('network') || 
      code === 'ECONNREFUSED' || 
      code === 'ENOTFOUND' ||
      message.includes('econnrefused')) {
    return {
      type: ERROR_TYPES.NETWORK_CONNECTION_ERROR,
      fixable: true,
      severity: 'high',
      category: 'network',
    };
  }
  
  // Validation Errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return {
      type: ERROR_TYPES.VALIDATION_ERROR,
      fixable: true,
      severity: 'low',
      category: 'validation',
    };
  }
  
  // Resource Not Found
  if (message.includes('not found') || error.statusCode === 404) {
    return {
      type: ERROR_TYPES.RESOURCE_NOT_FOUND,
      fixable: false,
      severity: 'low',
      category: 'resource',
    };
  }
  
  // Permission Denied
  if (message.includes('permission') || 
      message.includes('forbidden') || 
      message.includes('unauthorized') ||
      error.statusCode === 403 ||
      error.statusCode === 401) {
    return {
      type: ERROR_TYPES.PERMISSION_DENIED,
      fixable: false,
      severity: 'medium',
      category: 'resource',
    };
  }
  
  // Environment Variable Missing
  if (message.includes('env') || 
      message.includes('environment') || 
      message.includes('undefined') ||
      error.message?.includes('is not defined')) {
    return {
      type: ERROR_TYPES.ENV_MISSING,
      fixable: true,
      severity: 'high',
      category: 'configuration',
    };
  }
  
  // Default: Unknown Error
  return {
    type: ERROR_TYPES.UNKNOWN_ERROR,
    fixable: false,
    severity: 'high',
    category: 'unknown',
  };
};
