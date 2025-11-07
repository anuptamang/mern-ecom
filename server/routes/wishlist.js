import express from "express";
import Auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/rbac.js";
import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
  checkWishlistStatus,
  getSellerWishlist,
} from "../controllers/wishlist.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(Auth);

/**
 * @swagger
 * /api/v1/wishlist:
 *   post:
 *     summary: Add to wishlist
 *     description: Add a product to the user's wishlist
 *     tags: [Wishlist]
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
 *     responses:
 *       200:
 *         description: Product added to wishlist
 */
router.post("/", requirePermission("wishlist", "create"), addToWishlist);

/**
 * @swagger
 * /api/v1/wishlist/{productId}:
 *   delete:
 *     summary: Remove from wishlist
 *     description: Remove a product from the user's wishlist
 *     tags: [Wishlist]
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
 *         description: Product removed from wishlist
 */
router.delete(
  "/:productId",
  requirePermission("wishlist", "delete"),
  removeFromWishlist
);

/**
 * @swagger
 * /api/v1/wishlist/me:
 *   get:
 *     summary: Get my wishlist
 *     description: Retrieve the current user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User's wishlist
 */
router.get("/me", requirePermission("wishlist", "read"), getMyWishlist);

/**
 * @swagger
 * /api/v1/wishlist/check/{productId}:
 *   get:
 *     summary: Check wishlist status
 *     description: Check if a product is in the user's wishlist
 *     tags: [Wishlist]
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
 *         description: Wishlist status
 */
router.get(
  "/check/:productId",
  requirePermission("wishlist", "read"),
  checkWishlistStatus
);

/**
 * @swagger
 * /api/v1/wishlist/seller:
 *   get:
 *     summary: Get seller wishlist
 *     description: Get wishlist items for seller's products
 *     tags: [Wishlist]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Seller wishlist items
 */
router.get("/seller", requirePermission("wishlist", "read"), getSellerWishlist);

export default router;
