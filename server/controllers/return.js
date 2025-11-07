import Return from "../models/return.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import Stripe from "stripe";
import config from "../config/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

/**
 * Create a return request for delivered products
 */
export const createReturnRequest = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;
    
    // Parse items from FormData (may be JSON string)
    let items = req.body.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        return res.status(400).json({ message: "Invalid items format" });
      }
    }
    
    const reason = req.body.reason;
    
    // Get proof images from uploaded files
    const proofImages = req.files 
      ? req.files.map(file => `${config.upload.imageBucketUrl}/${file.filename}`)
      : [];

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized to return this order" });
    }

    // Check if order was delivered (check per-item delivery status)
    const deliveredItems = order.items.filter(item => item.deliveryStatus === "delivered");
    if (deliveredItems.length === 0) {
      return res.status(400).json({
        message: "Only delivered items can be returned. Please use cancellation for non-delivered orders.",
      });
    }

    // Validate that items being returned are actually delivered
    const returnItemIds = items.map(item => String(item.productId));
    const validReturnItems = deliveredItems.filter(item => 
      returnItemIds.includes(String(item.productId))
    );
    if (validReturnItems.length === 0) {
      return res.status(400).json({
        message: "Selected items must be delivered to be returned.",
      });
    }

    // Check if there's already a pending return request for this order
    const existingReturn = await Return.findOne({
      orderId,
      returnStatus: { $nin: ["cancelled", "completed", "refunded"] },
    });
    if (existingReturn) {
      return res.status(400).json({ message: "A return request already exists for this order" });
    }

    // Validate return items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "At least one item must be returned" });
    }

    // Validate items are from the order
    const orderItemMap = new Map();
    order.items.forEach((item) => {
      orderItemMap.set(String(item.productId), item);
    });

    let returnAmount = 0;
    const returnItems = items.map((returnItem) => {
      const orderItem = orderItemMap.get(String(returnItem.productId));
      if (!orderItem) {
        throw new Error(`Item ${returnItem.productId} not found in order`);
      }
      if (returnItem.quantity > orderItem.quantity) {
        throw new Error(`Cannot return more than purchased quantity for ${orderItem.title}`);
      }
      returnAmount += orderItem.price * returnItem.quantity;
      return {
        productId: returnItem.productId,
        title: orderItem.title,
        quantity: returnItem.quantity,
        price: orderItem.price,
        reason: returnItem.reason || reason,
      };
    });

    // Create return request - now submitted to support team
    const returnRequest = await Return.create({
      orderId,
      userId,
      items: returnItems,
      returnAmount: Math.round(returnAmount * 100), // Convert to cents
      reason: reason || "Return requested",
      proofImages: proofImages,
      returnStatus: "pending", // Awaiting support assignment
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: `Return request created with ${proofImages.length} proof image(s). Awaiting support team assignment.`,
          changedBy: userId,
        },
      ],
    });
    
    // Notify support team about new return request
    try {
      const { createNotification } = await import("./notifications.js");
      const User = (await import("../models/user.js")).default;
      // Notify both "support" and "support_user" roles
      const supportUsers = await User.find({ 
        role: { $in: ["support", "support_user"] } 
      });
      
      for (const supportUser of supportUsers) {
        await createNotification({
          userId: supportUser._id,
          type: "return",
          title: "New Return Request",
          message: `A return request has been submitted for order #${orderId.toString().slice(-8)}. Amount: $${((returnAmount || 0) / 100).toFixed(2)}`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
          actionUrl: `/user/support?returnId=${returnRequest._id}`,
        });
      }
    } catch (notifError) {
      console.error("Error creating support notification:", notifError);
      // Don't fail the request if notification fails
    }

    // Notify seller (can be added later via notifications)

    return res.status(201).json({ returnRequest });
  } catch (error) {
    console.error("Error creating return request:", error);
    if (error.message) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to create return request" });
  }
};

/**
 * Get return requests for a user (buyer)
 */
export const getMyReturns = async (req, res) => {
  try {
    const userId = req.userId;
    const returns = await Return.find({ userId })
      .populate("orderId")
      .sort({ createdAt: -1 });

    return res.json({ returns, count: returns.length });
  } catch (error) {
    console.error("Error fetching returns:", error);
    return res.status(500).json({ message: "Failed to fetch returns" });
  }
};

/**
 * Get return requests for seller's products
 */
