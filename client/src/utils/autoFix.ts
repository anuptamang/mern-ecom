/**
 * Client-side Auto-Fix System
 * 
 * Automatically fixes identified errors when possible
 */

import { identifyError, ERROR_TYPES, ErrorInfo } from './errorIdentifier';
import { removeToken } from './localStorage';
import { message } from 'antd';

interface FixResult {
  fixed: boolean;
  action: string;
  message?: string;
  retry?: boolean;
  redirect?: string;
}

/**
 * Auto-fix error handlers
 */
const autoFixHandlers: Record<ERROR_TYPES, (error: any, context?: any) => Promise<FixResult> | FixResult> = {
  /**
   * Fix Network Offline Error
   */
  [ERROR_TYPES.NETWORK_OFFLINE]: async (error) => {
    // Check if we're back online
    if (navigator.onLine) {
      return {
        fixed: true,
        action: 'retry_request',
        message: 'Connection restored',
        retry: true,
      };
    }
    
    return {
      fixed: false,
      action: 'show_offline_message',
      message: 'You are offline. Please check your internet connection.',
    };
  },
  
  /**
   * Fix Network Timeout Error
   */
  [ERROR_TYPES.NETWORK_TIMEOUT]: async (error, context) => {
    // Could implement retry logic with exponential backoff
    return {
      fixed: true,
      action: 'suggest_retry',
      message: 'Request timed out. You can try again.',
      retry: true,
    };
  },
  
  /**
   * Fix Network Error
   */
  [ERROR_TYPES.NETWORK_ERROR]: async (error, context) => {
    // Retry the request if it's a network error
    if (navigator.onLine) {
      return {
        fixed: true,
        action: 'retry_request',
        message: 'Network error. Retrying...',
        retry: true,
      };
    }
    
    return {
      fixed: false,
      action: 'show_network_error',
      message: 'Network error. Please check your connection.',
    };
  },
  
  /**
   * Fix 401 Unauthorized Error
   */
  [ERROR_TYPES.API_401_UNAUTHORIZED]: async (error) => {
    // Clear token and redirect to login
    removeToken();
    
    // Store the current location for redirect after login
    const returnUrl = window.location.pathname;
    sessionStorage.setItem('returnUrl', returnUrl);
    
    return {
      fixed: true,
      action: 'clear_token_and_redirect',
      message: 'Session expired. Redirecting to login...',
      redirect: '/login',
    };
  },
  
  /**
   * Fix Token Expired Error
   */
  [ERROR_TYPES.TOKEN_EXPIRED]: async (error) => {
    removeToken();
    
    return {
      fixed: true,
      action: 'clear_token_and_redirect',
      message: 'Session expired. Please login again.',
      redirect: '/login',
    };
  },
  
  /**
   * Fix Token Invalid Error
   */
  [ERROR_TYPES.TOKEN_INVALID]: async (error) => {
    removeToken();
    
    return {
      fixed: true,
      action: 'clear_token_and_redirect',
      message: 'Invalid session. Please login again.',
      redirect: '/login',
    };
  },
  
  /**
   * Fix 500 Server Error
   */
  [ERROR_TYPES.API_500_SERVER_ERROR]: async (error, context) => {
    // Could implement retry with exponential backoff
    return {
      fixed: true,
      action: 'suggest_retry',
      message: 'Server error occurred. You can try again in a moment.',
      retry: true,
    };
  },
  
  /**
   * Fix Image Load Error
   */
  [ERROR_TYPES.IMAGE_LOAD_ERROR]: async (error) => {
    // Image errors are already handled by ProductImage component
    // Just return that it's handled
    return {
      fixed: true,
      action: 'use_placeholder',
      message: 'Image failed to load. Using placeholder.',
    };
  },
  
  /**
   * Fix Validation Error
   */
  [ERROR_TYPES.VALIDATION_ERROR]: async (error) => {
    // Validation errors should be shown to user
    return {
      fixed: true,
      action: 'show_validation_message',
      message: error.response?.data?.message || 'Please check your input.',
    };
  },
  
  // Non-fixable errors
  [ERROR_TYPES.API_403_FORBIDDEN]: async (error) => ({
    fixed: false,
    action: 'show_error',
    message: 'You do not have permission to perform this action.',
  }),
  
  [ERROR_TYPES.API_404_NOT_FOUND]: async (error) => ({
    fixed: false,
    action: 'show_error',
    message: 'Resource not found.',
  }),
  
  [ERROR_TYPES.TOKEN_MISSING]: async (error) => ({
    fixed: false,
    action: 'redirect_to_login',
    message: 'Please login to continue.',
    redirect: '/login',
  }),
  
  [ERROR_TYPES.MISSING_REQUIRED_FIELD]: async (error) => ({
    fixed: false,
    action: 'show_validation_message',
    message: 'Please fill in all required fields.',
  }),
  
  [ERROR_TYPES.CORS_ERROR]: async (error) => ({
    fixed: false,
    action: 'show_error',
    message: 'CORS error. Please contact support.',
  }),
  
  [ERROR_TYPES.SSL_ERROR]: async (error) => ({
    fixed: false,
    action: 'show_error',
    message: 'SSL certificate error. Please contact support.',
  }),
  
  [ERROR_TYPES.QUOTA_EXCEEDED]: async (error) => ({
    fixed: false,
    action: 'show_error',
    message: 'Storage quota exceeded. Please clear some space.',
  }),
  
  [ERROR_TYPES.COMPONENT_ERROR]: async (error) => ({
    fixed: false,
    action: 'show_error',
    message: 'Component error occurred. Please refresh the page.',
  }),
  
  [ERROR_TYPES.UNKNOWN_ERROR]: async (error) => ({
    fixed: false,
    action: 'show_error',
    message: 'An unexpected error occurred. Please try again.',
  }),
};

