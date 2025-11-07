// Get application token from environment
const getApplicationToken = (): string | undefined => {
  return process.env.REACT_APP_APPLICATION_TOKEN || process.env.REACT_APP_API_KEY;
};

export const configHeaders = (token: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add application token (X-API-Key) to all requests
  const applicationToken = getApplicationToken();
  if (applicationToken) {
    headers['X-API-Key'] = applicationToken;
  }
  
  // Add JWT token (Authorization) if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return {
    headers,
  };
};

export const multiPartConfigHeaders = (token: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
  };
  
  // Add application token (X-API-Key) to all requests
  const applicationToken = getApplicationToken();
  if (applicationToken) {
    headers['X-API-Key'] = applicationToken;
  }
  
  // Add JWT token (Authorization) if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return {
    headers,
  };
}