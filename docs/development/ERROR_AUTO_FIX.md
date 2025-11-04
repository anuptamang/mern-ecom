# Error Identification and Auto-Fix System

## Overview

This system automatically identifies errors and attempts to fix them without user intervention. It works on both client and server sides, providing a self-healing application experience.

## Architecture

### Server-Side (`server/utils/`)

1. **Error Identifier** (`errorIdentifier.js`)
   - Classifies errors by type, severity, and category
   - Returns error metadata for auto-fix decision making

2. **Auto-Fix Handler** (`autoFix.js`)
   - Attempts to automatically fix identified errors
   - Returns fixed responses when successful
   - Falls back to standard error handling when fix fails

3. **Enhanced Error Handler** (`errorHandler.js`)
   - Integrated with auto-fix system
   - Attempts auto-fix first, then falls back to standard handling

### Client-Side (`client/src/utils/`)

1. **Error Identifier** (`errorIdentifier.ts`)
   - Identifies client-side errors (network, API, browser, etc.)
   - Provides error classification for auto-fix

2. **Auto-Fix Handler** (`autoFix.ts`)
   - Automatically fixes client-side errors
   - Handles token cleanup, retries, redirects
   - Shows appropriate user messages

3. **Enhanced API Client** (`apiClient.ts`)
   - Integrated with auto-fix system
   - Automatically fixes errors before showing to user

## Supported Error Types

### Server-Side Errors

#### Database Errors
- **Mongoose Cast Error** (Invalid ObjectId)
  - **Auto-Fix**: Returns sanitized 400 response
  - **Action**: Prevents crash, provides clear error message

- **Mongoose Duplicate Key**
  - **Auto-Fix**: Extracts field name and returns 409 response
  - **Action**: Provides clear duplicate error message

- **Mongoose Validation Error**
  - **Auto-Fix**: Extracts validation errors and returns structured response
  - **Action**: Returns all validation failures in one response

- **Mongoose Connection Error**
  - **Auto-Fix**: Attempts to reconnect to MongoDB
  - **Action**: Automatically restores database connection
  - **Fallback**: Returns 503 if reconnection fails

#### Authentication Errors
- **JWT Expired**
  - **Auto-Fix**: Returns 401 with clear message
  - **Action**: Client-side will clear token and redirect

#### Network Errors
- **Network Timeout**
  - **Auto-Fix**: Suggests retry
  - **Action**: Returns 408 with retry suggestion

- **Network Connection Error**
  - **Auto-Fix**: Returns 503 with connection check message
  - **Action**: Informs user to check connection

#### Configuration Errors
- **Environment Variable Missing**
  - **Auto-Fix**: Identifies missing variable
  - **Action**: Returns 500 with specific variable name

### Client-Side Errors

#### Network Errors
- **Network Offline**
  - **Auto-Fix**: Checks connection status, retries when online
  - **Action**: Shows offline message, retries automatically

- **Network Timeout**
  - **Auto-Fix**: Suggests retry to user
  - **Action**: Shows retry message with option to retry

- **Network Error**
  - **Auto-Fix**: Attempts automatic retry if online
  - **Action**: Shows network error message

#### Authentication Errors
- **401 Unauthorized**
  - **Auto-Fix**: Clears token, stores return URL, redirects to login
  - **Action**: Automatic session cleanup and redirect

- **Token Expired**
  - **Auto-Fix**: Clears token, redirects to login
  - **Action**: Seamless session expiration handling

- **Token Invalid**
  - **Auto-Fix**: Clears token, redirects to login
  - **Action**: Automatic token cleanup

#### Component Errors
- **Image Load Error**
  - **Auto-Fix**: Uses placeholder (already handled by ProductImage component)
  - **Action**: Graceful image fallback

#### API Errors
- **500 Server Error**
  - **Auto-Fix**: Suggests retry after delay
  - **Action**: Shows user-friendly message with retry option

## Auto-Fix Priority

1. **Identify Error** → Classify error type and severity
2. **Check Fixability** → Determine if error can be auto-fixed
3. **Apply Fix** → Execute appropriate fix handler
4. **Log Fix** → Record fix attempt and result
5. **Fallback** → Use standard error handling if fix fails

## How It Works

### Server Flow

