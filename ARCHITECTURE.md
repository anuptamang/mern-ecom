# Architecture Overview

This project is a MERN-based ecommerce app with a React client and an Express/MongoDB server.

## Components

- Client (React + TypeScript + Redux Toolkit + Ant Design)
  - Product listing and detail pages
  - Cart management (add/update/remove/clear)
  - Checkout with Stripe Elements
  - Auth flows (login/register)
- Server (Express + Mongoose)
  - Models: User, Product, Cart, Order
  - REST routes: /user, /products, /carts, /checkout, /orders
  - JWT auth middleware, file uploads (multer)
  - Stripe PaymentIntents integration

## Data Flow

1. Client fetches products from `/products`.
2. Authenticated users manage cart via `/carts` endpoints.
3. Checkout requests a PaymentIntent (`/checkout/create-payment-intent`).
4. Client confirms payment with Stripe.js using the `clientSecret`.
5. Client creates an order via `/orders` (cart is cleared on order creation).

## State Management

- Redux slices:
  - `products`: server-fetched list and pagination
  - `carts`: server-backed cart state (items, totals)
  - `auth`: token and user info (status, role)

## Security

- JWT-based auth for protected routes (`/carts`, `/orders`, `/checkout`)
- Token passed in `Authorization: Bearer <token>` header
- Server validates token and sets `req.userId`

## Pricing Note

- Product schema uses `body.price` as price. Seed products with `body.price` or adjust the schema to include a dedicated `price` field.
