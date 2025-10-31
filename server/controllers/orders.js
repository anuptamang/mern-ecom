import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import { createDeliveryTracking } from "./delivery.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentIntentId, amount, currency = "usd", items, deliveryAddress } = req.body;

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

    // Validate stock availability before creating order
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          message: `Product ${item.title || item.productId} not found` 
        });
      }
      const currentStock = product.stock || 0;
      if (currentStock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.title || product.title}. Available: ${currentStock}, Requested: ${item.quantity}` 
        });
      }
    }

    // Create the order
    const order = await Order.create({
      userId,
      items: orderItems,
      amount: finalAmount,
      currency,
      status: paymentIntentId ? "paid" : "created",
      paymentIntentId: paymentIntentId || undefined,
      deliveryAddress: deliveryAddress || undefined,
      deliveryStatus: "packing",
      // Do not set refundStatus - it defaults to null in schema which is invalid
      // refundStatus will only be set when a refund is actually processed
    });

    // Update stock for each product in the order
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { stock: -item.quantity } 
        },
        { new: true }
      );
    }

    // Create delivery tracking
    if (deliveryAddress) {
      try {
        await createDeliveryTracking(order._id, deliveryAddress);
      } catch (deliveryError) {
        console.error("Error creating delivery tracking:", deliveryError);
        // Don't fail the order creation if delivery tracking fails
      }
    }

    // Clear cart on order creation
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    // Populate order with delivery info
    const populatedOrder = await Order.findById(order._id).populate("userId", "fullName email");

    return res.status(201).json({ order: populatedOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

export const listMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    // Include delivery tracking info (especially buyerAcceptance) for each order
    const Delivery = (await import("../models/delivery.js")).default;
    const ordersWithDelivery = await Promise.all(
      orders.map(async (order) => {
        const delivery = await Delivery.findOne({ orderId: order._id });
        const orderObj = order.toObject();
        if (delivery) {
          orderObj.deliveryTracking = {
            buyerAcceptance: delivery.buyerAcceptance,
            deliveryProof: delivery.deliveryProof,
          };
        }
        return orderObj;
      })
    );
    
    return res.json({ orders: ordersWithDelivery });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Get orders containing seller's products
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.userId;
    const Product = (await import("../models/product.js")).default;
    const mongoose = (await import("mongoose")).default;
    
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
      return res.json({ orders: [] });
    }
    
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
