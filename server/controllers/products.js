import * as dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/product.js";
import User from "../models/user.js";
dotenv.config();

const PORT = process.env.PORT || 3010;

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  const { page } = req.query;

  try {
    const LIMIT = 15;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await Product.countDocuments({});
    const products = await Product.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);
    res.status(200).json({
      data: products,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const createProduct = async (req, res) => {
  if (req.file == undefined) {
    return res.json({ message: "Error: No File Selected!" });
  }

  const { title, body, tag, categories, slug } = req.body;
  const fullUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

  const newProduct = new Product({
    userID: req.userId,
    createdAt: new Date().toISOString(),
    title,
    body,
    tag,
    categories,
    slug,
    thumbnail: fullUrl,
  });

  try {
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(409).json({ message: error });
  }
};

export const updateProduct = async (req, res) => {
  const { id: _id } = req.params;
  const product = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No product with that ID");
  const updatedProduct = await Product.findByIdAndUpdate(
    _id,
    { ...product, _id },
    { new: true }
  );
  res.json(updateProduct);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No product with that ID");
  await Product.findByIdAndRemove(id);
  res.json({ message: "Product deleted successfully" });
};

export const AddLikeToProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.likes = product.likes + 1;
  await product.save();

  return res.json(product);
};

export const RemoveLikeFromProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.likes = product.likes - 1;
  if (product.likes < 0) {
    product.likes = 0;
  }
  await product.save();

  return res.json(product);
};

export const addCommentToProduct = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    let userId = req.body.userId;
    if (!user) {
      userId = "ghost";
    }
    const product = await Product.findById(req.params.id);
    product.comments.push({ text: req.body.text, userId: userId });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
  }
};

export const allComments = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(201).json(product.comments);
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
  }
};

export const likeComment = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const comment = product.comments.id(req.params.commentId);
    comment.likes++;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: "Comment not found" });
  }
};

export const replyComment = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const comment = product.comments.id(req.params.commentId);
    comment.replies.push(req.body.text);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: "Comment not found" });
  }
};

export const viewCount = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    product.views++;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
  }
};
