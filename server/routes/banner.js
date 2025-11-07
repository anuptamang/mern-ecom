import express from "express";
import {
  getBannerSlides,
  getBannerSlide,
  createBannerSlide,
  updateBannerSlide,
  deleteBannerSlide,
  reorderBannerSlides,
} from "../controllers/banner.js";
import Auth from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/rbac.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/banners:
 *   get:
 *     summary: Get all banner slides
 *     description: Retrieve all active banner slides
 *     tags: [Banners]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of banner slides
 */
router.get("/", getBannerSlides);

/**
 * @swagger
 * /api/v1/banners/{id}:
 *   get:
 *     summary: Get banner slide by ID
 *     description: Retrieve a specific banner slide by ID
 *     tags: [Banners]
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
 *         description: Banner slide details
 */
router.get("/:id", getBannerSlide);

/**
 * @swagger
 * /api/v1/banners:
 *   post:
 *     summary: Create banner slide (admin only)
 *     description: Create a new banner slide (admin only)
 *     tags: [Banners]
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
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               link:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Banner slide created
 */
router.post("/", Auth, requireAdmin, createBannerSlide);

/**
 * @swagger
 * /api/v1/banners/{id}:
 *   put:
 *     summary: Update banner slide (admin only)
 *     description: Update an existing banner slide (admin only)
 *     tags: [Banners]
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
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Banner slide updated
 */
router.put("/:id", Auth, requireAdmin, updateBannerSlide);

/**
 * @swagger
 * /api/v1/banners/{id}:
 *   delete:
 *     summary: Delete banner slide (admin only)
 *     description: Delete a banner slide (admin only)
 *     tags: [Banners]
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
 *         description: Banner slide deleted
 */
router.delete("/:id", Auth, requireAdmin, deleteBannerSlide);

/**
 * @swagger
 * /api/v1/banners/reorder:
 *   post:
 *     summary: Reorder banner slides (admin only)
 *     description: Reorder banner slides (admin only)
 *     tags: [Banners]
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
 *               slideIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Banner slides reordered
 */
router.post("/reorder", Auth, requireAdmin, reorderBannerSlides);

export default router;
