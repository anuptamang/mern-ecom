import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/product.js";

export const getMyCart = async (req, res) => {
  try {
    const userId = req.userId;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    const totals = cart.getTotals();
    return res.json({ cart, totals });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
};

export const addItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity = 1 } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const existing = cart.items.find((i) => String(i.productId) === String(productId));
    if (existing) {
      existing.quantity += Number(quantity) || 1;
    } else {
      cart.items.push({
        productId: product._id,
        title: product.title,
        thumbnail: product.thumbnail,
        // For demo: use views as price if price not in schema
        price: product.body?.price ?? 0,
        quantity: Number(quantity) || 1,
      });
    }
    await cart.save();
    const totals = cart.getTotals();
    return res.status(201).json({ cart, totals });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add item" });
  }
};

export const updateItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const item = cart.items.find((i) => String(i.productId) === String(productId));
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.quantity = Math.max(1, Number(quantity));
    await cart.save();
    const totals = cart.getTotals();
    return res.json({ cart, totals });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update item" });
  }
};

export const removeItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter((i) => String(i.productId) !== String(productId));
    await cart.save();
    const totals = cart.getTotals();
    return res.json({ cart, totals });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove item" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = [];
    await cart.save();
    const totals = cart.getTotals();
    return res.json({ cart, totals });
  } catch (error) {
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};
