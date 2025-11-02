import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import { createDeliveryTracking } from "./delivery.js";
import { createNotification } from "./notifications.js";
import User from "../models/user.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentIntentId, amount, currency = "usd", items, deliveryAddress } = req.body;

    let orderItems = items;
    let finalAmount = amount;
    
    // If items are provided, use them; otherwise get from cart
    if (!orderItems || orderItems.length === 0) {
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
      // Convert dollars to cents
      finalAmount = Math.round(totals.totalPrice * 100);
    } else {
      // Items are provided (selected items from checkout)
      // If amount is provided from payment intent, it's already in cents - use it directly
      // Otherwise, calculate from items (prices are in dollars, convert to cents)
      if (amount && typeof amount === 'number') {
        // Amount from paymentIntent is already in cents - use directly
        finalAmount = amount;
      } else {
        // Calculate from items: prices are in dollars, multiply by 100 to convert to cents
        finalAmount = Math.round(
          orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100
        );
      }
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

    // Notify sellers about their products being purchased
    try {
      // Get buyer info for notifications
      const buyer = await User.findById(userId).select("fullName email");
      
      // Group items by seller (product owner)
      const sellerItemsMap = new Map();
      
      for (const item of orderItems) {
        const product = await Product.findById(item.productId).populate("userID", "fullName email _id");
        if (product?.userID) {
          const sellerId = product.userID._id?.toString() || product.userID.toString();
          
          if (!sellerItemsMap.has(sellerId)) {
            sellerItemsMap.set(sellerId, {
              sellerId,
              seller: product.userID,
              items: [],
            });
          }
          
          sellerItemsMap.get(sellerId).items.push({
            productId: item.productId,
            title: item.title || product.title,
            quantity: item.quantity,
            price: item.price,
          });
        }
      }
      
      // Send notifications to each seller
      for (const [sellerId, sellerData] of sellerItemsMap) {
        const { seller, items } = sellerData;
        
        // Calculate total for this seller's items
        const sellerTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Build notification message
        const itemCount = items.length;
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const itemsList = items.map(item => `${item.title} (x${item.quantity})`).join(", ");
        
        let notificationMessage;
        if (itemCount === 1) {
          notificationMessage = `${buyer?.fullName || "A customer"} purchased ${items[0].title} (x${items[0].quantity}) from you for $${(sellerTotal / 100).toFixed(2)}.`;
        } else {
          notificationMessage = `${buyer?.fullName || "A customer"} purchased ${totalQuantity} item(s) from you for $${(sellerTotal / 100).toFixed(2)}. Items: ${itemsList}.`;
        }
        
        try {
          await createNotification({
            userId: sellerId,
            type: "order",
            title: "New Order Received",
            message: notificationMessage,
            relatedEntity: {
              entityType: "order",
              entityId: order._id,
            },
            actionUrl: `/user/products?orderId=${order._id}`,
            metadata: {
              orderId: order._id.toString(),
              buyerId: userId.toString(),
              buyerName: buyer?.fullName || "Unknown",
              items: items.map(item => ({
                productId: item.productId.toString(),
                title: item.title,
                quantity: item.quantity,
                price: item.price,
              })),
              totalAmount: sellerTotal,
            },
          });
        } catch (notifError) {
          console.error(`Error creating notification for seller ${sellerId}:`, notifError);
          // Don't fail order creation if notification fails
        }
      }
    } catch (notificationError) {
      console.error("Error creating seller notifications:", notificationError);
      // Don't fail order creation if notifications fail
    }

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
    
    // Include delivery tracking info (per-item) for each order
    const Delivery = (await import("../models/delivery.js")).default;
    const ordersWithDelivery = await Promise.all(
      orders.map(async (order) => {
        // Get all delivery tracking records for this order (one per item)
        const deliveries = await Delivery.find({ orderId: order._id });
        const orderObj = order.toObject();
        
        // Map each order item with its delivery tracking
        orderObj.items = order.items.map((item) => {
          const itemObj = item.toObject();
          const itemDelivery = deliveries.find(
            (d) => String(d.orderItemId) === String(item._id) || 
                   String(d.productId) === String(item.productId)
          );
          if (itemDelivery) {
            itemObj.deliveryTracking = {
              buyerAcceptance: itemDelivery.buyerAcceptance,
              deliveryProof: itemDelivery.deliveryProof,
              status: itemDelivery.status,
              trackingNumber: itemDelivery.trackingNumber,
              actualDeliveryDate: itemDelivery.actualDeliveryDate,
            };
          }
          return itemObj;
        });
        
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
    
    // Include delivery tracking info (per-item) for each order
    const Delivery = (await import("../models/delivery.js")).default;
    const ordersWithDelivery = await Promise.all(
      orders.map(async (order) => {
        // Get all delivery tracking records for this order (one per item)
        const deliveries = await Delivery.find({ orderId: order._id });
        const orderObj = order.toObject();
        
        // Filter items to only show seller's products
        // Map each order item with its delivery tracking (only seller's items)
        orderObj.items = order.items
          .filter((item) => productIds.some((pid) => String(pid) === String(item.productId)))
          .map((item) => {
            const itemObj = item.toObject();
            const itemDelivery = deliveries.find(
              (d) => String(d.orderItemId) === String(item._id) || 
                     String(d.productId) === String(item.productId)
            );
            if (itemDelivery) {
              itemObj.deliveryTracking = {
                buyerAcceptance: itemDelivery.buyerAcceptance,
                deliveryProof: itemDelivery.deliveryProof,
                status: itemDelivery.status,
                trackingNumber: itemDelivery.trackingNumber,
                actualDeliveryDate: itemDelivery.actualDeliveryDate,
                _id: itemDelivery._id,
              };
            }
            return itemObj;
          });
        
        return orderObj;
      })
    );
    
    return res.json({ orders: ordersWithDelivery });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};
