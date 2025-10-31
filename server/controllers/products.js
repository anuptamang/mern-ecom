import * as dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/product.js";
import User from "../models/user.js";
dotenv.config();

const PORT = process.env.PORT || 3010;

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate('userID', 'fullName email profilePhoto');
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getRelatedProducts = async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find products with similar categories, excluding current product
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      categories: { $in: product.categories },
    })
      .populate('userID', 'fullName email profilePhoto')
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json(relatedProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
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
  const thumbnailFile = req.files?.thumbnail?.[0] || req.file;
  if (!thumbnailFile) {
    return res.status(400).json({ message: "Error: No thumbnail file selected!" });
  }

  const { title, body, tag, categories, slug, price, stock } = req.body;
  const fullUrl = `http://localhost:${PORT}/uploads/${thumbnailFile.filename}`;
  
  // Handle gallery images
  let images = [];
  if (req.files?.images && req.files.images.length > 0) {
    images = req.files.images.map(file => `http://localhost:${PORT}/uploads/${file.filename}`);
  }

  // Parse body if it's a JSON string
  let bodyObj = body;
  if (typeof body === 'string') {
    try {
      bodyObj = JSON.parse(body);
    } catch (e) {
      bodyObj = { description: body, summary: body.substring(0, 200).replace(/<[^>]*>/g, '') };
    }
  }

  // Parse categories and tags if they're strings
  let categoriesArr = categories;
  if (typeof categories === 'string') {
    categoriesArr = categories.split(',').filter(Boolean);
  } else if (Array.isArray(categories)) {
    categoriesArr = categories;
  }

  let tagsArr = tag;
  if (typeof tagsArr === 'string') {
    tagsArr = tagsArr.split(',').filter(Boolean);
  } else if (Array.isArray(tagsArr)) {
    tagsArr = tagsArr;
  }

  const newProduct = new Product({
    userID: new mongoose.Types.ObjectId(req.userId),
    createdAt: new Date().toISOString(),
    title,
    body: bodyObj,
    tag: tagsArr,
    categories: categoriesArr,
    slug: slug || title?.toLowerCase().replace(/\s+/g, '-'),
    thumbnail: fullUrl,
    images,
    price: price ? parseFloat(price) : undefined,
    stock: stock ? parseInt(stock) : 0,
  });

  try {
    await newProduct.save();
    // Populate userID before returning
    const populatedProduct = await Product.findById(newProduct._id).populate('userID', 'fullName email profilePhoto');
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(409).json({ message: error.message || error });
  }
};

export const updateProduct = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).json({ message: "No product with that ID" });
  
  const existingProduct = await Product.findById(_id);
  if (!existingProduct) {
    return res.status(404).json({ message: "No product with that ID" });
  }
  
  // Check ownership - only the product creator can update
  if (String(existingProduct.userID) !== String(req.userId)) {
    return res.status(403).json({ message: "You can only update your own products" });
  }

  const { title, body, tag, categories, slug, price, stock } = req.body;
  
  // Handle thumbnail update
  let thumbnail = existingProduct.thumbnail;
  const thumbnailFile = req.files?.thumbnail?.[0] || req.file;
  if (thumbnailFile) {
    thumbnail = `http://localhost:${PORT}/uploads/${thumbnailFile.filename}`;
  }

  // Handle gallery images
  let images = existingProduct.images || [];
  if (req.files?.images && req.files.images.length > 0) {
    const newImages = req.files.images.map(file => `http://localhost:${PORT}/uploads/${file.filename}`);
    images = [...images, ...newImages];
  }

  // Parse body if it's a JSON string
  let bodyObj = body;
  if (body) {
    if (typeof body === 'string') {
      try {
        bodyObj = JSON.parse(body);
      } catch (e) {
        bodyObj = { description: body, summary: body.substring(0, 200).replace(/<[^>]*>/g, '') };
      }
    } else {
      bodyObj = body;
    }
  }

  // Parse categories and tags if they're strings
  let categoriesArr = categories;
  if (categories) {
    if (typeof categories === 'string') {
      categoriesArr = categories.split(',').filter(Boolean);
    } else if (Array.isArray(categories)) {
      categoriesArr = categories;
    }
  }

  let tagsArr = tag;
  if (tagsArr) {
    if (typeof tagsArr === 'string') {
      tagsArr = tagsArr.split(',').filter(Boolean);
    } else if (Array.isArray(tagsArr)) {
      tagsArr = tagsArr;
    }
  }

  const updateData = {};
  if (title) updateData.title = title;
  if (bodyObj) updateData.body = bodyObj;
  if (tagsArr) updateData.tag = tagsArr;
  if (categoriesArr) updateData.categories = categoriesArr;
  if (slug) updateData.slug = slug;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (stock !== undefined) updateData.stock = parseInt(stock);
  if (thumbnail) updateData.thumbnail = thumbnail;
  if (images.length > 0) updateData.images = images;
  
  const updatedProduct = await Product.findByIdAndUpdate(
    _id,
    updateData,
    { new: true }
  ).populate('userID', 'fullName email profilePhoto');
  res.json(updatedProduct);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No product with that ID");
  
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).send("No product with that ID");
  }
  
  // Check ownership - only the product creator can delete
  if (String(product.userID) !== String(req.userId)) {
    return res.status(403).json({ message: "You can only delete your own products" });
  }
  
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
    const product = await Product.findById(req.params.id).populate("comments.userId", "fullName profilePhoto");
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

export const getMyProducts = async (req, res) => {
  try {
    const userId = req.userId;
    const products = await Product.find({ userID: userId }).sort({ _id: -1 });
    res.status(200).json({ data: products });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already rated this product
    const existingRatingIndex = product.ratings.findIndex(
      r => String(r.userId) === String(userId)
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      product.ratings[existingRatingIndex].rating = rating;
      product.ratings[existingRatingIndex].review = review || product.ratings[existingRatingIndex].review;
      product.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      product.ratings.push({ userId, rating, review: review || "", createdAt: new Date() });
    }

    // Calculate average rating
    const totalRatings = product.ratings.length;
    const sumRatings = product.ratings.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("ratings.userId", "fullName profilePhoto");
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product.ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all unique tags from all products
export const getAllTags = async (req, res) => {
  try {
    const products = await Product.find({}, { tag: 1 }).lean();
    const allTags = new Set();
    
    products.forEach(product => {
      if (product.tag && Array.isArray(product.tag)) {
        product.tag.forEach(tag => {
          if (tag && typeof tag === 'string') {
            allTags.add(tag.trim());
          }
        });
      }
    });
    
    const uniqueTags = Array.from(allTags).sort();
    res.status(200).json({ tags: uniqueTags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
