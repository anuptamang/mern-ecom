import express from "express";
import Auth from "../middlewares/auth.js";
import { blockSellers } from "../middlewares/blockSellers.js";
import { blockBuyers } from "../middlewares/blockBuyers.js";
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

// Buyer routes - create return (with file upload), view own returns
router.post("/:orderId", blockSellers, Upload.array("proofImages", 5), createReturnRequest);
router.get("/me", blockSellers, getMyReturns);
router.get("/:returnId", getReturnRequest);
router.delete("/:returnId", blockSellers, cancelReturn); // Cancel return request

// Seller routes - view returns for their products, approve/reject (legacy)
router.get("/seller/list", blockBuyers, getSellerReturns);
router.post("/:returnId/approve", blockBuyers, approveReturn);
router.post("/:returnId/reject", blockBuyers, rejectReturn);

// Support team routes
router.get("/support/list", getSupportReturns);
router.post("/:returnId/assign-support", assignSupportUser);

// Support user routes
router.post("/:returnId/assign-agency", assignReturnDeliveryAgency);
router.post("/:returnId/assign-verification", assignVerificationTeam);
router.post("/:returnId/assign-finance", assignFinance);
router.post("/:returnId/assign-redelivery", assignRedeliveryAgency);

// Delivery agency routes (return pickup)
router.get("/agency/list", getAgencyReturns); // Get return assignments for delivery agency
router.post("/:returnId/assign-deliverer", assignReturnDeliverer);

// Return deliverer routes
router.get("/deliverer/list", getReturnDelivererReturns); // Get return assignments for return deliverer
router.post("/:returnId/picked-up", Upload.single("pickupProof"), markReturnPickedUp);
router.post("/:returnId/delivered", markReturnDelivered); // Mark return as delivered to buyer (re-delivery flow)
router.post("/:returnId/submit-to-support", submitToSupport); // Submit return package to support team

// Verification team routes
router.get("/verification/list", getVerificationTeamReturns); // Get return assignments for verification team
router.post("/:returnId/assign-inspector", assignReturnInspector);

// Inspector routes
router.get("/inspector/list", getInspectorReturns); // Get return assignments for inspector
router.post("/:returnId/inspect", inspectReturn);

// Finance routes
router.get("/finance/list", getFinanceReturns); // Get return assignments for finance
router.post("/:returnId/process-refund", processRefund);

// Reassign endpoints
router.post("/:returnId/reassign-support", reassignSupportUser);
router.post("/:returnId/reassign-agency", reassignReturnDeliveryAgency);
router.post("/:returnId/reassign-deliverer", reassignReturnDeliverer);
router.post("/:returnId/reassign-verification", reassignVerificationTeam);
router.post("/:returnId/reassign-inspector", reassignInspector);
router.post("/:returnId/reassign-finance", reassignFinance);

// Reject assignment endpoint
router.post("/:returnId/reject-assignment", rejectReturnAssignment);

export default router;
