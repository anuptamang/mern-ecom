/**
 * Theme Routes
 * Site-wide theme management
 */

import express from "express";
import {
  getActiveTheme,
  updateTheme,
  resetTheme,
  getThemeHistory,
  uploadLogo,
} from "../controllers/theme.js";
import Auth from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/rbac.js";
import { Upload } from "../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/theme/active:
 *   get:
 *     summary: Get active theme
 *     description: Retrieve the currently active theme (public)
 *     tags: [Theme]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Active theme details
 */
router.get("/active", getActiveTheme);

/**
 * @swagger
 * /api/v1/theme/history:
 *   get:
 *     summary: Get theme history (admin only)
 *     description: Retrieve theme change history (admin only)
 *     tags: [Theme]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Theme history
 */
router.get("/history", Auth, requireAdmin, getThemeHistory);

/**
 * @swagger
 * /api/v1/theme/update:
 *   put:
 *     summary: Update theme (admin only)
 *     description: Update the site theme (admin only)
 *     tags: [Theme]
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
 *               primary:
 *                 type: string
 *               secondary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Theme updated
 */
router.put("/update", Auth, requireAdmin, updateTheme);

/**
 * @swagger
 * /api/v1/theme/reset:
 *   post:
 *     summary: Reset theme (admin only)
 *     description: Reset theme to default values (admin only)
 *     tags: [Theme]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Theme reset
 */
router.post("/reset", Auth, requireAdmin, resetTheme);

/**
 * @swagger
 * /api/v1/theme/upload-logo:
 *   post:
 *     summary: Upload logo (admin only)
 *     description: Upload or update site logo (admin only)
 *     tags: [Theme]
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
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded
 */
router.post(
  "/upload-logo",
  Auth,
  requireAdmin,
  Upload.single("logo"),
  uploadLogo
);

export default router;
