# Quick Fix for 401 Errors and Login Redirect Loop

## Problem Summary

1. **401 Unauthorized on `/api/v1/theme/active`** - Client not sending `X-API-Key` header
2. **Login redirect loop** - After login, immediately redirected back to login page

## Root Causes

1. **API Versioning**: Server now requires `/api/v1/*` prefix, but client was using old endpoints
2. **Application Token**: Client not sending `X-API-Key` header in all requests
3. **Direct fetch calls**: Some components use direct `fetch()` calls that don't include headers

## Solutions Applied

### 1. Updated API Configuration (`client/src/configs/api/api.ts`)
- Automatically adds `/api/v1` prefix to all API calls
- Includes `X-API-Key` header from environment variable

### 2. Fixed Direct Fetch Calls (`client/src/configs/theme/colorScheme.ts`)
- Updated `fetchThemeFromAPI()` to use versioned endpoint (`/api/v1/theme/active`)
- Added `X-API-Key` header to fetch request

### 3. Updated Axios Interceptor (`client/src/configs/axios/axiosInterceptor.ts`)
- Distinguishes between application token errors and authentication errors
- Prevents auto-logout on application token errors

## Required Actions

### Step 1: Set Environment Variables

**Create or update `client/.env`:**
```env
REACT_APP_APPLICATION_TOKEN=your-secure-application-token-here
REACT_APP_BACKEND_API_URL=http://localhost:3010/api/v1
```

**Note**: Include `/api/v1` in the `REACT_APP_BACKEND_API_URL` for simplicity. No need for separate version variable.

**Create or update `server/.env`:**
```env
APPLICATION_TOKEN=your-secure-application-token-here
API_VERSION=v1
```

**Important**: Both tokens must have the **exact same value**!

### Step 2: Generate Secure Token

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated token and use it for both `APPLICATION_TOKEN` (server) and `REACT_APP_APPLICATION_TOKEN` (client).

### Step 3: Restart Both Servers

**Critical**: After setting environment variables, restart both servers:

```bash
# Terminal 1 - Server
cd server
# Press Ctrl+C to stop
npm run dev

# Terminal 2 - Client
cd client
# Press Ctrl+C to stop
npm start
```

### Step 4: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

## Verification

### Check Client is Sending Headers

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Make a request (e.g., load theme)
4. Click on the request
5. Check **Headers** section
6. Look for:
   - `X-API-Key: <your-token>` ✅
   - Request URL: `http://localhost:3010/api/v1/theme/active` ✅

### Check Server Logs

Look for these messages in server logs:

**If token is missing:**
```
API request without application token
```

**If token is invalid:**
```
Invalid application token attempt
```

**If everything is working:**
- No error messages
- Requests proceed normally

## Still Not Working?

### Issue: Still getting 401 errors

**Check:**
1. `client/.env` exists and has `REACT_APP_APPLICATION_TOKEN`
2. `server/.env` exists and has `APPLICATION_TOKEN`
3. Both tokens have the same value
4. Client server was restarted after setting token
5. Browser cache was cleared

### Issue: Login redirect loop

**Check:**
1. API endpoints are using `/api/v1/*` prefix
2. `X-API-Key` header is being sent
3. Server has `APPLICATION_TOKEN` set
4. Check browser console for errors
5. Check server logs for authentication errors

### Issue: Theme not loading

**Check:**
1. `fetchThemeFromAPI()` is using correct endpoint (`/api/v1/theme/active`)
2. `X-API-Key` header is included in fetch request
3. Server route is accessible (check server logs)

## Testing

### Test with curl

```bash
# Replace <your-token> with your actual token
curl -H "X-API-Key: <your-token>" http://localhost:3010/api/v1/theme/active
```

**Expected**: JSON response with theme data

**If 401**: Token is incorrect or server doesn't have it configured

### Test in Browser Console

```javascript
// Check if token is available
console.log(process.env.REACT_APP_APPLICATION_TOKEN);

// Make a test request
fetch('http://localhost:3010/api/v1/theme/active', {
  headers: {
    'X-API-Key': process.env.REACT_APP_APPLICATION_TOKEN
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Summary

The fixes ensure:
1. ✅ All API calls use `/api/v1/*` prefix
2. ✅ All requests include `X-API-Key` header
3. ✅ Direct fetch calls include headers
4. ✅ Application token errors don't trigger logout
5. ✅ Authentication errors still trigger logout correctly

After following these steps, both issues should be resolved!
