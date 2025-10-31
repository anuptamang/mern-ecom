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
        // Use direct price field or fallback to body.price or 0
        price: product.price ?? product.body?.price ?? 0,
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

// Get carts containing seller's products
export const getSellerCartItems = async (req, res) => {
  try {
    const sellerId = req.userId;
    
    // Get all product IDs owned by seller - handle both string and ObjectId userID
    const sellerProducts = await Product.find({
      $or: [
        { userID: sellerId },
        { userID: String(sellerId) },
        { userID: new mongoose.Types.ObjectId(sellerId) }
      ]
    }).select("_id");
    const productIds = sellerProducts.map(p => p._id);
    
    if (productIds.length === 0) {
      return res.json({ cartItems: [] });
    }
    
    // Convert productIds to strings for comparison with cart items
    const productIdStrings = productIds.map(id => String(id));
    
    // Find carts that contain any of seller's products
    const carts = await Cart.find({
      "items.productId": { $in: productIds }
    }).populate("userId", "fullName email");
    
    // Filter items to only show seller's products
    const cartItems = [];
    carts.forEach(cart => {
      cart.items.forEach(item => {
        const itemProductId = String(item.productId);
        if (productIdStrings.includes(itemProductId)) {
          cartItems.push({
            ...item.toObject(),
            buyerName: cart.userId?.fullName || "Unknown",
            buyerEmail: cart.userId?.email || "Unknown",
            cartId: cart._id,
          });
        }
      });
    });
    
    return res.json({ cartItems });
  } catch (error) {
    console.error("Error fetching seller cart items:", error);
    return res.status(500).json({ message: "Failed to fetch seller cart items" });
  }
};
