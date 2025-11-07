import express from "express";
import Auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/rbac.js";
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
  getAgencyDeliveries,
  getPersonDeliveries,
  getWarehouseOperatorDeliveries,
  getAgencyPersons,
  getWarehouseOperators,
  assignWarehouseOperator,
  createDeliveryPerson,
  reassignDeliveryAgency,
  reassignDeliveryPerson,
  reassignWarehouseOperator,
  rejectDeliveryAssignment,
} from "../controllers/deliveryAssignment.js";
import { Upload } from "../middlewares/upload.js";

const router = express.Router();

// All delivery routes require authentication
router.use(Auth);

/**
 * @swagger
 * /api/v1/delivery/agency/list:
 *   get:
 *     summary: Get agency deliveries
 *     description: Get all deliveries assigned to the delivery agency
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of agency deliveries
 */
router.get(
  "/agency/list",
  requirePermission("deliveries", "read"),
  getAgencyDeliveries
);

/**
 * @swagger
 * /api/v1/delivery/person/list:
 *   get:
 *     summary: Get person deliveries
 *     description: Get all deliveries assigned to the delivery person
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of person deliveries
 */
router.get(
  "/person/list",
  requirePermission("deliveries", "read"),
  getPersonDeliveries
);

/**
 * @swagger
 * /api/v1/delivery/warehouse-operator/list:
 *   get:
 *     summary: Get warehouse operator deliveries
 *     description: Get all deliveries assigned to the warehouse operator
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of warehouse operator deliveries
 */
router.get(
  "/warehouse-operator/list",
  requirePermission("deliveries", "read"),
  getWarehouseOperatorDeliveries
);

/**
 * @swagger
 * /api/v1/delivery/agency/persons:
 *   get:
 *     summary: Get agency delivery persons
 *     description: Get all delivery persons for the agency
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivery persons
 */
router.get(
  "/agency/persons",
  requirePermission("deliveries", "read"),
  getAgencyPersons
);

/**
 * @swagger
 * /api/v1/delivery/agency/{agencyId}/persons:
 *   get:
 *     summary: Get agency delivery persons by ID
 *     description: Get all delivery persons for a specific agency
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of delivery persons
 */
router.get(
  "/agency/:agencyId/persons",
  requirePermission("deliveries", "read"),
  getAgencyPersons
);

/**
 * @swagger
 * /api/v1/delivery/warehouse-operators:
 *   get:
 *     summary: Get warehouse operators
 *     description: Get all warehouse operators
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of warehouse operators
 */
router.get(
  "/warehouse-operators",
  requirePermission("deliveries", "read"),
  getWarehouseOperators
);

/**
 * @swagger
 * /api/v1/delivery/agency/persons:
 *   post:
 *     summary: Create delivery person
 *     description: Create a new delivery person for the agency
 *     tags: [Delivery]
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
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Delivery person created
 */
router.post(
  "/agency/persons",
  requirePermission("user", "create"),
  createDeliveryPerson
);

/**
 * @swagger
 * /api/v1/delivery/agency/{agencyId}/persons:
 *   post:
 *     summary: Create delivery person for agency
 *     description: Create a new delivery person for a specific agency
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
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
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Delivery person created
 */
router.post(
  "/agency/:agencyId/persons",
  requirePermission("user", "create"),
  createDeliveryPerson
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}:
 *   get:
 *     summary: Get delivery tracking
 *     description: Get delivery tracking information for an order
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery tracking information
 */
router.get(
  "/:orderId",
  requirePermission("deliveries", "read"),
  getDeliveryTracking
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/refund:
 *   get:
 *     summary: Get refund status
 *     description: Get refund status for an order
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Refund status
 */
router.get(
  "/:orderId/refund",
  requirePermission("deliveries", "read"),
  getRefundStatus
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/status:
 *   patch:
 *     summary: Update delivery status
 *     description: Update the delivery status for an order
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery status updated
 */
router.patch(
  "/:orderId/status",
  requirePermission("deliveries", "update"),
  updateDeliveryStatus
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/assign-agency:
 *   post:
 *     summary: Assign delivery to agency
 *     description: Assign a delivery to a delivery agency
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               agencyId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery assigned to agency
 */
router.post(
  "/:orderId/assign-agency",
  requirePermission("deliveries", "assign"),
  assignToDeliveryAgency
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/assign-person:
 *   post:
 *     summary: Assign delivery to person
 *     description: Assign a delivery to a delivery person
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               personId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery assigned to person
 */
router.post(
  "/:orderId/assign-person",
  requirePermission("deliveries", "assign"),
  assignToDeliveryPerson
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/assign-warehouse-operator:
 *   post:
 *     summary: Assign warehouse operator
 *     description: Assign a warehouse operator to a delivery
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               operatorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Warehouse operator assigned
 */
router.post(
  "/:orderId/assign-warehouse-operator",
  requirePermission("deliveries", "assign"),
  assignWarehouseOperator
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/delivered:
 *   post:
 *     summary: Mark as delivered
 *     description: Mark an order as delivered with proof
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               deliveryProof:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Order marked as delivered
 */
router.post(
  "/:orderId/delivered",
  requirePermission("deliveries", "update"),
  Upload.single("deliveryProof"),
  markAsDelivered
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/cancel:
 *   post:
 *     summary: Cancel order
 *     description: Cancel an order and process refund
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled and refund processed
 */
router.post(
  "/:orderId/cancel",
  requirePermission("deliveries", "update"),
  cancelOrder
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/reassign-agency:
 *   post:
 *     summary: Reassign delivery agency
 *     description: Reassign a delivery to a different agency
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               agencyId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery agency reassigned
 */
router.post(
  "/:orderId/reassign-agency",
  requirePermission("deliveries", "assign"),
  reassignDeliveryAgency
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/reassign-person:
 *   post:
 *     summary: Reassign delivery person
 *     description: Reassign a delivery to a different person
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               personId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery person reassigned
 */
router.post(
  "/:orderId/reassign-person",
  requirePermission("deliveries", "assign"),
  reassignDeliveryPerson
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/reassign-warehouse-operator:
 *   post:
 *     summary: Reassign warehouse operator
 *     description: Reassign a warehouse operator for a delivery
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               operatorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Warehouse operator reassigned
 */
router.post(
  "/:orderId/reassign-warehouse-operator",
  requirePermission("deliveries", "assign"),
  reassignWarehouseOperator
);

/**
 * @swagger
 * /api/v1/delivery/{orderId}/reject-assignment:
 *   post:
 *     summary: Reject delivery assignment
 *     description: Reject a delivery assignment
 *     tags: [Delivery]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment rejected
 */
router.post(
  "/:orderId/reject-assignment",
  requirePermission("deliveries", "update"),
  rejectDeliveryAssignment
);

export default router;
