import axios from 'axios';
import store from 'redux/store';
import { signOut } from 'redux/slice';
import { getToken, removeToken } from 'utils/localStorage';
import { message } from 'antd';

// Get application token from environment
const getApplicationToken = (): string | undefined => {
  return process.env.REACT_APP_APPLICATION_TOKEN || process.env.REACT_APP_API_KEY;
};

// Set up request interceptor to add X-API-Key header to all requests
axios.interceptors.request.use(
  (config) => {
    // Add application token (X-API-Key) to all requests
    const applicationToken = getApplicationToken();
    if (applicationToken) {
      config.headers['X-API-Key'] = applicationToken;
    } else {
      // Log warning if token is missing (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('X-API-Key header not added - REACT_APP_APPLICATION_TOKEN not set in environment');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Set up axios interceptor for handling 401 responses and auto-logout
let isLoggingOut = false;
let lastLoginTime = 0; // Track when user last logged in
const LOGIN_GRACE_PERIOD = 10000; // 10 seconds grace period after login

// Track successful login
export const setLastLoginTime = () => {
  lastLoginTime = Date.now();
  console.log('Login time set for grace period:', lastLoginTime);
};

axios.interceptors.response.use(
  (response) => {
    // If response is successful, return it
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized responses
    if (error?.response?.status === 401) {
      const requestUrl = error?.config?.url || '';
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || '';
      
      // Check if this is an application token error (not authentication error)
      const isApplicationTokenError = errorMessage.includes('Application token') || 
                                      errorMessage.includes('X-API-Key') ||
                                      errorMessage.includes('application token');
      
      if (isApplicationTokenError) {
        // Application token error - don't logout, just show error
        console.error('Application token error:', errorMessage);
        message.error('API configuration error. Please contact support.');
        return Promise.reject(error);
      }
      
      // Don't auto-logout for auth endpoints (login/register) - let them handle the error
      const isAuthEndpoint = requestUrl.includes('/user/login') || 
                              requestUrl.includes('/user/register') || 
                              requestUrl.includes('/user/check-user');
      
      if (isAuthEndpoint) {
        // For auth endpoints, just reject the promise - let the login/register handlers deal with it
        return Promise.reject(error);
      }
      
      const token = getToken();
      
      // Check if this is a cart endpoint - if so, don't redirect when no token
      // Let the component handle it with the auth modal
      const isCartEndpoint = requestUrl.includes('/carts/');
      
      // Grace period after login - don't logout immediately after login
      const timeSinceLogin = lastLoginTime > 0 ? Date.now() - lastLoginTime : Infinity;
      const isInGracePeriod = timeSinceLogin < LOGIN_GRACE_PERIOD;
      
      // Additional check: if we just logged in and this is a profile/user endpoint, don't logout
      // This handles cases where profile fetch happens immediately after login
      const isUserProfileEndpoint = requestUrl.includes('/user/') && 
                                     (requestUrl.includes('/profile') || 
                                      requestUrl.includes('/profile-completion') ||
                                      requestUrl.match(/\/user\/[a-f0-9]{24}$/)); // User ID endpoint
      
      if (isInGracePeriod || (isUserProfileEndpoint && timeSinceLogin < LOGIN_GRACE_PERIOD * 2)) {
        // Just logged in - don't logout, just reject the error
        console.warn('Request failed during login grace period, not logging out:', {
          url: requestUrl,
          error: errorMessage,
          timeSinceLogin: timeSinceLogin,
          isUserProfileEndpoint,
        });
        return Promise.reject(error);
      }
      
      // Only logout if we have a token (meaning user was logged in)
      if (token && !isLoggingOut) {
        isLoggingOut = true;
        
        // Dispatch logout action
        store.dispatch(signOut());
        
        // Clear token from localStorage
        removeToken();
        
        // Show message to user
        message.warning('Your session has expired. Please log in again.');
        
        // Redirect to login page immediately
        window.location.href = '/login';
        
        // Reset flag after redirect
        setTimeout(() => {
          isLoggingOut = false;
        }, 1000);
      } else if (!token && !isCartEndpoint) {
        // No token, redirect to login (but not for cart endpoints - let modal handle it)
        message.warning('Please log in to continue.');
        window.location.href = '/login';
      } else if (!token && isCartEndpoint) {
        // For cart endpoints without token, just reject the promise
        // The component will handle showing the auth modal
        // Don't show warning message here - let the component handle UX
      }
      
      // Reject the promise with error
      return Promise.reject(error);
    }
    
    // For other errors, just pass them through
    return Promise.reject(error);
  }
);

// Periodic token validation (every 5 minutes)
let tokenValidationInterval: NodeJS.Timeout | null = null;

export const startTokenValidation = () => {
  // Clear any existing interval
  if (tokenValidationInterval) {
    clearInterval(tokenValidationInterval);
  }
  
  // Don't start validation immediately - wait 30 seconds after login to avoid immediate logout
  // This gives time for the token to be properly set and the user to be fully authenticated
  setTimeout(() => {
    // Set up periodic validation every 5 minutes
    tokenValidationInterval = setInterval(async () => {
    const token = getToken();
    if (!token) {
      // No token, clear interval
      if (tokenValidationInterval) {
        clearInterval(tokenValidationInterval);
        tokenValidationInterval = null;
      }
      return;
    }
    
    // Check if token is expired
    try {
      const { isTokenValid } = await import('utils/isTokenValid');
      if (!isTokenValid(token)) {
        // Token is expired, logout
        if (!isLoggingOut) {
          isLoggingOut = true;
          store.dispatch(signOut());
          removeToken();
          message.warning('Your session has expired. Please log in again.');
          setTimeout(() => {
            window.location.href = '/login';
            isLoggingOut = false;
          }, 1000);
        }
        if (tokenValidationInterval) {
          clearInterval(tokenValidationInterval);
          tokenValidationInterval = null;
        }
        return;
      }
      
      // Validate token with backend by making a lightweight request
      const { AUTH_API } = await import('services/servicesConstants');
      const currentUser = store.getState().auth.result;
      
      if (currentUser?._id) {
        try {
          // Try to fetch user profile - if this fails with 401, user doesn't exist or token is invalid
          // Note: X-API-Key header is automatically added by the request interceptor
          await axios.get(`${AUTH_API}/${currentUser._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error: any) {
          // Check if this is an application token error (not authentication error)
          const errorMessage = error?.response?.data?.error || error?.response?.data?.message || '';
          const isApplicationTokenError = errorMessage.includes('Application token') || 
                                          errorMessage.includes('X-API-Key') ||
                                          errorMessage.includes('application token');
          
          // Don't logout on application token errors - just log it
          if (isApplicationTokenError) {
            console.error('Application token error during token validation:', errorMessage);
            return; // Don't logout, just skip this validation
          }
          
          // If 401 or 404, user doesn't exist or token is invalid - logout
          if (error?.response?.status === 401 || error?.response?.status === 404) {
            if (!isLoggingOut) {
              isLoggingOut = true;
              store.dispatch(signOut());
              removeToken();
              message.warning('Your account is no longer valid. Please log in again.');
              setTimeout(() => {
                window.location.href = '/login';
                isLoggingOut = false;
              }, 1000);
            }
            if (tokenValidationInterval) {
              clearInterval(tokenValidationInterval);
              tokenValidationInterval = null;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error validating token:', error);
    }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }, 30 * 1000); // Wait 30 seconds before starting validation
};

export const stopTokenValidation = () => {
  if (tokenValidationInterval) {
    clearInterval(tokenValidationInterval);
    tokenValidationInterval = null;
  }
};
