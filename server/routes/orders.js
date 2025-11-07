import express from "express";
import Auth from "../middlewares/auth.js";
import {
  requireBuyer,
  requireSeller,
  requirePermission,
} from "../middlewares/rbac.js";
import {
  createOrder,
  listMyOrders,
  getSellerOrders,
} from "../controllers/orders.js";

const router = express.Router();

// All order endpoints require authentication
router.use(Auth);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order from the user's cart
 *     tags: [Orders]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 */
// Buyers can create orders and view their own orders
router.post("/", requirePermission("orders", "create"), createOrder);
/**
 * @swagger
 * /api/v1/orders/me:
 *   get:
 *     summary: Get user's orders
 *     description: Retrieve all orders for the current user
 *     tags: [Orders]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.get("/me", requirePermission("orders", "read"), listMyOrders);

/**
 * @swagger
 * /api/v1/orders/seller:
 *   get:
 *     summary: Get seller orders
 *     description: Retrieve all orders for seller's products
 *     tags: [Orders]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of seller's orders
 */
// Sellers can view their orders
router.get("/seller", requirePermission("orders", "read"), getSellerOrders);

export default router;
