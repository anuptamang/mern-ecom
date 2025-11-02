import Payout from "../models/payout.js";
import Order from "../models/order.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import Delivery from "../models/delivery.js";
import { createNotification } from "./notifications.js";

/**
 * Get pending payouts for finance team
 */
export const getPendingPayouts = async (req, res) => {
  try {
    const userRole = req.userRole;

    if (userRole !== "finance" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const payouts = await Payout.find({ status: "pending" })
      .populate("orderId", "userId items amount currency status")
      .populate("sellerId", "fullName email phone bankPayout")
      .populate("productId", "title thumbnail")
      .populate("deliveryId", "status buyerAcceptance")
      .sort({ createdAt: -1 });

    return res.json({ payouts, count: payouts.length });
  } catch (error) {
    console.error("Error fetching pending payouts:", error);
    return res.status(500).json({ message: "Failed to fetch pending payouts" });
  }
};

/**
 * Get all payouts (with optional status filter)
 */
export const getPayouts = async (req, res) => {
  try {
    const userRole = req.userRole;
    const { status } = req.query;

    if (userRole !== "finance" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const query = {};
    if (status) {
      query.status = status;
    }

    const payouts = await Payout.find(query)
      .populate("orderId", "userId items amount currency status")
      .populate("sellerId", "fullName email phone bankPayout")
      .populate("productId", "title thumbnail")
      .populate("deliveryId", "status buyerAcceptance")
      .populate("processedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.json({ payouts, count: payouts.length });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return res.status(500).json({ message: "Failed to fetch payouts" });
  }
};

/**
 * Get payout details
 */
export const getPayout = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const userRole = req.userRole;

    if (userRole !== "finance" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const payout = await Payout.findById(payoutId)
      .populate("orderId", "userId items amount currency status paymentIntentId")
      .populate("sellerId", "fullName email phone bankPayout")
      .populate("productId", "title thumbnail userID")
      .populate("deliveryId", "status buyerAcceptance buyerAcceptedAt")
      .populate("processedBy", "fullName email");

    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }

    return res.json({ payout });
  } catch (error) {
    console.error("Error fetching payout:", error);
    return res.status(500).json({ message: "Failed to fetch payout" });
  }
};

/**
 * Process payout (execute payout to seller)
 * This would typically integrate with a payment processor (Stripe Connect, bank transfer API, etc.)
 * For now, this marks the payout as completed and updates seller bank payout info if needed
 */
export const processPayout = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { notes } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== "finance" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const payout = await Payout.findById(payoutId)
      .populate("sellerId")
      .populate("orderId")
      .populate("productId");

    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }

    if (payout.status !== "pending") {
      return res.status(400).json({
        message: `Payout is already ${payout.status}. Only pending payouts can be processed.`,
      });
    }

    // Verify seller has bank payout information
    const seller = payout.sellerId;
    if (!seller.bankPayout || !seller.bankPayout.accountNumber) {
      return res.status(400).json({
        message: "Seller has not provided bank payout information. Please ask the seller to complete their profile.",
      });
    }

    // Verify delivery was accepted
    const delivery = await Delivery.findById(payout.deliveryId);
    if (!delivery || delivery.buyerAcceptance !== "accepted") {
      return res.status(400).json({
        message: "Delivery must be accepted by buyer before processing payout.",
      });
    }

    // Verify item has not been returned/refunded
    const Return = (await import("../models/return.js")).default;
    const returnRequest = await Return.findOne({
      orderId: payout.orderId._id,
      returnStatus: { $nin: ["cancelled"] },
      "items.productId": payout.productId._id,
    });

    if (returnRequest && returnRequest.returnStatus !== "cancelled") {
      return res.status(400).json({
        message: "Cannot process payout: Item has been returned/refunded.",
      });
    }

    // Check order item refund status
    const order = await Order.findById(payout.orderId._id);
    const orderItem = order.items.find(
      (item) =>
        String(item._id) === String(payout.orderItemId) ||
        String(item.productId) === String(payout.productId._id)
    );

    if (orderItem && (orderItem.refundStatus === "succeeded" || orderItem.returnStatus === "completed")) {
      return res.status(400).json({
        message: "Cannot process payout: Item has been refunded.",
      });
    }

    // Update payout with seller's current bank payout info (in case it changed)
    payout.bankPayout = seller.bankPayout || payout.bankPayout;

    // TODO: Here you would integrate with actual payment processor (Stripe Connect, bank transfer API, etc.)
    // For now, we'll mark it as completed
    // Example with Stripe Connect:
    // const transfer = await stripe.transfers.create({
    //   amount: payout.payoutAmount,
    //   currency: payout.currency,
    //   destination: seller.stripeAccountId, // Seller's connected account
    //   metadata: {
    //     orderId: payout.orderId._id.toString(),
    //     payoutId: payout._id.toString(),
    //   },
    // });
    // payout.transferId = transfer.id;

    payout.status = "completed";
    payout.processedBy = userId;
    payout.processedAt = new Date();
    if (notes) {
      payout.notes = notes;
    }

    await payout.save();

    // Notify seller
              await createNotification({
                userId: seller._id,
                type: "payout",
                title: "Payout Processed",
                message: `Your payout of $${(payout.payoutAmount / 100).toFixed(2)} has been processed for order #${payout.orderId._id.toString().slice(-8)}.`,
                relatedEntity: {
                  entityType: "payout",
                  entityId: payout._id,
                },
                actionUrl: `/user/orders`,
                metadata: {
                  orderId: payout.orderId._id.toString(),
                  payoutId: payout._id.toString(),
                  payoutAmount: payout.payoutAmount,
                },
              });

    return res.json({
      message: "Payout processed successfully",
      payout,
    });
  } catch (error) {
    console.error("Error processing payout:", error);
    return res.status(500).json({ message: "Failed to process payout" });
  }
};

/**
 * Cancel payout (if needed before processing)
 */
export const cancelPayout = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { reason } = req.body;
    const userRole = req.userRole;

    if (userRole !== "finance" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const payout = await Payout.findById(payoutId);

    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }

    if (payout.status !== "pending") {
      return res.status(400).json({
        message: `Only pending payouts can be cancelled. Current status: ${payout.status}`,
      });
    }

    payout.status = "cancelled";
    if (reason) {
      payout.notes = reason;
    }

    await payout.save();

    // Notify seller
    const seller = await User.findById(payout.sellerId);
    if (seller) {
      await createNotification({
        userId: seller._id,
        type: "payout",
        title: "Payout Cancelled",
        message: `Payout for order #${payout.orderId.toString().slice(-8)} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
        relatedEntity: {
          entityType: "payout",
          entityId: payout._id,
        },
        actionUrl: `/user/orders`,
        metadata: {
          orderId: payout.orderId.toString(),
          payoutId: payout._id.toString(),
        },
      });
    }

    return res.json({
      message: "Payout cancelled successfully",
      payout,
    });
  } catch (error) {
    console.error("Error cancelling payout:", error);
    return res.status(500).json({ message: "Failed to cancel payout" });
  }
};
