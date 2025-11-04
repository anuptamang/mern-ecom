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

## Delivery `/delivery` (auth)
- GET `/tracking/:orderId` — get delivery tracking for order
- GET `/agency/deliveries` — get deliveries assigned to agency
- GET `/agency/persons` — get delivery persons for agency
- GET `/agency/operators` — get warehouse operators for agency
- POST `/:orderId/assign-person` — assign delivery person
- POST `/:orderId/assign-operator` — assign warehouse operator
- POST `/:orderId/reassign-agency` — reassign delivery agency (admin)
- POST `/:orderId/reassign-person` — reassign delivery person
- POST `/:orderId/reassign-warehouse-operator` — reassign warehouse operator
- POST `/:orderId/reject-assignment` — reject assignment with reason

## Returns `/returns` (auth)
- POST `/request` — create return request
- GET `/me` — get user's return requests
- GET `/support` — get returns for support team
- GET `/agency` — get returns for delivery agency
- GET `/verification` — get returns for verification team
- POST `/:returnId/assign-support` — assign support user
- POST `/:returnId/assign-agency` — assign delivery agency
- POST `/:returnId/assign-deliverer` — assign return deliverer
- POST `/:returnId/assign-inspector` — assign inspector
- POST `/:returnId/reassign-support` — reassign support user
- POST `/:returnId/reassign-agency` — reassign delivery agency
- POST `/:returnId/reassign-deliverer` — reassign return deliverer
- POST `/:returnId/reassign-verification` — reassign verification team
- POST `/:returnId/reassign-inspector` — reassign inspector
- POST `/:returnId/reassign-finance` — reassign finance user
- POST `/:returnId/reject-assignment` — reject assignment with reason
- POST `/:returnId/pickup` — mark return as picked up
- POST `/:returnId/submit-to-support` — submit return to support
- POST `/:returnId/inspect` — inspect return (accept/reject)
- POST `/:returnId/process-refund` — process refund (finance)

## User Management `/user` (auth)
- GET `/workload/dashboard` — get workload dashboard (admin roles)
- GET `/workload/:userId` — get workload for specific user
- POST `/reset-password-admin` — reset password for child user (admin)
- PUT `/reset-password` — change own password
- GET `/profile-completion` — get profile completion status

## Documentation `/docs` (public)
- GET `/list` — get list of all documentation files
- GET `/:docName` — get specific documentation file content
- GET `/search?query=...` — search documentation files
