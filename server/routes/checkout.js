import express from "express";
import Auth from "../middlewares/auth.js";
import { createPaymentIntent } from "../controllers/checkout.js";

const router = express.Router();

router.use(Auth);
router.post("/create-payment-intent", createPaymentIntent);

export default router;
