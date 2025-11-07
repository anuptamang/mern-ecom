# Troubleshooting 401 Unauthorized - Application Token Issues

## Problem: Getting 401 Unauthorized on API Requests

If you're getting `401 Unauthorized - Application token required` or `401 Unauthorized - Invalid application token`, follow these steps:

## Step 1: Check Server Configuration

### Verify `server/.env` exists and has `APPLICATION_TOKEN`

```bash
cd server
cat .env | grep APPLICATION_TOKEN
```

**Expected output:**
```
APPLICATION_TOKEN=your-secure-application-token-here
```

**If missing:**
1. Create `server/.env` if it doesn't exist
2. Add `APPLICATION_TOKEN=your-secure-application-token-here`
3. Restart the server

## Step 2: Check Client Configuration

### Verify `client/.env` exists and has `REACT_APP_APPLICATION_TOKEN`

```bash
cd client
cat .env | grep REACT_APP_APPLICATION_TOKEN
```

**Expected output:**
```
REACT_APP_APPLICATION_TOKEN=your-secure-application-token-here
```

**If missing:**
1. Create `client/.env` if it doesn't exist
2. Add `REACT_APP_APPLICATION_TOKEN=your-secure-application-token-here`
3. **IMPORTANT**: Restart the React dev server (environment variables are read at build time)

## Step 3: Verify Tokens Match

**Both tokens must be identical:**

```bash
# Server token
cd server && cat .env | grep APPLICATION_TOKEN

# Client token
cd client && cat .env | grep REACT_APP_APPLICATION_TOKEN
```

**They must have the exact same value!**

## Step 4: Generate and Set Tokens

If tokens are missing or don't match:

```bash
# Generate a secure token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated token and add it to both files:

**`server/.env`:**
```env
APPLICATION_TOKEN=<generated-token>
```

**`client/.env`:**
```env
REACT_APP_APPLICATION_TOKEN=<same-generated-token>
```

## Step 5: Restart Both Servers

**Critical**: After setting environment variables, you MUST restart both servers:

```bash
# Terminal 1 - Stop and restart server
cd server
# Press Ctrl+C to stop
npm run dev

# Terminal 2 - Stop and restart client
cd client
# Press Ctrl+C to stop
npm start
```

## Step 6: Verify Client is Sending Header

### Check Browser DevTools

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Make an API request
4. Click on the request
5. Check **Headers** section
6. Look for `X-API-Key` in **Request Headers**

**Expected:**
```
X-API-Key: your-secure-application-token-here
```

**If missing:**
- Client `.env` file doesn't have `REACT_APP_APPLICATION_TOKEN`
- Client server wasn't restarted after adding the token
- Check browser console for errors

## Step 7: Verify Server is Receiving Header

### Check Server Logs

Look for these log messages:

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

## Common Issues and Solutions

### Issue 1: "Missing X-API-Key header"

**Cause**: Client isn't sending the header

**Solution**:
1. Check `client/.env` has `REACT_APP_APPLICATION_TOKEN`
2. Restart React dev server
3. Check browser DevTools Network tab to verify header is sent

### Issue 2: "Invalid application token"

**Cause**: Tokens don't match between client and server

**Solution**:
1. Verify both `.env` files have the same token value
2. Check for extra spaces or newlines in the token
3. Regenerate and set both tokens again
4. Restart both servers

### Issue 3: Token works in Postman but not in browser

**Cause**: Client environment variable not set

**Solution**:
1. Check `client/.env` exists
2. Verify `REACT_APP_APPLICATION_TOKEN` is set
3. Restart React dev server (environment variables are read at build time)

### Issue 4: Token works locally but not in production

**Cause**: Environment variables not set in production

**Solution**:
1. Set `APPLICATION_TOKEN` in production server environment
2. Set `REACT_APP_APPLICATION_TOKEN` in production build environment
3. Rebuild and redeploy client
4. Restart production server

## Quick Test

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

## Verification Checklist

- [ ] `server/.env` exists and has `APPLICATION_TOKEN`
- [ ] `client/.env` exists and has `REACT_APP_APPLICATION_TOKEN`
- [ ] Both tokens have the same value
- [ ] Server has been restarted after setting token
- [ ] Client has been restarted after setting token
- [ ] Browser DevTools shows `X-API-Key` header in requests
- [ ] Server logs show no "missing token" or "invalid token" errors

## Still Not Working?

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
2. **Check for typos** in environment variable names
3. **Verify no extra spaces** in token values
4. **Check server logs** for detailed error messages
5. **Verify both servers are running** on correct ports

## Need Help?

Check the following files for more information:
- `APPLICATION_TOKEN_SETUP.md` - Complete setup guide
- `SECURITY_IMPLEMENTATION.md` - Security implementation details
