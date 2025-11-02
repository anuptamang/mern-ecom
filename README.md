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
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_REMOVED_FOR_SECURITY_FOR_SECURITY_FOR_SECURITY
```

## Running locally

1. Install dependencies in root, then in each app (or run the helper script):
   - npm install
   - (cd server && npm install)
   - (cd client && npm install)
2. Provide env files as above
3. Start backend: (cd server && npm run start)
4. Start frontend: (cd client && npm start)

## Seeding data

Populate a test user and sample products:

```
(cd server && npm run seed)
```

Default user: `test@example.com` / `password123`

## Reset Database and Restart Dev Server

Stop dev server, reset database with seed data, and restart:

```
npm run reset-and-restart
```

Or manually:

```bash
# Stop dev server
npm run dev:stop

# Reset and seed database
cd server && npm run reset && cd ..

# Start dev server
npm run dev
```

## Features implemented

- Products list and single product view
- Cart: add/update/remove/clear with persisted backend cart per user
- Checkout: Payment Intent creation (Stripe) and order creation
- Orders: create on checkout and list per user
- Multi-stage delivery tracking
- Return/refund workflow
- Assignment management (reassign/reject with history tracking)
- Workload management dashboard
- Interactive documentation viewer with search
- Role-based access control (13+ user roles)
- Profile management with completion tracking
- Password management (change/reset)
- Real-time notifications
- User-to-user chat

## Documentation

Access interactive documentation at `/documentation` or visit:

- http://localhost:3000/documentation

The documentation page features:

- ✅ Sidebar navigation for all documentation files
- ✅ Search functionality across all markdown files
- ✅ Syntax-highlighted code blocks
- ✅ Table of contents for each document
- ✅ Markdown rendering with GitHub-flavored markdown support

All documentation is read from `.md` files in the project root. See [DOCUMENTATION.md](./DOCUMENTATION.md) for the complete guide.

Note: Product pricing reads from `product.body?.price`. Ensure your seed or create product includes a price field there.
