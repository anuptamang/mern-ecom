import axios from 'axios';
import store from 'redux/store';
import { signOut } from 'redux/slice';
import { getToken, removeToken } from 'utils/localStorage';
import { message } from 'antd';

// Set up axios interceptor for handling 401 responses and auto-logout
let isLoggingOut = false;

axios.interceptors.response.use(
  (response) => {
    // If response is successful, return it
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized responses
    if (error?.response?.status === 401) {
      // Don't auto-logout for auth endpoints (login/register) - let them handle the error
      const requestUrl = error?.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/user/login') || requestUrl.includes('/user/register') || requestUrl.includes('/user/check-user');
      
      if (isAuthEndpoint) {
        // For auth endpoints, just reject the promise - let the login/register handlers deal with it
        return Promise.reject(error);
      }
      
      const token = getToken();
      
      // Check if this is a cart endpoint - if so, don't redirect when no token
      // Let the component handle it with the auth modal
      const isCartEndpoint = requestUrl.includes('/carts/');
      
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
          await axios.get(`${AUTH_API}/${currentUser._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error: any) {
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
