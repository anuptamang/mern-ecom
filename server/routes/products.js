import express from "express";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  AddLikeToProduct,
  RemoveLikeFromProduct,
  addCommentToProduct,
  allComments,
  likeComment,
  replyComment,
  viewCount,
  getMyProducts,
  addRating,
  getRatings,
  getRelatedProducts,
  getAllTags,
} from "../controllers/products.js";
import Auth from "../middlewares/auth.js";
import { Upload, UploadProduct } from "../middlewares/upload.js";
import { blockBuyers } from "../middlewares/blockBuyers.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/tags", getAllTags);
router.get("/me", Auth, blockBuyers, getMyProducts);
router.get("/:id/related", getRelatedProducts);
router.get("/:id", getProduct);
router.post("/", Auth, blockBuyers, UploadProduct, createProduct);
router.patch("/:id", Auth, blockBuyers, UploadProduct, updateProduct);
router.delete("/:id", Auth, blockBuyers, deleteProduct);
router.put("/:id/like", AddLikeToProduct);
router.delete("/:id/like", RemoveLikeFromProduct);
router.get("/:id/comments", allComments);
router.post("/:id/comments", Auth, addCommentToProduct);
router.patch("/:id/comments/:commentId/like", likeComment);
router.patch("/:id/comments/:commentId/reply", replyComment);
router.patch("/:id/viewcount", viewCount);
router.get("/:id/ratings", getRatings);
router.post("/:id/ratings", Auth, addRating);

export default router;
