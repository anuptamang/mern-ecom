# Orders

## Creation

Orders are created after a successful Stripe payment confirmation.

- Endpoint: `POST /orders`
- Body: `{ paymentIntentId, amount, currency, items? }`
- If `items` and `amount` are omitted, the server derives them from the current user's cart.
- Server clears the cart upon order creation.

## Response
```
{
  "order": {
    "_id": "...",
    "userId": "...",
    "items": [ { productId, title, thumbnail, price, quantity } ],
    "amount": 1999,
    "currency": "usd",
    "status": "paid",
    "paymentIntentId": "pi_...",
    "createdAt": "..."
  }
}
```

## Listing

- `GET /orders/me` — returns the user's orders sorted by `createdAt` desc.

## Status

Statuses: `created`, `paid`, `failed`. Current flow sets `paid` when `paymentIntentId` is provided.
