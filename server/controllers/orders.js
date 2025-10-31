import Order from "../models/order.js";
import Cart from "../models/cart.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentIntentId, amount, currency = "usd", items } = req.body;

    let orderItems = items;
    let finalAmount = amount;
    if (!orderItems || !finalAmount) {
      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      const totals = cart.getTotals();
      orderItems = cart.items.map((i) => ({
        productId: i.productId,
        title: i.title,
        thumbnail: i.thumbnail,
        price: i.price,
        quantity: i.quantity,
      }));
      finalAmount = Math.round(totals.totalPrice * 100);
    }

    const order = await Order.create({
      userId,
      items: orderItems,
      amount: finalAmount,
      currency,
      status: paymentIntentId ? "paid" : "created",
      paymentIntentId,
    });

    // Clear cart on order creation
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    return res.status(201).json({ order });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create order" });
  }
};

export const listMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Get orders containing seller's products
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.userId;
    const Product = (await import("../models/product.js")).default;
    
    // Get all product IDs owned by seller
    const sellerProducts = await Product.find({ userID: sellerId }).select("_id");
    const productIds = sellerProducts.map(p => p._id);
    
    // Find orders that contain any of seller's products
    const orders = await Order.find({
      "items.productId": { $in: productIds }
    })
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });
    
    return res.json({ orders });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};
