import express from "express";
import Auth from "../middlewares/auth.js";
import { blockSellers } from "../middlewares/blockSellers.js";
import { createOrder, listMyOrders } from "../controllers/orders.js";

const router = express.Router();

router.use(Auth);
router.post("/", blockSellers, createOrder);
router.get("/me", listMyOrders);

export default router;
