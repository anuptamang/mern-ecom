# API Documentation

Complete API reference for the Enterprise E-Commerce Platform.

## Base URL

```
Development: http://localhost:3010
Production: https://your-domain.com
```

## Authentication

Most endpoints require authentication via JWT token.

### Getting a Token

**Login:**
```http
POST /user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### Using the Token

Include token in Authorization header:

```http
Authorization: Bearer <token>
```

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 15,
    "total": 100,
    "pages": 7,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "database": {
      "status": "connected",
      "readyState": 1
    }
  }
}
```

### Products

**List Products:**
```http
GET /products?page=1&limit=15&category=electronics
```

**Get Product:**
```http
GET /products/:id
```

**Create Product** (Seller/Admin):
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "categories": ["electronics"],
  "tag": ["popular"]
}
```

### Users

**Register:**
```http
POST /user/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Get Current User:**
```http
GET /user/me
Authorization: Bearer <token>
```

### Orders

**Create Order:**
```http
POST /orders
Authorization: Bearer <token>
```

**Get Orders:**
```http
GET /orders
Authorization: Bearer <token>
```

### Cart

**Add to Cart:**
```http
POST /carts
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 1
}
```

**Get Cart:**
```http
GET /carts
Authorization: Bearer <token>
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

- Default: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 60 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## Testing

Use tools like:
- Postman
- Insomnia
- curl
- HTTPie

Example curl request:

```bash
curl -X GET http://localhost:3010/products \
  -H "Authorization: Bearer <token>"
```
