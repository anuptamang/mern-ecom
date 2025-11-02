import express from "express";
import Auth from "../middlewares/auth.js";
import {
  getPendingPayouts,
  getPayouts,
  getPayout,
  processPayout,
  cancelPayout,
} from "../controllers/payout.js";

const router = express.Router();

// All routes require authentication
router.get("/pending", Auth, getPendingPayouts);
router.get("/", Auth, getPayouts);
router.get("/:payoutId", Auth, getPayout);
router.post("/:payoutId/process", Auth, processPayout);
router.post("/:payoutId/cancel", Auth, cancelPayout);

export default router;
