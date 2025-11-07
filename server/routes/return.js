import express from "express";
import Auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/rbac.js";
import { Upload } from "../middlewares/upload.js";
import {
  createReturnRequest,
  getMyReturns,
  getSellerReturns,
  getReturnRequest,
  approveReturn,
  rejectReturn,
  cancelReturn,
} from "../controllers/return.js";
import {
  getSupportReturns,
  getAgencyReturns,
  getReturnDelivererReturns,
  getVerificationTeamReturns,
  getInspectorReturns,
  getFinanceReturns,
  assignSupportUser,
  assignReturnDeliveryAgency,
  assignReturnDeliverer,
  markReturnPickedUp,
  markReturnDelivered,
  submitToSupport,
  assignVerificationTeam,
  assignReturnInspector,
  inspectReturn,
  assignFinance,
  processRefund,
  assignRedeliveryAgency,
  reassignSupportUser,
  reassignReturnDeliveryAgency,
  reassignReturnDeliverer,
  reassignVerificationTeam,
  reassignInspector,
  reassignFinance,
  rejectReturnAssignment,
} from "../controllers/returnWorkflow.js";

const router = express.Router();

// All return routes require authentication
router.use(Auth);

/**
 * @swagger
 * /api/v1/return/{orderId}:
 *   post:
 *     summary: Create return request
 *     description: Create a return request for an order with proof images
 *     tags: [Returns]
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
 *               reason:
 *                 type: string
 *               proofImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Return request created
 */
router.post(
  "/:orderId",
  requirePermission("returns", "create"),
  Upload.array("proofImages", 5),
  createReturnRequest
);

/**
 * @swagger
 * /api/v1/return/me:
 *   get:
 *     summary: Get my returns
 *     description: Get all return requests for the current user
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of return requests
 */
router.get("/me", requirePermission("returns", "read"), getMyReturns);

/**
 * @swagger
 * /api/v1/return/{returnId}:
 *   get:
 *     summary: Get return request
 *     description: Get details of a specific return request
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return request details
 */
router.get(
  "/:returnId",
  requirePermission("returns", "read"),
  getReturnRequest
);

/**
 * @swagger
 * /api/v1/return/{returnId}:
 *   delete:
 *     summary: Cancel return request
 *     description: Cancel a return request
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return request cancelled
 */
router.delete(
  "/:returnId",
  requirePermission("returns", "delete"),
  cancelReturn
);

/**
 * @swagger
 * /api/v1/return/seller/list:
 *   get:
 *     summary: Get seller returns
 *     description: Get all return requests for seller's products
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of seller returns
 */
router.get(
  "/seller/list",
  requirePermission("returns", "read"),
  getSellerReturns
);

/**
 * @swagger
 * /api/v1/return/{returnId}/approve:
 *   post:
 *     summary: Approve return (legacy)
 *     description: Approve a return request (legacy endpoint)
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return approved
 */
router.post(
  "/:returnId/approve",
  requirePermission("returns", "update"),
  approveReturn
);

/**
 * @swagger
 * /api/v1/return/{returnId}/reject:
 *   post:
 *     summary: Reject return (legacy)
 *     description: Reject a return request (legacy endpoint)
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return rejected
 */
router.post(
  "/:returnId/reject",
  requirePermission("returns", "update"),
  rejectReturn
);

/**
 * @swagger
 * /api/v1/return/support/list:
 *   get:
 *     summary: Get support returns
 *     description: Get all return requests for support team
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of support returns
 */
router.get(
  "/support/list",
  requirePermission("returns", "read"),
  getSupportReturns
);

/**
 * @swagger
 * /api/v1/return/{returnId}/assign-support:
 *   post:
 *     summary: Assign support user
 *     description: Assign a support user to handle a return request
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               supportUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Support user assigned
 */
router.post(
  "/:returnId/assign-support",
  requirePermission("returns", "assign"),
  assignSupportUser
);

