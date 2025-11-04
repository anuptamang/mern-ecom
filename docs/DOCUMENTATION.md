# E-Commerce Platform - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [User Roles & Permissions](#user-roles--permissions)
4. [System Architecture](#system-architecture)
5. [Getting Started](#getting-started)
6. [Core Modules](#core-modules)
7. [Workflows](#workflows)
8. [API Reference](#api-reference)
9. [Deployment](#deployment)
10. [Development Guidelines](#development-guidelines)

---

## Overview

This is a comprehensive full-stack e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js). The platform supports a multi-role ecosystem including buyers, sellers, delivery agencies, warehouse operators, support teams, verification teams, inspectors, and finance teams.

### Technology Stack

- **Frontend**: React 18, TypeScript, Redux Toolkit, Ant Design, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Payment**: Stripe (Payment Intents)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Build Tools**: Webpack (React), Babel

### Key Capabilities

- Product catalog with search, filtering, and pagination
- Shopping cart with persistent backend storage
- Secure checkout with Stripe integration
- Multi-stage order delivery tracking
- Comprehensive return/refund workflow
- Role-based access control (RBAC)
- Profile management with completion tracking
- Password management (reset/change)
- Real-time notifications
- User-to-user chat system

---

## Features

### 1. User Management

- **Authentication**: JWT-based login/register with token validation
- **Profile Management**: Complete profile with address, contact info, and photos
- **Profile Completion**: Automatic tracking with redirect for incomplete profiles
- **Password Management**: 
  - Users can change their own password
  - Admins can reset passwords for child users
- **Role-Based Access**: 13+ user roles with specific permissions

### 2. Product Management

- Product CRUD operations (sellers)
- Product listings with pagination
- Product details with images, ratings, and comments
- Product categories and tags
- View counts and likes
- Related products

### 3. Shopping Experience

- Shopping cart (add, update, remove, clear)
- Wishlist management
- Secure checkout with Stripe
- Order history and tracking
- Order cancellation (before shipping)

### 4. Delivery System

- Multi-stage delivery tracking
- Delivery agency assignment
- Warehouse operator management
- Multiple deliverer types:
  - Warehouse deliverers (seller → facility)
  - Customer delivery deliverers (facility → customer)
  - Customer return deliverers (handles returns)
- Real-time status updates
- Delivery proof and acceptance/rejection
- **Reassignment System**: Reassign deliveries to different deliverers/operators with reason tracking
- **Rejection System**: Reject assignments with reasons (notifications sent to admins)
- **Assignment History**: Track all previous assignments for auditing

### 5. Return & Refund Workflow

- Return request creation (with proof images)
- Multi-stage return processing:
  - Support team assignment
  - Delivery agency assignment
  - Return deliverer pickup
  - Verification team assignment
  - Inspector evaluation (accept/reject)
  - Finance refund processing
  - Re-delivery for rejected returns
- Complete return history tracking
- **Reassignment System**: Reassign return tasks to different users (support, agency, deliverer, verification, inspector, finance) with reason tracking
- **Rejection System**: Reject return assignments with reasons (notifications sent to admins)
- **Assignment History**: Track all previous assignments for auditing

### 6. Notifications System

- Real-time notifications for:
  - New orders
  - Delivery updates
  - Return requests
  - Assignment notifications
  - Status changes
- Notification badges and dropdown
- Clickable notification links

### 7. Chat System

- User-to-user messaging
- Real-time chat interface
- Message history

### 8. Workload Management

- **Workload Dashboard**: Team admins can view workload status of their child users
- **Workload Calculation**: Automatic calculation of user availability (free/busy/occupied)
- **User Workload API**: Get detailed workload for specific users
- **Role-Based Filtering**: Each admin role sees workload for their authorized child users
- **Future Enhancement**: Auto-assignment based on workload availability

### 9. Assignment Management

- **Reassignment**: Reassign deliveries/returns to different users
  - Delivery: Reassign agency, deliverer, warehouse operator
  - Returns: Reassign support, agency, deliverer, verification, inspector, finance
  - Optional reason field for tracking
  - Previous assignment stored in history
  - Notifications sent to old and new assignees
  
- **Rejection**: Reject assignments with reasons
  - Required reason field
  - Assignment cleared and admin notified
  - Previous assignment stored in history
  - Notifications sent to relevant parties

- **Assignment History**: Complete audit trail
  - All previous assignments tracked
  - Reassignment reasons stored
  - Rejection reasons stored
  - Timestamps for all events

---

## User Roles & Permissions

### Buyer (`user`)
- ✅ Browse products
- ✅ Add to cart/wishlist
- ✅ Place orders
- ✅ Track deliveries
- ✅ Request returns/refunds
- ✅ Chat with sellers
- ❌ No access to seller dashboard

### Seller (`seller`)
- ✅ Create/edit/delete products
- ✅ Manage orders (mark ready to ship)
- ✅ View sales analytics
- ✅ Chat with buyers
- ✅ Bank payout information
- ❌ No cart/wishlist access

### Delivery Agency (`delivery_agency`)
- ✅ View assigned deliveries
- ✅ Assign warehouse operators
- ✅ Assign delivery persons
- ✅ Reassign deliveries (deliverer, warehouse operator)
- ✅ Reject assignments with reasons
- ✅ Create warehouse operators
- ✅ Create delivery persons (warehouse, customer_delivery, customer_return)
- ✅ Reset passwords for child users
- ✅ Manage return deliveries
- ✅ View workload dashboard for child users
- ❌ No buyer features (cart, orders, wishlist)

### Warehouse Operator (`warehouse_operator`)
- ✅ View deliveries in facility
- ✅ Assign customer delivery deliverers
- ✅ Update delivery status (in_facility → in_transit → out_for_delivery)
- ✅ View delivery history
- ❌ No editing after out_for_delivery

### Delivery Person (`delivery_person`)
**Types:**
- **Warehouse Deliverer** (`warehouse`): Picks up from seller → delivers to facility
- **Customer Delivery Deliverer** (`customer_delivery`): Delivers orders to customers
- **Customer Return Deliverer** (`customer_return`): Handles return pickups and re-deliveries

- ✅ View assigned deliveries
- ✅ Update delivery status
- ✅ Mark as delivered
- ✅ Handle delivery acceptance/rejection
- ✅ Pick up returns
- ✅ Submit returns to support
- ❌ No buyer features

### Support Admin (`support`)
- ✅ View all return requests
- ✅ Assign support users
- ✅ Assign delivery agencies
- ✅ Assign verification teams
- ✅ Assign finance users
- ✅ Reassign return tasks (support, agency, verification, finance)
- ✅ Reject assignments with reasons
- ✅ Create support users
- ✅ Create verification teams
- ✅ Reset passwords for child users
- ✅ View workload dashboard for child users
- ❌ No buyer features

### Support User (`support_user`)
- ✅ View assigned returns
- ✅ Assign delivery agencies
- ✅ Assign verification teams
- ✅ Assign finance users
- ✅ Reassign return tasks (agency, verification, finance)
- ✅ Reject assignments with reasons
- ✅ Manage return workflow
- ❌ Cannot create users

### Verification Team (`verification_team`)
- ✅ View returns in inspection
- ✅ Assign inspectors
- ✅ Reassign inspectors with reasons
- ✅ Reject assignments with reasons
- ✅ Create inspectors
- ✅ Reset passwords for inspectors
- ✅ View workload dashboard for inspectors
- ❌ No buyer features

### Return Inspector (`return_inspector`)
- ✅ View assigned returns
- ✅ Inspect return packages
- ✅ Accept/reject returns with reasons
- ❌ No buyer features

### Finance (`finance`)
- ✅ View returns pending refund
- ✅ Process refunds via Stripe
- ✅ View refund history
- ❌ No buyer features

### Admin (`admin`)
- ✅ Manage all users
- ✅ Create delivery agencies
- ✅ Create support admins
- ✅ Create finance users
- ✅ Reset passwords for child users
- ✅ View workload dashboard for all child users
- ✅ Reassign any delivery or return assignment
- ❌ No buyer features (no cart, orders, wishlist, messages)

---

## System Architecture

### Backend Architecture

```
server/
├── controllers/       # Business logic
│   ├── user.js       # User management, auth
│   ├── products.js   # Product CRUD
│   ├── carts.js      # Cart management
│   ├── orders.js     # Order creation
│   ├── delivery.js   # Delivery tracking
│   ├── deliveryAssignment.js  # Delivery assignments
│   ├── return.js     # Return requests
│   ├── returnWorkflow.js  # Return processing workflow
│   └── refund.js     # Refund processing
├── models/           # Mongoose schemas
├── routes/           # Express routes
├── middlewares/      # Auth, upload, validation
└── scripts/          # Seed and reset scripts
```

### Frontend Architecture

```
client/src/
├── components/       # Reusable UI components
├── features/         # Feature modules
├── pages/            # Page components
│   ├── public/       # Public pages (home, products)
│   └── private/      # Protected pages (dashboard, profile)
├── routes/           # Route guards and router
├── redux/            # State management
├── services/         # API endpoints
├── types/            # TypeScript definitions
└── utils/            # Helper functions
```

### Data Flow

1. **Product Browsing**: Client fetches products → Display → User adds to cart
2. **Cart Management**: Client sends cart updates → Server persists → Updates totals
3. **Checkout**: Client requests PaymentIntent → Stripe confirms → Create order
4. **Delivery**: Seller marks ready → Agency assigns → Warehouse operator → Customer deliverer → Delivery
5. **Returns**: Buyer requests return → Support assigns → Deliverer picks up → Inspector evaluates → Finance refunds

### State Management

- **Redux Toolkit** for global state
- **Slices**: auth, products, carts, orders, wishlist, notifications, chat
- **Async Thunks** for API calls
- **Local State** (useState) for component-level state

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB 6.0+
- Stripe account (for payments)

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd ecommerce
```

2. **Install dependencies**
```bash
npm install
npm run install-all-deps
```

3. **Environment Setup**

**Server** (`server/.env`):
```env
PORT=3010
MONGODB=mongodb://localhost:27017/ecommerce
STRIPE_SECRET_KEY=sk_test_REMOVED_FOR_SECURITY_FOR_SECURITY
```

**Client** (`client/.env`):
```env
REACT_APP_BACKEND_API_URL=http://localhost:3010
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_REMOVED_FOR_SECURITY_FOR_SECURITY_FOR_SECURITY
```

4. **Start MongoDB**
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Or start manually
mongod
```

5. **Seed Database**
```bash
cd server && npm run seed
```

6. **Start Development Server**
```bash
npm run dev
```

This starts:
- Backend on `http://localhost:3010`
- Frontend on `http://localhost:3000`

### Quick Reset

Reset database and restart dev server:
```bash
npm run reset-and-restart
```

See [QUICK_START.md](./QUICK_START.md) for more options.

### Test Credentials

After seeding, use these credentials:

- **Admin**: `admin@example.com` / `password123`
- **Buyer**: `buyer@example.com` / `password123`
- **Seller**: `seller@example.com` / `password123`
- **Delivery Agency**: `delivery@example.com` / `password123`
- **Warehouse Operator**: `warehouse@example.com` / `password123`
- **Support Admin**: `support@example.com` / `password123`
- **Finance**: `finance@example.com` / `password123`

---

## Core Modules

### 1. Authentication & User Management

**Files**: `server/controllers/user.js`, `client/src/redux/action/auth/authAction.ts`

**Features**:
- JWT-based authentication
- User registration/login
- Profile completion tracking
- Password change (users)
- Password reset (admins)
- Role-based user creation hierarchy

**API Endpoints**:
- `POST /user/login` - User login
- `POST /user/register` - User registration
- `GET /user/profile-completion` - Get profile completion status
- `PUT /user/reset-password` - Change own password
- `POST /user/reset-password-admin` - Admin resets child user password
- `POST /user/create` - Create user (role-based)
- `GET /user/list` - List users (role-based filtering)

See [AUTH.md](./AUTH.md) for detailed documentation.

### 2. Products

**Files**: `server/controllers/products.js`, `client/src/pages/public/Products/`

**Features**:
- Product CRUD operations
- Product listing with pagination
- Product search and filtering
- Product details with images, ratings, comments
- Related products

**API Endpoints**:
- `GET /products` - List products (paginated)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (seller)
- `PATCH /products/:id` - Update product (seller)
- `DELETE /products/:id` - Delete product (seller)

See [PRODUCTS.md](./PRODUCTS.md) for detailed documentation.

### 3. Shopping Cart

**Files**: `server/controllers/carts.js`, `client/src/redux/slice/carts/`

**Features**:
- Add/update/remove items
- Persistent backend cart
- Cart totals calculation
- Clear cart
- Add to cart modal for unauthenticated users

**API Endpoints**:
- `GET /carts/me` - Get or create cart
- `POST /carts/items` - Add item to cart
- `PATCH /carts/items` - Update item quantity
- `DELETE /carts/items/:productId` - Remove item
- `DELETE /carts/clear` - Clear cart

See [CARTS.md](./CARTS.md) for detailed documentation.

### 4. Checkout & Orders

**Files**: `server/controllers/checkout.js`, `server/controllers/orders.js`

**Features**:
- Stripe Payment Intent creation
- Order creation after payment
- Order history
- Order cancellation (before shipping)

**API Endpoints**:
- `POST /checkout/create-payment-intent` - Create Stripe payment intent
- `POST /orders` - Create order after payment
- `GET /orders/me` - Get user orders

See [CHECKOUT.md](./CHECKOUT.md) and [ORDERS.md](./ORDERS.md) for detailed documentation.

### 5. Delivery System

**Files**: `server/controllers/delivery.js`, `server/controllers/deliveryAssignment.js`

**Features**:
- Multi-stage delivery tracking
- Delivery agency assignment
- Warehouse operator assignment
- Deliverer assignment (warehouse, customer_delivery)
- Delivery status updates
- Delivery proof
- Buyer acceptance/rejection

**Delivery Statuses**:
- `packing` - Seller preparing order
- `ready_to_ship` - Ready for pickup
- `picked_up` - Warehouse deliverer picked up
- `in_facility` - At delivery facility
- `in_transit` - Warehouse operator processing
- `out_for_delivery` - Customer deliverer en route
- `delivered` - Successfully delivered
- `rejected` - Buyer rejected delivery
- `cancelled` - Order cancelled

**API Endpoints**:
- `GET /delivery/tracking/:orderId` - Get delivery tracking
- `GET /delivery/agency/deliveries` - Get deliveries assigned to agency
- `GET /delivery/agency/persons` - Get delivery persons for agency
- `GET /delivery/agency/operators` - Get warehouse operators for agency
- `PATCH /delivery/:orderId/status` - Update delivery status
- `POST /delivery/:orderId/assign-person` - Assign delivery person
- `POST /delivery/:orderId/assign-warehouse-operator` - Assign warehouse operator
- `POST /delivery/:orderId/reassign-agency` - Reassign delivery agency (admin)
- `POST /delivery/:orderId/reassign-person` - Reassign delivery person
- `POST /delivery/:orderId/reassign-warehouse-operator` - Reassign warehouse operator
- `POST /delivery/:orderId/reject-assignment` - Reject assignment with reason

See [DELIVERY.md](./DELIVERY.md) for detailed documentation.

### 6. Returns & Refunds

**Files**: `server/controllers/return.js`, `server/controllers/returnWorkflow.js`

**Features**:
- Return request creation with proof images
- Multi-stage return workflow
- Inspector evaluation (accept/reject)
- Stripe refund processing
- Re-delivery for rejected returns

**Return Statuses**:
- `pending` - Awaiting support assignment
- `assigned_support` - Support user assigned
- `assigned_agency` - Delivery agency assigned
- `assigned_deliverer` - Return deliverer assigned
- `picked_up` - Return picked up from buyer
- `submitted_to_support` - Submitted to support team
- `in_inspection` - In verification queue
- `inspector_assigned` - Inspector assigned
- `inspection_accepted` - Inspection passed
- `inspection_rejected` - Inspection failed
- `refund_processing` - Refund being processed
- `refunded` - Refund completed
- `re_delivery` - Re-delivering rejected return
- `completed` - Return completed
- `cancelled` - Return cancelled

**API Endpoints**:
- `POST /returns/request` - Create return request
- `GET /returns/:returnId` - Get return details
- `GET /returns/support` - Get support returns
- `GET /returns/agency` - Get agency returns
- `GET /returns/verification` - Get verification team returns
- `POST /returns/:returnId/assign-support` - Assign support user
- `POST /returns/:returnId/assign-agency` - Assign delivery agency
- `POST /returns/:returnId/assign-deliverer` - Assign return deliverer
- `POST /returns/:returnId/assign-inspector` - Assign inspector
- `POST /returns/:returnId/reassign-support` - Reassign support user
- `POST /returns/:returnId/reassign-agency` - Reassign delivery agency
- `POST /returns/:returnId/reassign-deliverer` - Reassign return deliverer
- `POST /returns/:returnId/reassign-verification` - Reassign verification team
- `POST /returns/:returnId/reassign-inspector` - Reassign inspector
- `POST /returns/:returnId/reassign-finance` - Reassign finance user
- `POST /returns/:returnId/reject-assignment` - Reject assignment with reason
- `POST /returns/:returnId/pickup` - Mark as picked up
- `POST /returns/:returnId/submit-to-support` - Submit to support
- `POST /returns/:returnId/inspect` - Inspect return (accept/reject)
- `POST /returns/:returnId/process-refund` - Process refund (finance)

See [RETURNS.md](./RETURNS.md) for detailed documentation.

### 7. Workload Management

**Files**: `server/controllers/workload.js`

**Features**:
- Workload calculation for users
- Workload dashboard for team admins
- User availability tracking (free/busy/occupied)
- Role-based filtering

**API Endpoints**:
- `GET /user/workload/dashboard` - Get workload dashboard (admin roles)
- `GET /user/workload/:userId` - Get workload for specific user

**Workload Status**:
- `free` - User has no active assignments
- `busy` - User has active assignments but can take more
- `occupied` - User is at capacity

---

## Workflows

### Order Fulfillment Workflow

```
1. Buyer adds items to cart
2. Buyer proceeds to checkout
3. Buyer pays via Stripe
4. Order created → Status: "paid"
5. Seller views order → Marks as "ready_to_ship"
6. Delivery agency assigns warehouse deliverer
7. Warehouse deliverer picks up → Status: "picked_up"
8. Status: "in_facility"
9. Delivery agency assigns warehouse operator
10. Warehouse operator assigns customer delivery deliverer
11. Status: "in_transit" → "out_for_delivery"
12. Customer deliverer delivers → Status: "delivered"
13. Buyer accepts/rejects delivery
```

### Return/Refund Workflow

```
1. Buyer requests return (with proof images)
2. Support team receives notification
3. Support assigns support user
4. Support user assigns delivery agency
5. Delivery agency assigns return deliverer
6. Return deliverer picks up from buyer
7. Return deliverer submits to support
8. Support assigns verification team
9. Verification team assigns inspector
10. Inspector evaluates → Accept/Reject
11. If accepted:
    - Support assigns finance team
    - Finance processes Stripe refund
    - Status: "refunded"
12. If rejected:
    - Support assigns delivery agency for re-delivery
    - Return deliverer picks up from support
    - Return deliverer delivers to buyer
    - Status: "completed"
```

---

## API Reference

### Authentication

**Base URL**: `http://localhost:3010`

All protected endpoints require: `Authorization: Bearer <JWT_TOKEN>`

#### POST `/user/login`
Login user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "result": {
    "_id": "...",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "profileCompletion": 75,
    "profileCompleted": false
  },
  "token": "eyJhbGc...",
  "profileCompletion": 75,
  "profileCompleted": false
}
```

#### POST `/user/register`
Register new user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

#### PUT `/user/reset-password`
Change own password (requires old password).

**Request Body**:
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

#### POST `/user/reset-password-admin`
Admin resets password for child user.

**Request Body**:
```json
{
  "userId": "user_id_here",
  "newPassword": "newpass123"
}
```

#### GET `/user/profile-completion`
Get profile completion status.

**Response**:
```json
{
  "completion": 75,
  "isComplete": false,
  "profileCompleted": false,
  "requiredFields": {
    "basic": ["fullName", "email", "phone"],
    "address": ["primaryAddress"],
    "profile": ["profilePhoto"],
    "bankPayout": ["bankPayout"]  // For sellers only
  }
}
```

### Products

See [PRODUCTS.md](./PRODUCTS.md) and [API.md](./API.md) for full API documentation.

### Carts

See [CARTS.md](./CARTS.md) for detailed documentation.

### Orders

See [ORDERS.md](./ORDERS.md) for detailed documentation.

### Delivery

See [DELIVERY.md](./DELIVERY.md) for detailed documentation.

### Returns

See [RETURNS.md](./RETURNS.md) for detailed documentation.

### Workload Management

#### GET `/user/workload/dashboard`
Get workload dashboard for team admins.

**Authorization**: Admin roles (admin, support, delivery_agency, verification_team)

**Response**:
```json
{
  "dashboard": {
    "totalUsers": 10,
    "free": 3,
    "busy": 5,
    "occupied": 2,
    "users": [
      {
        "_id": "...",
        "fullName": "John Doe",
        "role": "delivery_person",
        "workload": {
          "status": "busy",
          "activeDeliveries": 2,
          "activeReturns": 0,
          "total": 2
        }
      }
    ]
  }
}
```

#### GET `/user/workload/:userId`
Get detailed workload for specific user.

**Authorization**: Admin roles or the user themselves

**Response**:
```json
{
  "workload": {
    "userId": "...",
    "status": "busy",
    "activeDeliveries": 2,
    "activeReturns": 1,
    "total": 3,
    "deliveries": [...],
    "returns": [...]
  }
}
```

---

## Deployment

### Environment Variables

**Production Server**:
```env
PORT=3010
MONGODB=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
STRIPE_SECRET_KEY=sk_live_REMOVED_FOR_SECURITY
NODE_ENV=production
```

**Production Client**:
```env
REACT_APP_BACKEND_API_URL=https://api.yourdomain.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_REMOVED_FOR_SECURITY
```

### Build Steps

1. **Backend**:
```bash
cd server
npm install --production
# Use PM2 or similar process manager
pm2 start index.js --name ecommerce-api
```

2. **Frontend**:
```bash
cd client
npm install
npm run build
# Serve build/ directory with Nginx or similar
```

### Database Setup

- Use MongoDB Atlas for managed database
- Configure IP whitelisting
- Use connection string authentication
- Enable backups

### SSL/HTTPS

- Use Let's Encrypt or similar for SSL certificates
- Configure reverse proxy (Nginx/Apache)
- Ensure Stripe webhook endpoints use HTTPS

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide.

---

## Development Guidelines

### Code Style

- **Backend**: ES6+ JavaScript, async/await patterns
- **Frontend**: TypeScript, functional components with hooks
- **Components**: Ant Design UI library
- **State**: Redux Toolkit for global state, useState for local

### File Organization

- **Components**: Reusable UI components in `client/src/components/`
- **Features**: Feature modules in `client/src/features/`
- **Pages**: Route components in `client/src/pages/`
- **Services**: API endpoints in `client/src/services/endPoints/`
- **Types**: TypeScript definitions in `client/src/types/`

### Best Practices

1. **Error Handling**: Always use try-catch for async operations
2. **Validation**: Validate inputs on both client and server
3. **Security**: Never expose sensitive data in responses
4. **Performance**: Use pagination for large datasets
5. **Accessibility**: Use semantic HTML and ARIA attributes

### Testing

- Use test Stripe cards for payment testing
- Test all user roles with seeded credentials
- Verify role-based access controls
- Test delivery and return workflows end-to-end

---

## Additional Documentation

- [QUICK_START.md](./QUICK_START.md) - Quick setup and common commands
- [AUTH.md](./AUTH.md) - Authentication and authorization details
- [API.md](./API.md) - Complete API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture details
- [PRODUCTS.md](./PRODUCTS.md) - Product management guide
- [CARTS.md](./CARTS.md) - Shopping cart documentation
- [CHECKOUT.md](./CHECKOUT.md) - Checkout and payment guide
- [ORDERS.md](./ORDERS.md) - Order management documentation
- [DELIVERY.md](./DELIVERY.md) - Delivery system documentation
- [RETURNS.md](./RETURNS.md) - Returns and refunds workflow
- [ROLES.md](./ROLES.md) - User roles and permissions guide
- [PROFILE.md](./PROFILE.md) - Profile management guide
- [ROADMAP.md](./ROADMAP.md) - Future features and improvements
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide

---

## Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Last Updated**: January 2025
