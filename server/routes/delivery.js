import express from "express";
import Auth from "../middlewares/auth.js";
import {
  updateDeliveryStatus,
  getDeliveryTracking,
  cancelOrder,
} from "../controllers/delivery.js";
import { getRefundStatus } from "../controllers/refund.js";
import {
  assignToDeliveryAgency,
  assignToDeliveryPerson,
  markAsDelivered,
  acceptDelivery,
  rejectDelivery,
  getAgencyDeliveries,
  getPersonDeliveries,
  getAgencyPersons,
} from "../controllers/deliveryAssignment.js";
import { Upload } from "../middlewares/upload.js";

const router = express.Router();

// All delivery routes require authentication
router.use(Auth);

// Get deliveries for delivery agency (must be before /:orderId)
router.get("/agency/list", getAgencyDeliveries);

// Get deliveries for delivery person (must be before /:orderId)
router.get("/person/list", getPersonDeliveries);

// Get delivery persons for an agency (must be before /:orderId)
router.get("/agency/persons", getAgencyPersons); // For logged-in agency
router.get("/agency/:agencyId/persons", getAgencyPersons);

// Get delivery tracking for an order
router.get("/:orderId", getDeliveryTracking);

// Get refund status for an order
router.get("/:orderId/refund", getRefundStatus);

// Update delivery status (role-based: sellers, delivery agency, delivery person, admin)
router.patch("/:orderId/status", updateDeliveryStatus);

// Assign delivery to delivery agency (admin, seller)
router.post("/:orderId/assign-agency", assignToDeliveryAgency);

// Assign delivery to delivery person (admin, delivery agency)
router.post("/:orderId/assign-person", assignToDeliveryPerson);

// Mark as delivered with proof (delivery person only)
router.post("/:orderId/delivered", Upload.single("deliveryProof"), markAsDelivered);

// Buyer accepts delivery
router.post("/:orderId/accept", acceptDelivery);

// Buyer rejects delivery
router.post("/:orderId/reject", rejectDelivery);

// Cancel order and process refund
router.post("/:orderId/cancel", cancelOrder);

export default router;

