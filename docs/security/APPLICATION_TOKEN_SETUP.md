# Application Token Setup Guide

## Where to Put the Application Token

The `APPLICATION_TOKEN` must be set in **both** the server and client environment files, but with different variable names:

### 1. Server (`server/.env`)

```env
# Application Token (REQUIRED)
APPLICATION_TOKEN=your-secure-application-token-here
```

**Location**: `server/.env`  
**Variable Name**: `APPLICATION_TOKEN`  
**Purpose**: Server uses this to verify the `X-API-Key` header from client requests

### 2. Client (`client/.env`)

```env
# Application Token (REQUIRED)
# React requires REACT_APP_ prefix for environment variables
REACT_APP_APPLICATION_TOKEN=your-secure-application-token-here

# Backend API URL (REQUIRED)
# Include /api/v1 in the URL for simplicity
REACT_APP_BACKEND_API_URL=http://localhost:3010/api/v1

# Alternative: You can also use REACT_APP_API_KEY
# REACT_APP_API_KEY=your-secure-application-token-here
```

**Location**: `client/.env`  
**Variable Name**:

- `REACT_APP_APPLICATION_TOKEN` or `REACT_APP_API_KEY` - For application token
- `REACT_APP_BACKEND_API_URL` - For API URL (include `/api/v1` in the URL)

**Purpose**:

- `REACT_APP_APPLICATION_TOKEN` - Client uses this to send the `X-API-Key` header with all API requests
- `REACT_APP_BACKEND_API_URL` - Base API URL (should include `/api/v1` for simplicity)

## Important Notes

1. **Same Value**: Both tokens must have the **exact same value**

   - `APPLICATION_TOKEN` in `server/.env` = `REACT_APP_APPLICATION_TOKEN` in `client/.env`

2. **React Prefix**: React only exposes environment variables that start with `REACT_APP_`, so the client must use `REACT_APP_APPLICATION_TOKEN` or `REACT_APP_API_KEY`

3. **Security**: Never commit `.env` files to git. They should be in `.gitignore`

## Setup Steps

### Step 1: Generate a Secure Token

```bash
# Generate a secure random token (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output something like:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Step 2: Set Server Token

Create or edit `server/.env`:

```env
APPLICATION_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Step 3: Set Client Token and API URL

Create or edit `client/.env`:

```env
REACT_APP_APPLICATION_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
REACT_APP_BACKEND_API_URL=http://localhost:3010/api/v1
```

**Note**: Include `/api/v1` in the `REACT_APP_BACKEND_API_URL` for simplicity. The client will use it as-is.

### Step 4: Restart Servers

After setting the tokens, restart both servers:

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm start
```

## How It Works

1. **Client Request**:

   - Client reads `REACT_APP_APPLICATION_TOKEN` from `client/.env`
   - Automatically adds `X-API-Key: <token>` header to all API requests
   - This happens in `client/src/utils/apiClient.ts` and `client/src/configs/axios/axiosInterceptor.ts`

2. **Server Verification**:
   - Server reads `APPLICATION_TOKEN` from `server/.env`
   - Middleware (`server/middlewares/applicationToken.js`) verifies the `X-API-Key` header
   - If tokens match, request proceeds; if not, returns 401 Unauthorized

## Troubleshooting

### Error: "Unauthorized - Application token required"

**Cause**: Client is not sending the `X-API-Key` header

**Solution**:

1. Check that `client/.env` exists and has `REACT_APP_APPLICATION_TOKEN` set
2. Restart the client server (`npm start`)
3. Check browser console for errors

### Error: "Unauthorized - Invalid application token"

**Cause**: Tokens don't match between client and server

**Solution**:

1. Verify both `.env` files have the same token value
2. Check for extra spaces or newlines in the token
3. Restart both servers

### Token Not Working After Setting

**Solution**:

1. **Client**: Restart the React dev server (environment variables are read at build time)
2. **Server**: Restart the Node.js server
3. Clear browser cache if needed

## Example .env Files

### `server/.env`

```env
NODE_ENV=development
PORT=3010
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-jwt-secret
APPLICATION_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### `client/.env`

```env
REACT_APP_API_URL=http://localhost:3010
REACT_APP_APPLICATION_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

## Security Best Practices

1. **Use Strong Tokens**: Generate tokens using crypto.randomBytes (at least 32 bytes)
2. **Never Commit**: Add `.env` to `.gitignore` (should already be there)
3. **Different Tokens for Environments**: Use different tokens for development, staging, and production
4. **Rotate Tokens**: Periodically rotate tokens, especially if compromised
5. **Environment Variables**: Use environment variables, never hardcode tokens in code

## Verification

To verify the token is working:

1. **Check Client**: Open browser DevTools → Network tab → Look for `X-API-Key` header in requests
2. **Check Server**: Look for successful API requests in server logs (no 401 errors)
3. **Test Endpoint**: Make a test API call - should succeed if token is correct
