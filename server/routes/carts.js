import express from "express";
import Auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/rbac.js";
import {
  addItem,
  clearCart,
  getMyCart,
  removeItem,
  updateItem,
  getSellerCartItems,
} from "../controllers/carts.js";

const router = express.Router();

// All cart endpoints require authentication
router.use(Auth);

/**
 * @swagger
 * /api/v1/carts/me:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieve the current user's shopping cart
 *     tags: [Carts]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart details
 *       401:
 *         description: Unauthorized
 */
router.get("/me", requirePermission("carts", "read"), getMyCart);

/**
 * @swagger
 * /api/v1/carts/items:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the shopping cart
 *     tags: [Carts]
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
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart
 */
router.post("/items", requirePermission("carts", "create"), addItem);

/**
 * @swagger
 * /api/v1/carts/items:
 *   patch:
 *     summary: Update cart item
 *     description: Update quantity of an item in the cart
 *     tags: [Carts]
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
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 */
router.patch("/items", requirePermission("carts", "update"), updateItem);

/**
 * @swagger
 * /api/v1/carts/items/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a product from the shopping cart
 *     tags: [Carts]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete(
  "/items/:productId",
  requirePermission("carts", "delete"),
  removeItem
);

/**
 * @swagger
 * /api/v1/carts/clear:
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from the shopping cart
 *     tags: [Carts]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete("/clear", requirePermission("carts", "delete"), clearCart);

/**
 * @swagger
 * /api/v1/carts/seller:
 *   get:
 *     summary: Get seller cart items
 *     description: Get cart items for seller's products
 *     tags: [Carts]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Seller cart items
 */
router.get("/seller", requirePermission("carts", "read"), getSellerCartItems);

export default router;
