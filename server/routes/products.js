import express from "express";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  AddLikeToProduct,
  RemoveLikeFromProduct,
  addCommentToProduct,
  allComments,
  likeComment,
  replyComment,
  viewCount,
  getMyProducts,
  addRating,
  getRatings,
  getRelatedProducts,
  getAllTags,
} from "../controllers/products.js";
import Auth from "../middlewares/auth.js";
// Use Cloudflare upload middleware if available, otherwise fallback to local upload
import {
  Upload,
  UploadProduct,
  uploadToCloudflare,
} from "../middlewares/uploadCloudflare.js";
// Keep local upload as fallback
import {
  Upload as UploadLocal,
  UploadProduct as UploadProductLocal,
} from "../middlewares/upload.js";
import { requirePermission } from "../middlewares/rbac.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a paginated list of all products
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/", getProducts);

/**
 * @swagger
 * /api/v1/products/tags:
 *   get:
 *     summary: Get all product tags
 *     description: Retrieve all available product tags
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get("/tags", getAllTags);

/**
 * @swagger
 * /api/v1/products/me:
 *   get:
 *     summary: Get my products
 *     description: Retrieve all products created by the current seller
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of seller's products
 */
router.get("/me", Auth, requirePermission("products", "read"), getMyProducts);

/**
 * @swagger
 * /api/v1/products/{id}/related:
 *   get:
 *     summary: Get related products
 *     description: Retrieve products related to the specified product
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of related products
 */
router.get("/:id/related", getRelatedProducts);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a single product by its ID
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get("/:id", getProduct);

/**
 * @swagger
 * /api/v1/products/{id}/comments:
 *   get:
 *     summary: Get product comments
 *     description: Retrieve all comments for a product
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/:id/comments", allComments);

/**
 * @swagger
 * /api/v1/products/{id}/viewcount:
 *   patch:
 *     summary: Increment product view count
 *     description: Increment the view count for a product
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: View count updated
 */
router.patch("/:id/viewcount", viewCount);

/**
 * @swagger
 * /api/v1/products/{id}/ratings:
 *   get:
 *     summary: Get product ratings
 *     description: Retrieve all ratings for a product
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of ratings
 */
router.get("/:id/ratings", getRatings);

/**
 * @swagger
 * /api/v1/products/{id}/like:
 *   put:
 *     summary: Like a product
 *     description: Add a like to a product
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product liked
 */
router.put(
  "/:id/like",
  Auth,
  requirePermission("products", "read"),
  AddLikeToProduct
);

/**
 * @swagger
 * /api/v1/products/{id}/like:
 *   delete:
 *     summary: Unlike a product
 *     description: Remove a like from a product
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product unliked
 */
router.delete(
  "/:id/like",
  Auth,
  requirePermission("products", "read"),
  RemoveLikeFromProduct
);

/**
 * @swagger
 * /api/v1/products/{id}/comments/{commentId}/like:
 *   patch:
 *     summary: Like a comment
 *     description: Add a like to a product comment
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment liked
 */
router.patch(
  "/:id/comments/:commentId/like",
  Auth,
  requirePermission("products", "read"),
  likeComment
);

/**
 * @swagger
 * /api/v1/products/{id}/comments/{commentId}/reply:
 *   patch:
 *     summary: Reply to a comment
 *     description: Add a reply to a product comment
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply added
 */
router.patch(
  "/:id/comments/:commentId/reply",
  Auth,
  requirePermission("products", "read"),
  replyComment
);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product (seller/admin only)
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created
 */
router.post(
  "/",
  Auth,
  requirePermission("products", "create"),
  UploadProduct,
  uploadToCloudflare,
  createProduct
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   patch:
 *     summary: Update a product
 *     description: Update an existing product (seller/admin only)
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated
 */
router.patch(
  "/:id",
  Auth,
  requirePermission("products", "update"),
  UploadProduct,
  uploadToCloudflare,
  updateProduct
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete(
  "/:id",
  Auth,
  requirePermission("products", "delete"),
  deleteProduct
);

/**
 * @swagger
 * /api/v1/products/{id}/comments:
 *   post:
 *     summary: Add a comment to a product
 *     description: Add a comment to a product
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post(
  "/:id/comments",
  Auth,
  requirePermission("products", "read"),
  addCommentToProduct
);

/**
 * @swagger
 * /api/v1/products/{id}/ratings:
 *   post:
 *     summary: Add a rating to a product
 *     description: Add a rating and review to a product
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating added
 */
router.post(
  "/:id/ratings",
  Auth,
  requirePermission("products", "read"),
  addRating
);

export default router;
