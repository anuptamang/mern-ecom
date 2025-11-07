/**
 * API Configuration
 * Centralized API endpoint configuration
 */

// Determine API URL based on environment
const getApiUrl = (): string => {
  // Check for environment variable (supports both naming conventions)
  let baseUrl = '';
  
  if (process.env.REACT_APP_BACKEND_API_URL) {
    // Use REACT_APP_BACKEND_API_URL as-is (user can include /api/v1 in the URL)
    baseUrl = process.env.REACT_APP_BACKEND_API_URL;
  } else if (process.env.REACT_APP_API_URL) {
    baseUrl = process.env.REACT_APP_API_URL;
  } else if (process.env.NODE_ENV === 'development') {
    // In development, default to localhost:3010/api/v1
    baseUrl = 'http://localhost:3010/api/v1';
  } else {
    // Fallback
    baseUrl = `${window.location.origin.replace(':3000', ':3010')}/api/v1`;
  }

  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // If URL doesn't include /api/, add /api/v1 prefix (backward compatibility)
  if (!baseUrl.includes('/api/')) {
    const apiVersion = process.env.REACT_APP_API_VERSION || 'v1';
    baseUrl = `${baseUrl}/api/${apiVersion}`;
  }

  return baseUrl;
};

export const BACKEND_API = getApiUrl();

// Get application token from environment
const getApplicationToken = (): string | undefined => {
  return process.env.REACT_APP_APPLICATION_TOKEN || process.env.REACT_APP_API_KEY;
};

export const API_CONFIG = {
  baseURL: BACKEND_API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    ...(getApplicationToken() && { 'X-API-Key': getApplicationToken() }),
  },
} as const;
