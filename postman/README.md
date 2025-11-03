# Postman API Collection for Enterprise E-Commerce Platform

This directory contains the Postman collection and environment files for testing the Enterprise E-Commerce API.

## 📦 Files

1. **Enterprise-E-Commerce-API.postman_collection.json** - Complete API collection with all endpoints
2. **Postman-Environment.postman_environment.json** - Environment variables for different environments
3. **README.md** - This file

## 🚀 Quick Start

### Import to Postman Web

1. **Open Postman Web**
   - Go to https://web.postman.com
   - Sign in to your account

2. **Import Collection**
   - Click "Import" button (top left)
   - Drag and drop `Enterprise-E-Commerce-API.postman_collection.json` OR
   - Click "Upload Files" and select the collection file
   - Click "Import"

3. **Import Environment**
   - Click "Import" again
   - Drag and drop `Postman-Environment.postman_environment.json` OR
   - Click "Upload Files" and select the environment file
   - Click "Import"

4. **Select Environment**
   - Click the environment dropdown (top right)
   - Select "Enterprise E-Commerce - Environment"

5. **Configure Base URL**
   - Click on the environment name (top right)
   - Edit the `baseUrl` variable if needed
   - Default: `http://localhost:3010`
   - For production: `https://your-domain.com`

## 🔐 Authentication Setup

### How Token Storage Works

**Postman doesn't use localStorage** (that's browser-only). Instead, Postman uses:
- **Environment Variables** - Stored in your Postman workspace (like localStorage)
- **Collection Variables** - Backup storage in the collection itself

### Getting Authentication Token

1. **Register a User** or **Login**
   - Navigate to "Authentication" folder
   - Run "Register User" or "Login" request
   - **The token is automatically saved** to both:
     - Environment variable: `authToken`
     - Collection variable: `authToken` (backup)

### How Automatic Token Usage Works

1. **After Login/Register**:
   - Test script extracts token from response
   - Saves to `pm.environment.set('authToken', token)`
   - This persists across all requests in your Postman session

2. **For All Authenticated Requests**:
   - Collection-level auth is configured with Bearer Token
   - Uses `{{authToken}}` variable automatically
   - Postman replaces `{{authToken}}` with the saved token
   - **No manual intervention needed!**

3. **Token Persistence**:
   - Token stays in environment until you:
     - Clear it manually
     - Log in again (replaces old token)
     - Switch environments
     - Close Postman (token persists if you save workspace)

### Verify Token is Saved

After login, check:
1. Open environment dropdown (top right)
2. Click on environment name to edit
3. You should see `authToken` populated
4. Or check Postman Console (View → Show Postman Console) for confirmation logs

## 📋 Collection Structure

### Folders

1. **Health Check** - API health status
2. **Authentication** - Login, Register, Password management
3. **Users** - User management, profiles, stats
4. **Products** - Product CRUD, comments, ratings
5. **Cart** - Shopping cart operations
6. **Checkout** - Payment intent creation
7. **Orders** - Order management
8. **Wishlist** - Wishlist operations
9. **Notifications** - Notification management
10. **Delivery** - Delivery tracking and management
11. **Returns** - Return and refund management
12. **Chat** - Messaging system
13. **Banners** - Banner management (Admin)
14. **Payouts** - Payout management
15. **Documentation** - API documentation endpoints

## 🔧 Environment Variables

### Available Variables

- `baseUrl` - API base URL (default: http://localhost:3010)
- `authToken` - JWT authentication token (auto-populated)
- `userId` - Current user ID (auto-populated)
- `productId` - Product ID (auto-populated from responses)
- `orderId` - Order ID (auto-populated from responses)
- `chatId` - Chat ID (auto-populated from responses)
- `returnId` - Return ID (auto-populated from responses)
- `bannerId` - Banner ID (for admin operations)

### Creating Custom Environments

You can create different environments for:
- **Development**: `http://localhost:3010`
- **Staging**: `https://staging.your-domain.com`
- **Production**: `https://your-domain.com`

## 📝 Usage Tips

### 1. Test Flow

1. Start with **Health Check** to verify API is running
2. **Register** or **Login** to get authentication token
3. Token is automatically saved and used in subsequent requests
4. Test endpoints according to your needs

### 2. Testing Protected Endpoints

- Make sure you're logged in first
- Token is automatically included in authenticated requests
- If you get 401 errors, re-login to refresh token

### 3. Testing File Uploads

- Some endpoints support file uploads (profile photos, product images, etc.)
- Use the "Body" tab → "form-data" mode
- Select file type and upload your file

### 4. Testing Role-Based Endpoints

- Some endpoints require specific roles (Admin, Seller, Buyer)
- Make sure you're logged in with the correct user role
- Check endpoint descriptions for required roles

## 🔄 Syncing Collection

### Update Collection

If the API changes:
1. Export updated collection from Postman
2. Replace the collection file in this directory
3. Share with team

### Share Collection

1. In Postman, click on collection name
2. Click "..." (three dots)
3. Click "Share"
4. Choose sharing method:
   - **Share as link** - Public link
   - **Share to workspace** - Private to workspace
   - **Export** - Download JSON file

## 📚 API Documentation

For complete API documentation, see:
- **[API Documentation](../docs/API.md)** - Complete API reference
- **[README](../README.md)** - Project overview
- **[Development Guide](../docs/DEVELOPMENT.md)** - Developer guide

## 🐛 Troubleshooting

### Token Not Saving
- Check that test scripts are enabled in Postman settings
- Verify collection variables are set correctly

### 401 Unauthorized
- Re-login to refresh token
- Check token expiration
- Verify token format in Authorization header

### CORS Errors
- Verify CORS is configured on server
- Check environment baseUrl matches server CORS settings

### Connection Refused
- Verify server is running
- Check baseUrl is correct
- Verify port is accessible

## 🔗 Related Resources

- [Postman Documentation](https://learning.postman.com/docs/)
- [Postman Collection Format](https://schema.getpostman.com/json/collection/v2.1.0/collection.json)
- [Enterprise E-Commerce API Docs](../docs/API.md)

## 📝 Notes

- All authenticated requests use Bearer Token authentication
- Token is automatically saved after login/register
- Environment variables are automatically populated from responses
- Collection includes test scripts for automatic variable extraction

---

**Last Updated**: 2024-01-01
**Version**: 1.0.0
