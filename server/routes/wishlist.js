import express from "express";
import Auth from "../middlewares/auth.js";
import { blockSellers } from "../middlewares/blockSellers.js";
import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
  checkWishlistStatus,
  getSellerWishlist,
} from "../controllers/wishlist.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(Auth);

// Buyer routes - sellers cannot add to wishlist
router.post("/", blockSellers, addToWishlist);
router.delete("/:productId", blockSellers, removeFromWishlist);
router.get("/me", blockSellers, getMyWishlist);
router.get("/check/:productId", blockSellers, checkWishlistStatus);

// Seller route - get wishlist for their products
router.get("/seller", getSellerWishlist);

export default router;