export const getSellerReturns = async (req, res) => {
  try {
    const sellerId = req.userId;
    const mongoose = (await import("mongoose")).default;

    // Find all products owned by seller
    const sellerProducts = await Product.find({
      $or: [
        { userID: sellerId },
        { userID: String(sellerId) },
        { userID: new mongoose.Types.ObjectId(sellerId) },
      ],
    }).select("_id");

    const productIds = sellerProducts.map((p) => p._id);

    if (productIds.length === 0) {
      return res.json({ returns: [] });
    }

    // Find return requests where items contain seller's products
    const returns = await Return.find({
      "items.productId": { $in: productIds },
    })
      .populate("orderId")
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });

    return res.json({ returns, count: returns.length });
  } catch (error) {
    console.error("Error fetching seller returns:", error);
    return res.status(500).json({ message: "Failed to fetch seller returns" });
  }
};

/**
 * Get single return request
 */
export const getReturnRequest = async (req, res) => {
  try {
    const { returnId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    // First fetch the raw document to check IDs before population
    const rawReturnRequest = await Return.findById(returnId);
    if (!rawReturnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Now populate for full details
    const returnRequest = await Return.findById(returnId)
      .populate("orderId")
      .populate("userId", "fullName email")
      .populate("assignedSupportUser", "fullName email")
      .populate("assignedDeliveryAgency", "fullName email")
      .populate("assignedReturnDeliverer", "fullName email phone delivererType")
      .populate("assignedVerificationTeam", "fullName email")
      .populate("assignedInspector", "fullName email")
      .populate("assignedFinance", "fullName email")
      .populate("statusHistory.changedBy", "fullName email");

    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Support, support_user, verification_team, return_inspector, finance, and admin can view their assigned returns
    const isSupport = userRole === "support" || userRole === "support_user" || userRole === "admin";
    const isVerificationTeam = userRole === "verification_team";
    const isInspector = userRole === "return_inspector";
    const isFinance = userRole === "finance";
    const isDeliveryAgency = userRole === "delivery_agency";
    const isDeliveryPerson = userRole === "delivery_person";
    
    if (isSupport) {
      return res.json({ returnRequest });
    }
    
    // Delivery agency can view returns assigned to them - use raw document for ID check
    if (isDeliveryAgency && rawReturnRequest.assignedDeliveryAgency && String(rawReturnRequest.assignedDeliveryAgency) === String(userId)) {
      return res.json({ returnRequest });
    }
    
    // Return deliverer (delivery_person with customer_return type) can view returns assigned to them - use raw document for ID check
    if (isDeliveryPerson) {
      const User = (await import("../models/user.js")).default;
      const deliverer = await User.findById(userId);
      if (deliverer && deliverer.delivererType === "customer_return") {
        // Use raw document for ID comparison (before population)
        if (rawReturnRequest.assignedReturnDeliverer && String(rawReturnRequest.assignedReturnDeliverer) === String(userId)) {
          return res.json({ returnRequest });
        }
      }
    }
    
    // Verification team can view returns assigned to them - use raw document for ID check
    if (isVerificationTeam && rawReturnRequest.assignedVerificationTeam && String(rawReturnRequest.assignedVerificationTeam) === String(userId)) {
      return res.json({ returnRequest });
    }
    
    // Inspector can view returns assigned to them - use raw document for ID check
    if (isInspector && rawReturnRequest.assignedInspector && String(rawReturnRequest.assignedInspector) === String(userId)) {
      return res.json({ returnRequest });
    }
    
    // Finance can view returns assigned to them - use raw document for ID check
    if (isFinance && rawReturnRequest.assignedFinance && String(rawReturnRequest.assignedFinance) === String(userId)) {
      return res.json({ returnRequest });
    }

    // Check authorization - user must be buyer or seller of products in return
    const isBuyer = String(returnRequest.userId) === String(userId);

    if (!isBuyer) {
      // Check if user is seller of any product in return
      const Product = (await import("../models/product.js")).default;
      const productIds = returnRequest.items.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      const isSeller = products.some((p) => String(p.userID) === String(userId));

      if (!isSeller) {
        return res.status(403).json({ message: "Unauthorized to view this return" });
      }
    }

    return res.json({ returnRequest });
  } catch (error) {
    console.error("Error fetching return request:", error);
    return res.status(500).json({ message: "Failed to fetch return request" });
  }
};

/**
 * Approve return request (seller action)
 */
export const approveReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const sellerId = req.userId;

    const returnRequest = await Return.findById(returnId).populate("orderId");
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Verify seller owns products in return
    const Product = (await import("../models/product.js")).default;
    const mongoose = (await import("mongoose")).default;
    const productIds = returnRequest.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const sellerProducts = products.filter(
      (p) => String(p.userID) === String(sellerId) || String(p.userID) === String(sellerId)
    );

    if (sellerProducts.length === 0) {
      return res.status(403).json({ message: "Unauthorized to approve this return" });
    }

    if (returnRequest.returnStatus !== "pending") {
      return res.status(400).json({ message: "Only pending returns can be approved" });
    }

    // Update return status
    returnRequest.returnStatus = "approved";
    returnRequest.approvedAt = new Date();
    returnRequest.approvedBy = sellerId;
    returnRequest.statusHistory.push({
      status: "approved",
      timestamp: new Date(),
      note: "Return approved by seller",
      changedBy: sellerId,
    });

    // Process refund
    returnRequest.returnStatus = "processing";
    returnRequest.statusHistory.push({
      status: "processing",
      timestamp: new Date(),
      note: "Processing refund",
      changedBy: sellerId,
    });

    await returnRequest.save();

    // Process refund via Stripe
    if (returnRequest.orderId.paymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: returnRequest.orderId.paymentIntentId,
          amount: returnRequest.returnAmount, // Partial refund
        });

        returnRequest.refundId = refund.id;
        returnRequest.refundStatus = refund.status;
        returnRequest.refundAmount = refund.amount;
        returnRequest.refundCreatedAt = new Date();

        if (refund.status === "succeeded") {
          returnRequest.returnStatus = "refunded";
          returnRequest.refundCompletedAt = new Date();
          returnRequest.statusHistory.push({
            status: "refunded",
            timestamp: new Date(),
            note: "Refund processed successfully",
            changedBy: sellerId,
          });
        } else if (refund.status === "failed" || refund.status === "canceled") {
          returnRequest.returnStatus = "approved"; // Revert to approved if refund fails
          returnRequest.refundFailureReason = refund.failure_reason || "Refund processing failed";
          returnRequest.statusHistory.push({
            status: "approved",
            timestamp: new Date(),
            note: `Refund failed: ${refund.failure_reason || "Unknown error"}`,
            changedBy: sellerId,
          });
        }
      } catch (stripeError) {
        console.error("Error processing refund:", stripeError);
        returnRequest.returnStatus = "approved"; // Revert to approved
        returnRequest.refundFailureReason = stripeError.message || "Failed to process refund";
        returnRequest.statusHistory.push({
          status: "approved",
          timestamp: new Date(),
          note: `Refund processing error: ${stripeError.message}`,
          changedBy: sellerId,
        });
      }
    }

    await returnRequest.save();

    // Restore stock for returned items
    for (const item of returnRequest.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    return res.json({ message: "Return approved and refund processed", returnRequest });
  } catch (error) {
    console.error("Error approving return:", error);
    return res.status(500).json({ message: "Failed to approve return" });
  }
};