/**
 * @swagger
 * /api/v1/return/{returnId}/assign-agency:
 *   post:
 *     summary: Assign return delivery agency
 *     description: Assign a delivery agency for return pickup
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *         description: Delivery agency assigned
 */
router.post(
  "/:returnId/assign-agency",
  requirePermission("returns", "assign"),
  assignReturnDeliveryAgency
);

/**
 * @swagger
 * /api/v1/return/{returnId}/assign-verification:
 *   post:
 *     summary: Assign verification team
 *     description: Assign a verification team to inspect the return
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification team assigned
 */
router.post(
  "/:returnId/assign-verification",
  requirePermission("returns", "assign"),
  assignVerificationTeam
);

/**
 * @swagger
 * /api/v1/return/{returnId}/assign-finance:
 *   post:
 *     summary: Assign finance team
 *     description: Assign finance team to process refund
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               financeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Finance team assigned
 */
router.post(
  "/:returnId/assign-finance",
  requirePermission("returns", "assign"),
  assignFinance
);

/**
 * @swagger
 * /api/v1/return/{returnId}/assign-redelivery:
 *   post:
 *     summary: Assign redelivery agency
 *     description: Assign delivery agency for redelivery after rejected return
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *         description: Redelivery agency assigned
 */
router.post(
  "/:returnId/assign-redelivery",
  requirePermission("returns", "assign"),
  assignRedeliveryAgency
);

/**
 * @swagger
 * /api/v1/return/agency/list:
 *   get:
 *     summary: Get agency returns
 *     description: Get all return requests assigned to the delivery agency
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of agency returns
 */
router.get(
  "/agency/list",
  requirePermission("returns", "read"),
  getAgencyReturns
);

/**
 * @swagger
 * /api/v1/return/{returnId}/assign-deliverer:
 *   post:
 *     summary: Assign return deliverer
 *     description: Assign a deliverer for return pickup
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               delivererId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Return deliverer assigned
 */
router.post(
  "/:returnId/assign-deliverer",
  requirePermission("returns", "assign"),
  assignReturnDeliverer
);

/**
 * @swagger
 * /api/v1/return/deliverer/list:
 *   get:
 *     summary: Get deliverer returns
 *     description: Get all return requests assigned to the return deliverer
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of deliverer returns
 */
router.get(
  "/deliverer/list",
  requirePermission("returns", "read"),
  getReturnDelivererReturns
);

/**
 * @swagger
 * /api/v1/return/{returnId}/picked-up:
 *   post:
 *     summary: Mark return as picked up
 *     description: Mark return package as picked up with proof
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               pickupProof:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Return marked as picked up
 */
router.post(
  "/:returnId/picked-up",
  requirePermission("returns", "update"),
  Upload.single("pickupProof"),
  markReturnPickedUp
);

/**
 * @swagger
 * /api/v1/return/{returnId}/delivered:
 *   post:
 *     summary: Mark return as delivered
 *     description: Mark return package as delivered to support
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return marked as delivered
 */
router.post(
  "/:returnId/delivered",
  requirePermission("returns", "update"),
  markReturnDelivered
);

/**
 * @swagger
 * /api/v1/return/{returnId}/submit-to-support:
 *   post:
 *     summary: Submit to support
 *     description: Submit return package to support team
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return submitted to support
 */
router.post(
  "/:returnId/submit-to-support",
  requirePermission("returns", "update"),
  submitToSupport
);

/**
 * @swagger
 * /api/v1/return/verification/list:
 *   get:
 *     summary: Get verification team returns
 *     description: Get all return requests assigned to the verification team
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of verification team returns
 */
router.get(
  "/verification/list",
  requirePermission("returns", "read"),
  getVerificationTeamReturns
);

/**
 * @swagger
 * /api/v1/return/{returnId}/assign-inspector:
 *   post:
 *     summary: Assign inspector
 *     description: Assign an inspector to inspect the return
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               inspectorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inspector assigned
 */
