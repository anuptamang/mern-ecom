# Setup API Documentation - Swagger/OpenAPI Workflow

Complete setup workflow for interactive API documentation.

## Purpose
Configure Swagger/OpenAPI documentation for interactive API exploration and testing.

## Prerequisites
- Server running with Swagger configured
- Application token configured

## Steps

### 1. Verify Swagger Configuration

Check that Swagger is configured in `server/config/swagger.js`:

```javascript
// Should have swagger definition with:
// - openapi: '3.0.0'
// - info (title, version, description)
// - servers
// - components (securitySchemes)
```

### 2. Access API Documentation

```bash
# Development: Publicly accessible
http://localhost:3010/api-docs

# Production: Protected by application token
# Include X-API-Key header in requests
```

### 3. Authorize in Swagger UI

1. Open http://localhost:3010/api-docs
2. Click **Authorize** button (top right)
3. Enter your application token in `X-API-Key` field
4. Click **Authorize**
5. Click **Close**

### 4. Test Endpoints

1. **Find Endpoint**: Browse available endpoints
2. **Try It Out**: Click on an endpoint
3. **Fill Parameters**: Enter required parameters
4. **Execute**: Click **Execute**
5. **View Response**: See response body, headers, and status code

### 5. Add JSDoc Comments to Routes

To document new endpoints, add JSDoc comments:

```javascript
/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get("/", getProducts);
```

### 6. Export OpenAPI Specification

**JSON Format**:
```bash
curl http://localhost:3010/api-docs/swagger.json > swagger.json
```

**YAML Format**:
```bash
curl http://localhost:3010/api-docs/swagger.yaml > swagger.yaml
```

### 7. Import into Postman

1. **Export from Swagger**:
   - Get JSON/YAML from `/api-docs/swagger.json` or `/api-docs/swagger.yaml`

2. **Import to Postman**:
   - Open Postman
   - Click **Import**
   - Select **File** or **Link**
   - Paste URL: `http://localhost:3010/api-docs/swagger.json`
   - Click **Import**

3. **Configure Environment**:
   - Create Postman environment
   - Set variables:
     - `baseUrl`: `http://localhost:3010/api/v1`
     - `apiKey`: Your application token
     - `token`: JWT token (for authenticated requests)

4. **Add Pre-request Script**:
   ```javascript
   // Auto-add X-API-Key header
   pm.request.headers.add({
     key: 'X-API-Key',
     value: pm.environment.get('apiKey')
   });
   ```

## Swagger UI URLs

- **Main Documentation**: http://localhost:3010/api-docs
- **JSON Spec**: http://localhost:3010/api-docs/swagger.json
- **YAML Spec**: http://localhost:3010/api-docs/swagger.yaml

## Documentation Best Practices

1. **Complete Documentation**: Document all endpoints
2. **Request Examples**: Include example request bodies
3. **Response Examples**: Include example responses
4. **Error Responses**: Document all possible error responses
5. **Authentication**: Document authentication requirements
6. **Tags**: Use tags to group related endpoints
7. **Descriptions**: Provide clear descriptions for all parameters

## Troubleshooting

### Swagger UI Not Loading
1. Verify server is running: `curl http://localhost:3010/api/v1/health`
2. Check Swagger route is registered in `server/index.js`
3. Verify `swagger-jsdoc` and `swagger-ui-express` are installed

### Only Health Endpoint Showing
- Add JSDoc comments to all route files
- Verify JSDoc comments follow OpenAPI 3.0 format
- Check `swagger.js` configuration includes all route files

### Authorization Not Working
1. Verify application token is configured
2. Check security scheme is defined in Swagger config
3. Ensure endpoints have `security` field in JSDoc

### Export Not Working
1. Verify Swagger JSON endpoint is accessible
2. Check server logs for errors
3. Verify Swagger configuration is correct

## Documentation
See `docs/API/API_DOCS_URLS.md` for detailed API documentation guide.
