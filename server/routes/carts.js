import express from "express";
import Auth from "../middlewares/auth.js";
import { blockSellers } from "../middlewares/blockSellers.js";
import { addItem, clearCart, getMyCart, removeItem, updateItem, getSellerCartItems } from "../controllers/carts.js";

const router = express.Router();

router.use(Auth);

// Buyer routes (block sellers)
router.get("/me", blockSellers, getMyCart);
router.post("/items", blockSellers, addItem);
router.patch("/items", blockSellers, updateItem);
router.delete("/items/:productId", blockSellers, removeItem);
router.delete("/clear", blockSellers, clearCart);

// Seller route (no blockSellers middleware)
router.get("/seller", getSellerCartItems);

export default router;
