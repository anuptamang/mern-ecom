import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "products",
      required: true,
      index: true,
    },
    addedAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one user can't add the same product twice
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for seller queries (products with their userID)
wishlistSchema.index({ productId: 1, createdAt: -1 });

const Wishlist = mongoose.model("wishlists", wishlistSchema);

export default Wishlist;

