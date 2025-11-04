# API Documentation

Complete API reference for the Enterprise E-Commerce Platform.

## 📚 Core API Documentation

- **[API Overview](./API.md)** - Complete API reference and endpoints
- **[Authentication API](./AUTH.md)** - Authentication and authorization endpoints

## 🔧 Feature-Specific APIs

- **[Products API](../API/features/PRODUCTS.md)** - Product management endpoints
- **[Orders API](../API/features/ORDERS.md)** - Order management endpoints
- **[Carts API](../API/features/CARTS.md)** - Shopping cart endpoints
- **[Checkout API](../API/features/CHECKOUT.md)** - Checkout and payment endpoints

## 🔐 Authentication

All protected endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## 📋 API Endpoints Overview

### Authentication

- `POST /user/login` - User login
- `POST /user/register` - User registration
- `POST /user/check-user` - Verify email exists
- `PUT /user/change-password` - Change password

### Products

- `GET /products` - List products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin/seller)
- `PUT /products/:id` - Update product (admin/seller)
- `DELETE /products/:id` - Delete product (admin)

### Orders

- `GET /orders/me` - Get user's orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update order status

### Carts

- `GET /carts/me` - Get user's cart
- `POST /carts/items` - Add item to cart
- `PATCH /carts/items` - Update cart item
- `DELETE /carts/items/:productId` - Remove item from cart
- `DELETE /carts/clear` - Clear cart

### Checkout

- `POST /checkout/create-payment-intent` - Create payment intent
- `POST /checkout/confirm-payment` - Confirm payment

## 🔗 Related Documentation

- [Development Guide](../development/index.md) - API development practices
- [Security Guide](../security/index.md) - API security
- [Testing Guide](../testing/index.md) - API testing
