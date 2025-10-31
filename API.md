# API Reference

Base URL: `http://localhost:3010`

All protected endpoints require `Authorization: Bearer <JWT>`.

## Auth `/user`
- POST `/login` — body: `{ email, password }` → `{ result, token }`
- POST `/register` — body: `{ email, password, confirmPassword, firstName, lastName, role }` → `{ result, token }`
- GET `/list` — admin listing (as implemented)
- GET `/:id` — get user
- PATCH `/:id` — update profile (auth)
- DELETE `/:id` — delete user (auth)

## Products `/products`
- GET `/` — query: `{ page }` → paginated list `{ data, currentPage, numberOfPages }`
- GET `/:id` — single product
- POST `/` — create (auth + upload)
- PATCH `/:id` — update (auth)
- DELETE `/:id` — delete (auth)
- PUT `/:id/like` — increment likes
- DELETE `/:id/like` — decrement likes
- GET `/:id/comments` — list comments
- POST `/:id/comments` — add comment (auth)
- PATCH `/:id/comments/:commentId/like` — like comment
- PATCH `/:id/comments/:commentId/reply` — reply to comment
- PATCH `/:id/viewcount` — increment views

## Carts `/carts` (auth)
- GET `/me` — get or create current user's cart → `{ cart, totals }`
- POST `/items` — `{ productId, quantity? }` → `{ cart, totals }`
- PATCH `/items` — `{ productId, quantity }` → `{ cart, totals }`
- DELETE `/items/:productId` — remove item → `{ cart, totals }`
- DELETE `/clear` — clear cart → `{ cart, totals }`

## Checkout `/checkout` (auth)
- POST `/create-payment-intent` — `{ amount?, currency? }` → `{ clientSecret }`

If `amount` omitted, server computes from cart. Amount is in cents.

## Orders `/orders` (auth)
- POST `/` — `{ paymentIntentId, amount, currency, items? }` → `{ order }`
- GET `/me` — list current user's orders → `{ orders }`
