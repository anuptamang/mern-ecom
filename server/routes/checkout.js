import express from "express";
import Auth from "../middlewares/auth.js";
import { blockSellers } from "../middlewares/blockSellers.js";
import { createPaymentIntent } from "../controllers/checkout.js";

const router = express.Router();

router.use(Auth);
router.use(blockSellers);
router.post("/create-payment-intent", createPaymentIntent);

export default router;
