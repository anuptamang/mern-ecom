import Delivery from "../models/delivery.js";
import Order from "../models/order.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

/**
 * Create delivery tracking for an order
 */
export const createDeliveryTracking = async (orderId, deliveryAddress) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Calculate estimated delivery date (default 7 days from now)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

    const delivery = await Delivery.create({
      orderId,
      status: "packing",
      deliveryAddress,
      estimatedDeliveryDate,
      statusHistory: [
        {
          status: "packing",
          timestamp: new Date(),
          note: "Order placed, preparing for shipment",
        },
      ],
    });

    // Update order with delivery status
    await Order.findByIdAndUpdate(orderId, {
      deliveryStatus: "packing",
      deliveryAddress,
      estimatedDeliveryDate,
    });

    return delivery;
  } catch (error) {
    console.error("Error creating delivery tracking:", error);
    throw error;
  }
};

/**
 * Update delivery status with role-based authorization
 * - Sellers: Can update packing, ready_to_ship, picked_up
 * - Delivery Agency: Can update in_facility, in_transit
 * - Delivery Person: Can update out_for_delivery, delivered (with proof)
 * - Admin: Can update any status
 */
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    const validStatuses = [
      "packing",
      "ready_to_ship",
      "picked_up",
      "in_facility",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid delivery status" });
    }

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ message: "Delivery tracking not found" });
    }

    const order = await Order.findById(orderId).populate("userId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Role-based authorization
    let isAuthorized = false;
    const sellerStatuses = ["packing", "ready_to_ship", "picked_up"];
    const deliveryAgencyStatuses = ["in_facility", "in_transit"];
    const deliveryPersonStatuses = ["out_for_delivery", "delivered"];

    if (userRole === "admin") {
      isAuthorized = true;
    } else if (userRole === "seller" && sellerStatuses.includes(status)) {
      // Check if user is seller of any product in the order
      const Product = (await import("../models/product.js")).default;
      const productIds = order.items.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      isAuthorized = products.some(
        (p) => String(p.userID) === String(userId) || p.userID.toString() === userId.toString()
      );
    } else if (userRole === "delivery_agency" && deliveryAgencyStatuses.includes(status)) {
      // Check if delivery is assigned to this agency
      isAuthorized = String(delivery.assignedDeliveryAgency) === String(userId);
    } else if (userRole === "delivery_person" && deliveryPersonStatuses.includes(status)) {
      // Check if delivery is assigned to this person
      isAuthorized = String(delivery.assignedDeliveryPerson) === String(userId);
    }

    if (!isAuthorized) {
      return res.status(403).json({ 
        message: `Unauthorized. ${userRole === "seller" ? "Sellers" : userRole === "delivery_agency" ? "Delivery agencies" : userRole === "delivery_person" ? "Delivery persons" : "Users"} cannot update status to ${status}.` 
      });
    }

    const oldStatus = delivery.status;
    delivery.status = status;

    if (status === "delivered") {
      delivery.actualDeliveryDate = new Date();
    }

    // Add to status history with who updated it
    delivery.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated from ${oldStatus} to ${status}`,
      updatedBy: userId,
      updatedByRole: userRole,
    });

    await delivery.save();

    // Update order delivery status
    await Order.findByIdAndUpdate(orderId, { deliveryStatus: status });

    return res.json({ message: "Delivery status updated", delivery });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return res.status(500).json({ message: "Failed to update delivery status" });
  }
};

/**
 * Get delivery tracking for an order
 */
export const getDeliveryTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order or is seller of products in order
    if (String(order.userId) !== String(userId)) {
      // Check if user is seller of any product in the order
      const Product = (await import("../models/product.js")).default;
      const productIds = order.items.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      const isSeller = products.some(
        (p) => String(p.userID) === String(userId)
      );

      if (!isSeller) {
        return res.status(403).json({ message: "Unauthorized to view this delivery" });
      }
    }

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ message: "Delivery tracking not found" });
    }

    return res.json({ delivery });
  } catch (error) {
    console.error("Error fetching delivery tracking:", error);
    return res.status(500).json({ message: "Failed to fetch delivery tracking" });
  }
};

/**
 * Cancel order and process refund
 */
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized to cancel this order" });
    }

    // Check if order can be cancelled
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (order.status !== "paid") {
      return res.status(400).json({ message: "Only paid orders can be cancelled" });
    }

    // Check if order has been delivered - if delivered, should use return instead
    if (order.deliveryStatus === "delivered") {
      return res.status(400).json({
        message: "Delivered orders cannot be cancelled. Please use the Return/Refund feature instead.",
      });
    }

    // Process refund via Stripe if paymentIntentId exists
    let refundId = null;
    let refundStatus = "pending";
    let refundAmount = order.amount;
    let refundFailureReason = null;

    if (order.paymentIntentId) {
      try {
        // Create refund
        const refund = await stripe.refunds.create({
          payment_intent: order.paymentIntentId,
        });
        refundId = refund.id;
        refundStatus = refund.status; // pending, succeeded, failed, or canceled
        refundAmount = refund.amount;
        
        // If refund fails immediately, capture the reason
        if (refund.status === "failed" || refund.status === "canceled") {
          refundFailureReason = refund.failure_reason || "Refund could not be processed";
        }
      } catch (stripeError) {
        console.error("Error processing refund:", stripeError);
        refundStatus = "failed";
        refundFailureReason = stripeError.message || "Failed to create refund";
        
        return res.status(500).json({
          message: "Failed to process refund. Please contact support.",
          error: refundFailureReason,
        });
      }
    }

    // Update order status
    order.status = "cancelled";
    order.refundId = refundId;
    order.refundStatus = refundStatus;
    order.refundAmount = refundAmount;
    order.refundCreatedAt = new Date();
    if (refundStatus === "succeeded") {
      order.status = "refunded";
      order.refundCompletedAt = new Date();
    }
    order.cancelledAt = new Date();
    order.cancelledBy = userId;
    order.cancellationReason = reason || "Cancelled by user";
    order.deliveryStatus = "cancelled";
    order.refundFailureReason = refundFailureReason;
    await order.save();

    // Update delivery tracking
    const delivery = await Delivery.findOne({ orderId });
    if (delivery) {
      delivery.status = "cancelled";
      delivery.statusHistory.push({
        status: "cancelled",
        timestamp: new Date(),
        note: reason || "Order cancelled by user",
      });
      await delivery.save();
    }

    // Restore stock for cancelled items
    const Product = (await import("../models/product.js")).default;
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    return res.json({
      message: "Order cancelled successfully",
      refundId,
      order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({ message: "Failed to cancel order" });
  }
};
