import express from "express";
import Auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/rbac.js";
import {
  getPendingPayouts,
  getPayouts,
  getPayout,
  processPayout,
  cancelPayout,
} from "../controllers/payout.js";

const router = express.Router();

// All routes require authentication
router.use(Auth);

/**
 * @swagger
 * /api/v1/payouts/pending:
 *   get:
 *     summary: Get pending payouts
 *     description: Retrieve all pending payouts (finance/admin only)
 *     tags: [Payouts]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending payouts
 */
router.get("/pending", requirePermission("payouts", "read"), getPendingPayouts);

/**
 * @swagger
 * /api/v1/payouts:
 *   get:
 *     summary: Get all payouts
 *     description: Retrieve all payouts (finance/admin only)
 *     tags: [Payouts]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of payouts
 */
router.get("/", requirePermission("payouts", "read"), getPayouts);

/**
 * @swagger
 * /api/v1/payouts/{payoutId}:
 *   get:
 *     summary: Get payout by ID
 *     description: Retrieve a specific payout by ID
 *     tags: [Payouts]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payoutId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payout details
 */
router.get("/:payoutId", requirePermission("payouts", "read"), getPayout);

/**
 * @swagger
 * /api/v1/payouts/{payoutId}/process:
 *   post:
 *     summary: Process payout
 *     description: Process a payout (finance/admin only)
 *     tags: [Payouts]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payoutId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payout processed
 */
router.post(
  "/:payoutId/process",
  requirePermission("payouts", "update"),
  processPayout
);

/**
 * @swagger
 * /api/v1/payouts/{payoutId}/cancel:
 *   post:
 *     summary: Cancel payout
 *     description: Cancel a payout (finance/admin only)
 *     tags: [Payouts]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payoutId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payout cancelled
 */
router.post(
  "/:payoutId/cancel",
  requirePermission("payouts", "update"),
  cancelPayout
);

export default router;
