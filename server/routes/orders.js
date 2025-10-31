import express from "express";
import Auth from "../middlewares/auth.js";
import { createOrder, listMyOrders } from "../controllers/orders.js";

const router = express.Router();

router.use(Auth);
router.post("/", createOrder);
router.get("/me", listMyOrders);

export default router;