router.post(
  "/:returnId/assign-inspector",
  requirePermission("returns", "assign"),
  assignReturnInspector
);

/**
 * @swagger
 * /api/v1/return/inspector/list:
 *   get:
 *     summary: Get inspector returns
 *     description: Get all return requests assigned to the inspector
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of inspector returns
 */
router.get(
  "/inspector/list",
  requirePermission("returns", "read"),
  getInspectorReturns
);

/**
 * @swagger
 * /api/v1/return/{returnId}/inspect:
 *   post:
 *     summary: Inspect return
 *     description: Inspect return package and accept/reject
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               result:
 *                 type: string
 *                 enum: [accept, reject]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Return inspected
 */
router.post(
  "/:returnId/inspect",
  requirePermission("returns", "update"),
  inspectReturn
);

/**
 * @swagger
 * /api/v1/return/finance/list:
 *   get:
 *     summary: Get finance returns
 *     description: Get all return requests assigned to finance team
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of finance returns
 */
router.get(
  "/finance/list",
  requirePermission("returns", "read"),
  getFinanceReturns
);

/**
 * @swagger
 * /api/v1/return/{returnId}/process-refund:
 *   post:
 *     summary: Process refund
 *     description: Process refund for accepted return
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Refund processed
 */
router.post(
  "/:returnId/process-refund",
  requirePermission("returns", "update"),
  processRefund
);

/**
 * @swagger
 * /api/v1/return/{returnId}/reassign-support:
 *   post:
 *     summary: Reassign support user
 *     description: Reassign a different support user
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               supportUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Support user reassigned
 */
router.post(
  "/:returnId/reassign-support",
  requirePermission("returns", "assign"),
  reassignSupportUser
);

/**
 * @swagger
 * /api/v1/return/{returnId}/reassign-agency:
 *   post:
 *     summary: Reassign return delivery agency
 *     description: Reassign a different delivery agency
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
  "/:returnId/reassign-agency",
  requirePermission("returns", "assign"),
  reassignReturnDeliveryAgency
);

/**
 * @swagger
 * /api/v1/return/{returnId}/reassign-deliverer:
 *   post:
 *     summary: Reassign return deliverer
 *     description: Reassign a different return deliverer
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               delivererId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Return deliverer reassigned
 */
router.post(
  "/:returnId/reassign-deliverer",
  requirePermission("returns", "assign"),
  reassignReturnDeliverer
);

/**
 * @swagger
 * /api/v1/return/{returnId}/reassign-verification:
 *   post:
 *     summary: Reassign verification team
 *     description: Reassign a different verification team
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               teamId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification team reassigned
 */
router.post(
  "/:returnId/reassign-verification",
  requirePermission("returns", "assign"),
  reassignVerificationTeam
);

/**
 * @swagger
 * /api/v1/return/{returnId}/reassign-inspector:
 *   post:
 *     summary: Reassign inspector
 *     description: Reassign a different inspector
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               inspectorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inspector reassigned
 */
router.post(
  "/:returnId/reassign-inspector",
  requirePermission("returns", "assign"),
  reassignInspector
);

/**
 * @swagger
 * /api/v1/return/{returnId}/reassign-finance:
 *   post:
 *     summary: Reassign finance team
 *     description: Reassign a different finance user
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
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
 *               financeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Finance team reassigned
 */
router.post(
  "/:returnId/reassign-finance",
  requirePermission("returns", "assign"),
  reassignFinance
);

/**
 * @swagger
 * /api/v1/return/{returnId}/reject-assignment:
 *   post:
 *     summary: Reject return assignment
 *     description: Reject a return assignment
 *     tags: [Returns]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: returnId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment rejected
 */
router.post(
  "/:returnId/reject-assignment",
  requirePermission("returns", "update"),
  rejectReturnAssignment
);

export default router;
