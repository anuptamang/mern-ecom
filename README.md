# Simple MERN

## Technologies:

- **Application Server**: [Node.js](https://nodejs.org/en/)
- **Framework for Node.js**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://expressjs.com/)
- **JavaScript library**: [React](https://reactjs.org/)

## Installation

- npm install

- npm run install-all-deps

- npm run dev

## Environment

Create environment files with the following variables.

Server (server/.env):

```
PORT=3010
MONGODB=mongodb://localhost:27017/ecommerce
STRIPE_SECRET_KEY=sk_test_REMOVED_FOR_SECURITY_FOR_SECURITY
```

Client (client/.env):

```
REACT_APP_BACKEND_API_URL=http://localhost:3010
```

## Running locally

1. Install dependencies in root, then in each app (or run the helper script):
   - npm install
   - (cd server && npm install)
   - (cd client && npm install)
2. Provide env files as above
3. Start backend: (cd server && npm run start)
4. Start frontend: (cd client && npm start)

## Features implemented

- Products list and single product view
- Cart: add/update/remove/clear with persisted backend cart per user
- Checkout: Payment Intent creation (Stripe) and order creation
- Orders: create on checkout and list per user

Note: Product pricing reads from `product.body?.price`. Ensure your seed or create product includes a price field there.
