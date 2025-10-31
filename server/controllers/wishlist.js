import Wishlist from "../models/wishlist.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import { createNotification } from "./notifications.js";
import mongoose from "mongoose";

/**
 * Add product to wishlist
 */
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if product exists
    const product = await Product.findById(productId).populate('userID', 'fullName email');
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({ userId, productId });
    if (existingWishlist) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      userId,
      productId,
    });

    // Create notification for seller
    if (product.userID && String(product.userID._id) !== String(userId)) {
      try {
        const user = await User.findById(userId);
        await createNotification({
          userId: product.userID._id,
          type: "system",
          title: "Product Added to Wishlist",
          message: `${user?.fullName || "Someone"} added "${product.title}" to their wishlist`,
          relatedEntity: {
            entityType: "product",
            entityId: product._id,
          },
          actionUrl: `/user/products`,
          metadata: {
            productId: product._id,
            productTitle: product.title,
            userId: userId,
            userName: user?.fullName || "Anonymous",
          },
        });
      } catch (notifError) {
        console.error("Error creating wishlist notification:", notifError);
        // Don't fail the request if notification creation fails
      }
    }

    return res.status(201).json({ message: "Product added to wishlist", wishlistItem });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({ message: "Failed to add product to wishlist" });
  }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({ userId, productId });

    if (!wishlistItem) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    return res.json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({ message: "Failed to remove product from wishlist" });
  }
};

/**
 * Get user's wishlist
 */
export const getMyWishlist = async (req, res) => {
  try {
    const userId = req.userId;

    const wishlistItems = await Wishlist.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 })
      .lean();

    // Filter out null products (in case product was deleted)
    const validItems = wishlistItems.filter((item) => item.productId);

    return res.json({ wishlist: validItems, count: validItems.length });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

/**
 * Check if product is in user's wishlist
 */
export const checkWishlistStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOne({ userId, productId });

    return res.json({ isInWishlist: !!wishlistItem });
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    return res.status(500).json({ message: "Failed to check wishlist status" });
  }
};

/**
 * Get wishlist for seller's products (who added their products to wishlist)
 */
export const getSellerWishlist = async (req, res) => {
  try {
    const sellerId = req.userId;

    // Find all products owned by seller - handle both string and ObjectId userID
    const sellerProducts = await Product.find({
      $or: [
        { userID: sellerId },
        { userID: String(sellerId) },
        { userID: new mongoose.Types.ObjectId(sellerId) },
      ],
    }).select("_id");

    const productIds = sellerProducts.map((p) => p._id);

    if (productIds.length === 0) {
      return res.json({ wishlist: [], count: 0 });
    }

    // Find all wishlist items for seller's products
    const wishlistItems = await Wishlist.find({ productId: { $in: productIds } })
      .populate("userId", "fullName email profilePhoto")
      .populate("productId", "title thumbnail price stock")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ wishlist: wishlistItems, count: wishlistItems.length });
  } catch (error) {
    console.error("Error fetching seller wishlist:", error);
    return res.status(500).json({ message: "Failed to fetch seller wishlist" });
  }
};