/**
 * Attempt to auto-fix an error
 */
export const autoFix = async (error: any, context?: any): Promise<FixResult & { errorInfo: ErrorInfo }> => {
  if (!error) {
    return {
      fixed: false,
      action: 'no_error',
      errorInfo: {
        type: ERROR_TYPES.UNKNOWN_ERROR,
        fixable: false,
        severity: 'high',
        category: 'unknown',
      },
    };
  }
  
  // Identify the error
  const errorInfo = identifyError(error);
  
  // Check if error is fixable
  if (!errorInfo.fixable) {
    return {
      fixed: false,
      action: 'not_fixable',
      message: 'This error cannot be automatically fixed.',
      errorInfo,
    };
  }
  
  // Get the appropriate fix handler
  const handler = autoFixHandlers[errorInfo.type];
  
  if (!handler) {
    return {
      fixed: false,
      action: 'no_handler',
      message: 'No fix handler available for this error type.',
      errorInfo,
    };
  }
  
  try {
    // Attempt to fix the error
    const fixResult = await handler(error, context);
    
    return {
      ...fixResult,
      errorInfo,
    };
  } catch (fixError) {
    console.error('Auto-fix handler failed', {
      originalError: error,
      fixError,
      errorInfo,
    });
    
    return {
      fixed: false,
      action: 'handler_failed',
      message: 'Failed to apply auto-fix.',
      errorInfo,
    };
  }
};

/**
 * Apply auto-fix result
 */
export const applyAutoFix = (fixResult: FixResult & { errorInfo: ErrorInfo }) => {
  if (!fixResult.fixed) {
    // Show error message if fix failed
    if (fixResult.message) {
      message.error(fixResult.message);
    }
    return;
  }
  
  // Handle different fix actions
  switch (fixResult.action) {
    case 'clear_token_and_redirect':
      if (fixResult.redirect) {
        setTimeout(() => {
          window.location.href = fixResult.redirect!;
        }, 1500);
      }
      break;
    
    case 'redirect_to_login':
      if (fixResult.redirect) {
        window.location.href = fixResult.redirect;
      }
      break;
    
    case 'show_validation_message':
    case 'show_offline_message':
    case 'show_network_error':
    case 'show_error':
      if (fixResult.message) {
        message.warning(fixResult.message);
      }
      break;
    
    case 'suggest_retry':
      if (fixResult.message) {
        message.info(fixResult.message);
      }
      break;
    
    case 'retry_request':
      if (fixResult.message) {
        message.info(fixResult.message);
      }
      // Retry logic would be implemented by the caller
      break;
    
    default:
      if (fixResult.message) {
        message.success(fixResult.message);
      }
  }
};
