/**
 * Client-side Error Identification and Classification System
 * 
 * Identifies and classifies errors for automatic fixing
 */

export enum ERROR_TYPES {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  
  // API Errors
  API_401_UNAUTHORIZED = 'API_401_UNAUTHORIZED',
  API_403_FORBIDDEN = 'API_403_FORBIDDEN',
  API_404_NOT_FOUND = 'API_404_NOT_FOUND',
  API_500_SERVER_ERROR = 'API_500_SERVER_ERROR',
  
  // Authentication Errors
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_MISSING = 'TOKEN_MISSING',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Browser Errors
  CORS_ERROR = 'CORS_ERROR',
  SSL_ERROR = 'SSL_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Component Errors
  COMPONENT_ERROR = 'COMPONENT_ERROR',
  IMAGE_LOAD_ERROR = 'IMAGE_LOAD_ERROR',
  
  // Unknown Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ErrorInfo {
  type: ERROR_TYPES;
  fixable: boolean;
  severity: 'low' | 'medium' | 'high';
  category: string;
  details?: any;
}

/**
 * Identify error type from error object
 */
export const identifyError = (error: any): ErrorInfo => {
  if (!error) {
    return {
      type: ERROR_TYPES.UNKNOWN_ERROR,
      fixable: false,
      severity: 'high',
      category: 'unknown',
    };
  }
  
  const message = (error.message || '').toLowerCase();
  const code = error.code || error.status;
  const name = (error.name || '').toLowerCase();
  
  // Network Offline
  if (!navigator.onLine || message.includes('network') || message.includes('offline')) {
    return {
      type: ERROR_TYPES.NETWORK_OFFLINE,
      fixable: true,
      severity: 'medium',
      category: 'network',
    };
  }
  
  // Network Timeout
  if (message.includes('timeout') || 
      code === 'ECONNABORTED' || 
      code === 'ETIMEDOUT' ||
      error.config?.timeout) {
    return {
      type: ERROR_TYPES.NETWORK_TIMEOUT,
      fixable: true,
      severity: 'medium',
      category: 'network',
    };
  }
  
  // Network Error (no response)
  if (!error.response && (message.includes('network') || code === 'ERR_NETWORK')) {
    return {
      type: ERROR_TYPES.NETWORK_ERROR,
      fixable: true,
      severity: 'medium',
      category: 'network',
    };
  }
  
  // API 401 Unauthorized
  if (code === 401 || error.response?.status === 401 || message.includes('unauthorized')) {
    return {
      type: ERROR_TYPES.API_401_UNAUTHORIZED,
      fixable: true,
      severity: 'medium',
      category: 'authentication',
    };
  }
  
  // API 403 Forbidden
  if (code === 403 || error.response?.status === 403 || message.includes('forbidden')) {
    return {
      type: ERROR_TYPES.API_403_FORBIDDEN,
      fixable: false,
      severity: 'medium',
      category: 'authorization',
    };
  }
  
  // API 404 Not Found
  if (code === 404 || error.response?.status === 404 || message.includes('not found')) {
    return {
      type: ERROR_TYPES.API_404_NOT_FOUND,
      fixable: false,
      severity: 'low',
      category: 'resource',
    };
  }
  
  // API 500 Server Error
  if (code === 500 || error.response?.status === 500 || message.includes('server error')) {
    return {
      type: ERROR_TYPES.API_500_SERVER_ERROR,
      fixable: true,
      severity: 'high',
      category: 'server',
    };
  }
  
  // Token Expired
  if (message.includes('token expired') || 
      message.includes('session expired') ||
      message.includes('jwt expired')) {
    return {
      type: ERROR_TYPES.TOKEN_EXPIRED,
      fixable: true,
      severity: 'low',
      category: 'authentication',
    };
  }
  
  // Token Invalid
  if (message.includes('invalid token') || 
      message.includes('token invalid') ||
      message.includes('jwt')) {
    return {
      type: ERROR_TYPES.TOKEN_INVALID,
      fixable: true,
      severity: 'medium',
      category: 'authentication',
    };
  }
  
  // CORS Error
  if (message.includes('cors') || 
      message.includes('cross-origin') ||
      name === 'corserror') {
    return {
      type: ERROR_TYPES.CORS_ERROR,
      fixable: false,
      severity: 'high',
      category: 'browser',
    };
  }
  
  // SSL Error
  if (message.includes('ssl') || 
      message.includes('certificate') ||
      name === 'sslerror') {
    return {
      type: ERROR_TYPES.SSL_ERROR,
      fixable: false,
      severity: 'high',
      category: 'browser',
    };
  }
  
  // Image Load Error
  if (error.target?.tagName === 'IMG' || 
      message.includes('image') ||
      message.includes('img')) {
    return {
      type: ERROR_TYPES.IMAGE_LOAD_ERROR,
      fixable: true,
      severity: 'low',
      category: 'component',
    };
  }
  
  // Validation Error
  if (message.includes('validation') || 
      message.includes('invalid') ||
      message.includes('required')) {
    return {
      type: ERROR_TYPES.VALIDATION_ERROR,
      fixable: true,
      severity: 'low',
      category: 'validation',
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
