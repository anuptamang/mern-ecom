import express from "express";
import Auth from "../middlewares/auth.js";
import { blockSellers } from "../middlewares/blockSellers.js";
import { addItem, clearCart, getMyCart, removeItem, updateItem } from "../controllers/carts.js";

const router = express.Router();

router.use(Auth);
router.use(blockSellers);

router.get("/me", getMyCart);
router.post("/items", addItem);
router.patch("/items", updateItem);
router.delete("/items/:productId", removeItem);
router.delete("/clear", clearCart);

export default router;
