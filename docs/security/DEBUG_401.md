# Debugging 401 Unauthorized - Application Token Issues

## Quick Debugging Steps

### Step 1: Check Browser DevTools

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Make the request that's failing
4. Click on the request
5. Check **Request Headers** section

**Look for:**
```
X-API-Key: <your-token>
```

**If missing:**
- `REACT_APP_APPLICATION_TOKEN` is not set in `client/.env`
- Client server wasn't restarted after setting the token
- Check browser console for warnings

### Step 2: Check Server Logs

Look for these messages in server logs:

**If token is missing:**
```
API request without application token
```

**If token is invalid:**
```
Invalid application token attempt
```

**If token is valid:**
- No error message (request proceeds)

### Step 3: Verify Environment Variables

**Client (`client/.env`):**
```bash
cd client
cat .env | grep REACT_APP_APPLICATION_TOKEN
```

**Expected:**
```
REACT_APP_APPLICATION_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Server (`server/.env`):**
```bash
cd server
cat .env | grep APPLICATION_TOKEN
```

**Expected:**
```
APPLICATION_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Important:** Both must have the **exact same value**!

### Step 4: Test in Browser Console

Open browser console and run:

```javascript
// Check if token is available
console.log('Application Token:', process.env.REACT_APP_APPLICATION_TOKEN);

// Check API URL
console.log('API URL:', process.env.REACT_APP_BACKEND_API_URL);

// Test request
fetch('http://localhost:3010/api/v1/user/profile-completion', {
  headers: {
    'X-API-Key': process.env.REACT_APP_APPLICATION_TOKEN,
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Expected:**
- `Application Token:` should show your token (not `undefined`)
- `API URL:` should show `http://localhost:3010/api/v1`
- Request should return 200 (not 401)

### Step 5: Check Server Configuration

**Verify server has token:**
```bash
cd server
node -e "require('dotenv').config(); console.log('Token:', process.env.APPLICATION_TOKEN ? 'SET' : 'NOT SET');"
```

**Expected:** `Token: SET`

## Common Issues

### Issue 1: Token is `undefined` in browser console

**Cause:** `REACT_APP_APPLICATION_TOKEN` not set or client server not restarted

**Solution:**
1. Check `client/.env` exists and has `REACT_APP_APPLICATION_TOKEN`
2. Restart React dev server (environment variables are read at build time)
3. Clear browser cache

### Issue 2: Token is set but request still fails

**Cause:** Tokens don't match between client and server

**Solution:**
1. Verify both `.env` files have the same token value
2. Check for extra spaces or newlines
3. Regenerate and set both tokens again
4. Restart both servers

### Issue 3: Header is not being sent

**Cause:** Interceptor not working or environment variable not available

**Solution:**
1. Check browser console for warnings
2. Verify `REACT_APP_APPLICATION_TOKEN` is set
3. Check that axios interceptor is loaded (check `configs/axios/axiosInterceptor.ts` is imported)

## Quick Fix Checklist

- [ ] `client/.env` exists and has `REACT_APP_APPLICATION_TOKEN`
- [ ] `server/.env` exists and has `APPLICATION_TOKEN`
- [ ] Both tokens have the same value
- [ ] Client server was restarted after setting token
- [ ] Server was restarted after setting token
- [ ] Browser cache was cleared
- [ ] Browser DevTools shows `X-API-Key` header in requests
- [ ] Server logs show no "missing token" or "invalid token" errors

## Still Not Working?

1. **Check server logs** for detailed error messages
2. **Check browser console** for warnings or errors
3. **Verify token format** - no quotes, no spaces, no newlines
4. **Test with curl** to isolate the issue:

```bash
# Replace <your-token> with your actual token
curl -H "X-API-Key: <your-token>" \
     -H "Authorization: Bearer <jwt-token>" \
     http://localhost:3010/api/v1/user/profile-completion
```

If curl works but browser doesn't, the issue is with the client configuration.
