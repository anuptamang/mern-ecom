/**
 * API Configuration
 * Centralized API endpoint configuration
 */

// Determine API URL based on environment
const getApiUrl = (): string => {
  // Check for environment variable (supports both naming conventions)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  if (process.env.REACT_APP_BACKEND_API_URL) {
    return process.env.REACT_APP_BACKEND_API_URL;
  }

  // In development, default to localhost:3010
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3010';
  }

  // Fallback
  return window.location.origin.replace(':3000', ':3010');
};

export const BACKEND_API = getApiUrl();

export const API_CONFIG = {
  baseURL: BACKEND_API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;
