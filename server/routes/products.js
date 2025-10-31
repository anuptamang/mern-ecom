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
} from "../controllers/products.js";
import Auth from "../middlewares/auth.js";
import { Upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/me", Auth, getMyProducts);
router.get("/:id", getProduct);
router.post("/", Auth, Upload, createProduct);
router.patch("/:id", Auth, updateProduct);
router.delete("/:id", Auth, deleteProduct);
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