/**
 * Reject return request (seller action)
 */
export const rejectReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { reason } = req.body;
    const sellerId = req.userId;

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Verify seller owns products in return
    const Product = (await import("../models/product.js")).default;
    const mongoose = (await import("mongoose")).default;
    const productIds = returnRequest.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const sellerProducts = products.filter(
      (p) => String(p.userID) === String(sellerId) || String(p.userID) === String(sellerId)
    );

    if (sellerProducts.length === 0) {
      return res.status(403).json({ message: "Unauthorized to reject this return" });
    }

    if (returnRequest.returnStatus !== "pending") {
      return res.status(400).json({ message: "Only pending returns can be rejected" });
    }

    returnRequest.returnStatus = "rejected";
    returnRequest.rejectedAt = new Date();
    returnRequest.rejectedBy = sellerId;
    returnRequest.rejectionReason = reason || "Return rejected by seller";
    returnRequest.statusHistory.push({
      status: "rejected",
      timestamp: new Date(),
      note: reason || "Return rejected by seller",
      changedBy: sellerId,
    });

    await returnRequest.save();

    return res.json({ message: "Return rejected", returnRequest });
  } catch (error) {
    console.error("Error rejecting return:", error);
    return res.status(500).json({ message: "Failed to reject return" });
  }
};

/**
 * Cancel return request (buyer action)
 */
export const cancelReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const userId = req.userId;

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Check if user owns the return
    if (String(returnRequest.userId) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized to cancel this return" });
    }

    if (returnRequest.returnStatus === "refunded" || returnRequest.returnStatus === "completed") {
      return res.status(400).json({ message: "Cannot cancel a return that has already been refunded" });
    }

    returnRequest.returnStatus = "cancelled";
    returnRequest.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      note: "Return cancelled by buyer",
      changedBy: userId,
    });

    await returnRequest.save();

    return res.json({ message: "Return cancelled", returnRequest });
  } catch (error) {
    console.error("Error cancelling return:", error);
    return res.status(500).json({ message: "Failed to cancel return" });
  }
};
