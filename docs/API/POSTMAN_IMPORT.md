# Importing API into Postman

This guide explains how to export the Swagger/OpenAPI specification and import it into Postman.

## Available Documentation URLs

The following URLs are available under `/api-docs/`:

1. **`/api-docs/`** - Interactive Swagger UI (browser-based documentation)
2. **`/api-docs/swagger.json`** - OpenAPI JSON specification (for Postman/Insomnia)
3. **`/api-docs/swagger.yaml`** - OpenAPI YAML specification (alternative format)

See [API_DOCS_URLS.md](./API_DOCS_URLS.md) for complete documentation of all available URLs.

## Method 1: Direct URL Import (Recommended)

### Step 1: Get the Swagger JSON URL

**Development:**
```
http://localhost:3010/api-docs/swagger.json
```

**Production:**
```
https://your-domain.com/api-docs/swagger.json
```

**Note**: In production, you'll need to include the `X-API-Key` header. See Method 2 for production.

**Alternative:** You can also use the YAML format:
```
http://localhost:3010/api-docs/swagger.yaml
```

### Step 2: Import into Postman

1. **Open Postman**
2. Click **Import** button (top left)
3. Select **Link** tab
4. Enter the URL:
   ```
   http://localhost:3010/api-docs/swagger.json
   ```
5. Click **Continue**
6. Click **Import**

Postman will automatically:
- Create a collection with all your API endpoints
- Organize endpoints by tags (Products, Orders, Carts, etc.)
- Set up authentication (X-API-Key and Bearer Token)
- Include request examples

## Method 2: Download and Import

### Step 1: Download Swagger JSON

**Using Browser:**
1. Visit: `http://localhost:3010/api-docs/swagger.json`
2. The file will download automatically (or copy the JSON)
3. Save it as `swagger.json`

**Using curl:**
```bash
# Development (no auth needed)
curl http://localhost:3010/api-docs/swagger.json -o swagger.json

# Production (with API key)
curl -H "X-API-Key: your-token" https://your-domain.com/api-docs/swagger.json -o swagger.json
```

### Step 2: Import into Postman

1. **Open Postman**
2. Click **Import** button
3. Select **File** tab
4. Choose the downloaded `swagger.json` file
5. Click **Import**

## Method 3: Using Postman's OpenAPI Import

1. **Open Postman**
2. Click **Import**
3. Select **Raw text** tab
4. Paste the JSON content from `http://localhost:3010/api-docs/swagger.json`
5. Click **Continue**
6. Click **Import**

## Post-Import Configuration

### 1. Set Collection Variables

After importing, set up collection variables:

1. Open the imported collection
2. Click **Variables** tab
3. Add variables:
   - `base_url`: `http://localhost:3010` (or your production URL)
   - `api_key`: Your `APPLICATION_TOKEN` from `server/.env`
   - `jwt_token`: Your JWT token (get this by logging in)

### 2. Configure Authentication

The collection should already have authentication configured, but verify:

1. Open collection settings
2. Go to **Authorization** tab
3. **Type**: API Key
4. **Key**: `X-API-Key`
5. **Value**: `{{api_key}}`
6. **Add to**: Header

For Bearer Token (JWT):
1. In individual requests that need JWT
2. Go to **Authorization** tab
3. **Type**: Bearer Token
4. **Token**: `{{jwt_token}}`

### 3. Set Up Pre-request Script (Optional)

To automatically get JWT token:

1. Create a login request
2. Add this to **Tests** tab:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.token) {
        pm.collectionVariables.set("jwt_token", jsonData.token);
    }
}
```

## Quick Start

### 1. Import Collection

```bash
# Download the spec
curl http://localhost:3010/api-docs/swagger.json -o swagger.json

# Import into Postman
# File > Import > swagger.json
```

### 2. Set Environment Variables

Create a Postman environment with:
- `base_url`: `http://localhost:3010`
- `api_key`: Your application token
- `jwt_token`: (will be set after login)

### 3. Test Authentication

1. Use the **Login** endpoint
2. Copy the `token` from response
3. Set it as `jwt_token` in environment variables

## Troubleshooting

### Issue: Import fails

**Solution**: Ensure the Swagger JSON is valid:
```bash
curl http://localhost:3010/api-docs/swagger.json | jq .
```

### Issue: Authentication not working

**Solution**: 
1. Check that `X-API-Key` header is set in collection variables
2. Verify the API key matches `server/.env` `APPLICATION_TOKEN`
3. For authenticated endpoints, ensure JWT token is set

### Issue: Endpoints not showing

**Solution**: 
1. Restart the server to regenerate Swagger spec
2. Clear Postman cache
3. Re-import the collection

## Benefits of Postman Import

✅ **Automatic Collection Creation** - All endpoints organized by tags
✅ **Pre-configured Authentication** - API key and JWT token setup
✅ **Request Examples** - Pre-filled request bodies
✅ **Response Schemas** - Know what to expect
✅ **Environment Variables** - Easy switching between dev/prod
✅ **Testing** - Write automated tests
✅ **Documentation** - Built-in API documentation

## Alternative: Postman Collection Export

If you want to export from Postman after importing:

1. Click collection menu (three dots)
2. Select **Export**
3. Choose **Collection v2.1**
4. Save as `postman_collection.json`

## Updating the Collection

When you add new endpoints:

1. Re-download the Swagger JSON:
   ```bash
   curl http://localhost:3010/api-docs/swagger.json -o swagger.json
   ```
2. In Postman, click collection menu
3. Select **Import**
4. Choose the updated `swagger.json`
5. Postman will merge/update the collection

## Example: Complete Workflow

```bash
# 1. Start your server
cd server && npm run dev

# 2. Download Swagger spec
curl http://localhost:3010/api-docs/swagger.json -o swagger.json

# 3. Import into Postman
# - Open Postman
# - Click Import
# - Select swagger.json
# - Click Import

# 4. Set collection variables
# - base_url: http://localhost:3010
# - api_key: your-application-token

# 5. Test an endpoint
# - Use Login endpoint to get JWT token
# - Set jwt_token variable
# - Test authenticated endpoints
```

## Resources

- [Postman Import Documentation](https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-data/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Postman OpenAPI Support](https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/)