```
Error Occurred
    ↓
Identify Error Type
    ↓
Check if Fixable
    ↓
Apply Auto-Fix Handler
    ↓
[If Fixed] Return Fixed Response
    ↓
[If Not Fixed] Standard Error Handler
```

### Client Flow

```
Error Occurred (API Call)
    ↓
Identify Error Type
    ↓
Check if Fixable
    ↓
Apply Auto-Fix Handler
    ↓
[If Fixed] Apply Fix Action
    ↓
[If Not Fixed] Show Error Message
```

## Examples

### Example 1: Invalid ObjectId (Server)

**Error**: `CastError: Cast to ObjectId failed`

**Auto-Fix**:
- Identified as `MONGOOSE_CAST_ERROR`
- Returns sanitized 400 response
- Message: "Invalid resource ID format"

**Result**: User gets clear error message instead of 500 crash

### Example 2: Token Expired (Client)

**Error**: `401 Unauthorized - Token expired`

**Auto-Fix**:
- Identified as `TOKEN_EXPIRED`
- Clears invalid token from localStorage
- Stores current URL for redirect after login
- Redirects to `/login`

**Result**: Seamless session expiration handling

### Example 3: Network Offline (Client)

**Error**: `Network Error - Offline`

**Auto-Fix**:
- Identified as `NETWORK_OFFLINE`
- Checks connection status
- Shows "You are offline" message
- Retries automatically when connection restored

**Result**: User-friendly offline handling with auto-retry

### Example 4: Database Connection Lost (Server)

**Error**: `Mongoose connection error`

**Auto-Fix**:
- Identified as `MONGOOSE_CONNECTION_ERROR`
- Attempts automatic reconnection
- Returns success if reconnected
- Returns 503 if reconnection fails

**Result**: Automatic database recovery

## Logging

All auto-fix attempts are logged:

### Server Logs
```javascript
{
  level: 'INFO',
  message: 'Error auto-fixed',
  type: 'MONGOOSE_CAST_ERROR',
  action: 'sanitized_response',
  originalError: 'Cast to ObjectId failed',
  url: '/api/products/invalid-id',
  method: 'GET'
}
```

### Client Logs
```javascript
{
  type: 'API_401_UNAUTHORIZED',
  action: 'clear_token_and_redirect',
  message: 'Session expired. Redirecting to login...',
  fixed: true
}
```

## Safety Features

1. **Fallback Mechanism**: Always falls back to standard error handling if auto-fix fails
2. **Error Classification**: Only fixes errors that are safe to auto-fix
3. **Logging**: All fix attempts are logged for debugging
4. **User Feedback**: Users are informed when fixes are applied
5. **No Silent Failures**: All errors are either fixed or properly handled

## Extending the System

### Adding New Error Types

1. Add error type to `ERROR_TYPES` enum/constant
2. Add identification logic in `identifyError()`
3. Add fix handler in `autoFixHandlers`
4. Test fix handler thoroughly

### Adding New Fix Handlers

```javascript
// Server-side example
[ERROR_TYPES.NEW_ERROR_TYPE]: async (error, context) => {
  // Fix logic here
  return {
    fixed: true,
    action: 'fix_action',
    message: 'Fix message',
    statusCode: 200,
  };
}
```

```typescript
// Client-side example
[ERROR_TYPES.NEW_ERROR_TYPE]: async (error, context) => {
  // Fix logic here
  return {
    fixed: true,
    action: 'fix_action',
    message: 'Fix message',
  };
}
```

## Best Practices

1. **Always Log**: Log all fix attempts for debugging
2. **User Feedback**: Inform users when fixes are applied
3. **Safe Fixes**: Only auto-fix errors that are safe to fix
4. **Fallback**: Always have a fallback to standard error handling
5. **Testing**: Test all auto-fix handlers thoroughly

## Monitoring

Monitor these metrics:
- Auto-fix success rate
- Most common error types
- Fix attempts by type
- Failed fix attempts

## Future Enhancements

1. **Retry Logic**: Implement exponential backoff for retries
2. **Error Analytics**: Track error patterns and trends
3. **Predictive Fixing**: Predict and prevent errors before they occur
4. **Admin Dashboard**: UI for monitoring and managing auto-fixes
5. **Fix Customization**: Allow admins to configure auto-fix behavior
