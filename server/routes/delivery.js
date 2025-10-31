import express from "express";
import Auth from "../middlewares/auth.js";
import {
  updateDeliveryStatus,
  getDeliveryTracking,
  cancelOrder,
} from "../controllers/delivery.js";
import { getRefundStatus } from "../controllers/refund.js";

const router = express.Router();

// All delivery routes require authentication
router.use(Auth);

// Get delivery tracking for an order
router.get("/:orderId", getDeliveryTracking);

// Update delivery status (for sellers/admin)
router.patch("/:orderId/status", updateDeliveryStatus);

// Cancel order and process refund
router.post("/:orderId/cancel", cancelOrder);

// Get refund status for an order
router.get("/:orderId/refund", getRefundStatus);

export default router;

