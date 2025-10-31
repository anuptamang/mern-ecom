# Checkout Sample Data and Testing Guide

## Test Cards (Stripe)

Use these in the Stripe Elements card form on the checkout page. Any future expiry and any CVC (e.g., 123) work.

- Success: 4242 4242 4242 4242
- 3D Secure required: 4000 0027 6000 3184
- Declined (insufficient funds): 4000 0000 0000 9995

More test cards: `https://stripe.com/docs/testing`.

## Environment

Server `server/.env`:

```
STRIPE_SECRET_KEY=sk_test_REMOVED_FOR_SECURITY_FOR_SECURITY
```

Client `client/.env`:

```
REACT_APP_BACKEND_API_URL=http://localhost:3010
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_REMOVED_FOR_SECURITY_FOR_SECURITY_FOR_SECURITY
```

## Flow Overview

1. User opens the checkout page under `user/checkout`.
2. The client requests a Payment Intent from the server.
3. Stripe Elements collects card details and confirms the payment.
4. The client calls the orders endpoint to create an order.

## API Examples

Base URL: `http://localhost:3010`

Authorization header: `Authorization: Bearer <JWT_FROM_LOGIN>`

### 1) Create Payment Intent

Request:

```
POST /checkout/create-payment-intent
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 1999,
  "currency": "usd"
}
```

Response:

```
{
  "clientSecret": "pi_12345_secret_67890"
}
```

If `amount` is omitted, the server computes it from the authenticated user's cart.

### 2) Create Order (after successful payment)

Request:

```
POST /orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "paymentIntentId": "pi_12345",
  "amount": 1999,
  "currency": "usd"
}
```

Response:

```
{
  "order": {
    "_id": "64f...",
    "userId": "64a...",
    "items": [
      {
        "productId": "63e...",
        "title": "Sample Product",
        "thumbnail": "http://.../uploads/thumb.jpg",
        "price": 19.99,
        "quantity": 1
      }
    ],
    "amount": 1999,
    "currency": "usd",
    "status": "paid",
    "paymentIntentId": "pi_12345",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 3) List My Orders

```
GET /orders/me
Authorization: Bearer <token>
```

## Sample Cart Items

The backend expects product pricing under `product.body.price`. Ensure products are seeded like:

```
{
  "title": "Wireless Mouse",
  "body": {
    "summary": "Ergonomic 2.4GHz wireless mouse",
    "price": 24.99
  },
  "thumbnail": "http://localhost:3010/uploads/mouse.jpg",
  "categories": ["electronics"],
  "tag": ["mouse", "wireless"]
}
```

## Troubleshooting

- 401/403: Ensure you pass a valid JWT in the `Authorization` header.
- Payment fails: Use the success test card or check Stripe dashboard for logs.
- Amount 0/invalid: Make sure cart has items or pass a positive `amount` in cents.
- Missing price: Populate `product.body.price` for each product.
