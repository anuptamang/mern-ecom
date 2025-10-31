import Order from "../models/order.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

/**
 * Get refund status for an order
 */
export const getRefundStatus = async (req, res) => {
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
        return res.status(403).json({ message: "Unauthorized to view this refund" });
      }
    }

    // If refundId exists, fetch latest status from Stripe
    let refundDetails = null;
    if (order.refundId && order.paymentIntentId) {
      try {
        const refund = await stripe.refunds.retrieve(order.refundId);
        // Update order with latest refund status
        order.refundStatus = refund.status;
        if (refund.status === "succeeded" && !order.refundCompletedAt) {
          order.refundCompletedAt = new Date();
          order.status = "refunded";
        }
        if (refund.failure_reason) {
          order.refundFailureReason = refund.failure_reason;
        }
        await order.save();

        refundDetails = {
          id: refund.id,
          status: refund.status,
          amount: refund.amount,
          currency: refund.currency,
          created: new Date(refund.created * 1000),
          failureReason: refund.failure_reason,
        };
      } catch (stripeError) {
        console.error("Error fetching refund from Stripe:", stripeError);
        // Continue with order's stored refund info
      }
    }

    return res.json({
      orderId: order._id,
      refundId: order.refundId,
      refundStatus: order.refundStatus,
      refundAmount: order.refundAmount,
      refundCreatedAt: order.refundCreatedAt,
      refundCompletedAt: order.refundCompletedAt,
      refundFailureReason: order.refundFailureReason,
      refundDetails,
    });
  } catch (error) {
    console.error("Error fetching refund status:", error);
    return res.status(500).json({ message: "Failed to fetch refund status" });
  }
};

