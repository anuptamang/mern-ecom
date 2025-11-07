import express from "express";
import Auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/rbac.js";
import { createPaymentIntent } from "../controllers/checkout.js";

const router = express.Router();

// All checkout endpoints require authentication
router.use(Auth);

/**
 * @swagger
 * /api/v1/checkout/create-payment-intent:
 *   post:
 *     summary: Create payment intent
 *     description: Create a Stripe payment intent for checkout
 *     tags: [Checkout]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in cents (optional, uses cart total if not provided)
 *               currency:
 *                 type: string
 *                 default: usd
 *     responses:
 *       200:
 *         description: Payment intent created
 *       400:
 *         description: Validation error
 */
// Only buyers can create payment intents (orders permission)
router.post(
  "/create-payment-intent",
  requirePermission("orders", "create"),
  createPaymentIntent
);

export default router;
