# API Documentation URLs

This document lists all available URLs under `/api-docs/` for accessing API documentation.

## Main Documentation URLs

### 1. Swagger UI (Interactive Documentation)
**URL:** `http://localhost:3010/api-docs/`

**Description:** Interactive web-based API documentation interface where you can:
- Browse all API endpoints
- Test endpoints directly in the browser
- View request/response schemas
- Authenticate with API key and JWT token
- Filter endpoints by tags

**Access:**
- **Development:** Public (no authentication required)
- **Production:** Protected by application token (`X-API-Key` header)

**Usage:**
```bash
# Open in browser
open http://localhost:3010/api-docs/
```

---

### 2. Swagger JSON Specification
**URL:** `http://localhost:3010/api-docs/swagger.json`

**Description:** OpenAPI 3.0 specification in JSON format. This is the machine-readable API specification that can be:
- Imported into Postman
- Imported into Insomnia
- Used by API testing tools
- Used for code generation
- Shared with frontend developers

**Content-Type:** `application/json`

**Access:**
- **Development:** Public (no authentication required)
- **Production:** Protected by application token (`X-API-Key` header)

**Usage:**
```bash
# Download using curl
curl http://localhost:3010/api-docs/swagger.json -o swagger.json

# View in browser
open http://localhost:3010/api-docs/swagger.json

# Import into Postman
# Postman > Import > Link > http://localhost:3010/api-docs/swagger.json
```

---

### 3. Swagger YAML Specification
**URL:** `http://localhost:3010/api-docs/swagger.yaml`

**Description:** OpenAPI 3.0 specification in YAML format. Alternative format for tools that prefer YAML over JSON.

**Content-Type:** `text/yaml`

**Access:**
- **Development:** Public (no authentication required)
- **Production:** Protected by application token (`X-API-Key` header)

**Usage:**
```bash
# Download using curl
curl http://localhost:3010/api-docs/swagger.yaml -o swagger.yaml

# View in browser
open http://localhost:3010/api-docs/swagger.yaml
```

---

## Internal Swagger UI Assets

The following URLs are automatically served by `swagger-ui-express` for the Swagger UI interface. These are internal assets and typically not accessed directly:

- `/api-docs/swagger-ui.css` - Swagger UI stylesheet
- `/api-docs/swagger-ui-bundle.js` - Swagger UI JavaScript bundle
- `/api-docs/swagger-ui-standalone-preset.js` - Swagger UI standalone preset
- `/api-docs/favicon-32x32.png` - Favicon (32x32)
- `/api-docs/favicon-16x16.png` - Favicon (16x16)

**Note:** These are internal assets used by the Swagger UI. You don't need to access them directly.

---

## Quick Reference

| URL | Format | Purpose | Access |
|-----|--------|---------|--------|
| `/api-docs/` | HTML | Interactive documentation | Public (dev) / Protected (prod) |
| `/api-docs/swagger.json` | JSON | OpenAPI spec (JSON) | Public (dev) / Protected (prod) |
| `/api-docs/swagger.yaml` | YAML | OpenAPI spec (YAML) | Public (dev) / Protected (prod) |

---

## Examples

### View Documentation in Browser
```bash
# Open Swagger UI
open http://localhost:3010/api-docs/

# View JSON spec
open http://localhost:3010/api-docs/swagger.json

# View YAML spec
open http://localhost:3010/api-docs/swagger.yaml
```

### Download Specifications
```bash
# Download JSON
curl http://localhost:3010/api-docs/swagger.json -o swagger.json

# Download YAML
curl http://localhost:3010/api-docs/swagger.yaml -o swagger.yaml
```

### Import into Tools

**Postman:**
1. Open Postman
2. Click **Import**
3. Select **Link** tab
4. Enter: `http://localhost:3010/api-docs/swagger.json`
5. Click **Import**

**Insomnia:**
1. Open Insomnia
2. Click **Create** > **Import/Export**
3. Select **Import Data** > **From URL**
4. Enter: `http://localhost:3010/api-docs/swagger.json`
5. Click **Import**

**VS Code (REST Client):**
1. Install REST Client extension
2. Create `.http` file
3. Reference the Swagger spec for endpoint details

---

## Production Access

In production, all endpoints require the `X-API-Key` header:

```bash
# With authentication
curl -H "X-API-Key: your-application-token" \
  https://your-domain.com/api-docs/swagger.json \
  -o swagger.json
```

---

## Troubleshooting

### Issue: 401 Unauthorized in Production

**Solution:** Include the `X-API-Key` header:
```bash
curl -H "X-API-Key: your-token" http://localhost:3010/api-docs/swagger.json
```

### Issue: YAML Format Not Working

**Solution:** The YAML endpoint converts JSON to YAML. If you need more advanced YAML features, consider using a library like `js-yaml`.

### Issue: Swagger UI Not Loading

**Solution:**
1. Check server is running
2. Verify `/api-docs/` route is registered
3. Check browser console for errors
4. Ensure static assets are being served

---

## Related Documentation

- [POSTMAN_IMPORT.md](./POSTMAN_IMPORT.md) - Detailed Postman import guide
- [Enterprise Implementation Checklist](../enterprise/ENTERPRISE_IMPLEMENTATION_CHECKLIST.md) - Enterprise features checklist
- [Implementation Guide](../enterprise/IMPLEMENTATION_GUIDE.md) - Implementation guide

---

## Summary

The `/api-docs/` endpoint provides three main access points:

1. **`/api-docs/`** - Interactive Swagger UI (best for browsing and testing)
2. **`/api-docs/swagger.json`** - JSON specification (best for Postman/Insomnia import)
3. **`/api-docs/swagger.yaml`** - YAML specification (alternative format)

All endpoints are public in development and protected by application token in production.
