import express from "express";
import Auth from "../middlewares/auth.js";
import { blockSellers } from "../middlewares/blockSellers.js";
import { blockBuyers } from "../middlewares/blockBuyers.js";
import {
  createReturnRequest,
  getMyReturns,
  getSellerReturns,
  getReturnRequest,
  approveReturn,
  rejectReturn,
  cancelReturn,
} from "../controllers/return.js";

const router = express.Router();

// All return routes require authentication
router.use(Auth);

// Buyer routes - create return, view own returns
router.post("/:orderId", blockSellers, createReturnRequest);
router.get("/me", blockSellers, getMyReturns);
router.get("/:returnId", getReturnRequest);
router.delete("/:returnId", blockSellers, cancelReturn); // Cancel return request

// Seller routes - view returns for their products, approve/reject
router.get("/seller/list", blockBuyers, getSellerReturns);
router.post("/:returnId/approve", blockBuyers, approveReturn);
router.post("/:returnId/reject", blockBuyers, rejectReturn);

export default router;

