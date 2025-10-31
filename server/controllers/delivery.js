import Delivery from "../models/delivery.js";
import Order from "../models/order.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

/**
 * Create delivery tracking for each order item
 * Automatically assigns a delivery agency when status reaches ready_to_ship or picked_up
 */
export const createDeliveryTracking = async (orderId, deliveryAddress) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Find an available delivery agency (first one found)
    const User = (await import("../models/user.js")).default;
    const deliveryAgency = await User.findOne({ role: "delivery_agency" });
    
    // Calculate estimated delivery date (default 7 days from now)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

    // Create delivery tracking for each item in the order
    const deliveries = [];
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      
      // Create delivery tracking for this item
      // Auto-assign delivery agency if available (will be assigned when status reaches ready_to_ship or picked_up)
      const delivery = await Delivery.create({
        orderId,
        orderItemId: String(item._id), // Use item's _id as unique identifier
        productId: item.productId,
        status: "packing",
        deliveryAddress,
        estimatedDeliveryDate,
        buyerAcceptance: "pending",
        // Auto-assign delivery agency if available
        assignedDeliveryAgency: deliveryAgency?._id || null,
        assignedAt: deliveryAgency ? new Date() : undefined,
        statusHistory: [
          {
            status: "packing",
            timestamp: new Date(),
            note: deliveryAgency 
              ? `Order placed for ${item.title}, preparing for shipment. Auto-assigned to delivery agency: ${deliveryAgency.fullName || deliveryAgency.email}`
              : `Order placed for ${item.title}, preparing for shipment`,
            updatedBy: null, // System created
            updatedByRole: "system",
          },
        ],
      });

      // Update order item with delivery status
      order.items[i].deliveryStatus = "packing";
      order.items[i].estimatedDeliveryDate = estimatedDeliveryDate;

      deliveries.push(delivery);
    }

    // Update order with delivery address and overall status
    await Order.findByIdAndUpdate(orderId, {
      deliveryStatus: "packing",
      deliveryAddress,
      estimatedDeliveryDate,
      "items": order.items, // Update items with delivery status
    });

    return deliveries; // Return array of deliveries (one per item)
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
    const { status, note, orderItemId, productId } = req.body; // Support per-item updates
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

    const order = await Order.findById(orderId).populate("userId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find delivery tracking for specific item or order (backward compatibility)
    let delivery;
    if (orderItemId || productId) {
      // Per-item tracking
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      delivery = await Delivery.findOne(query);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking for this item not found" });
      }
    } else {
      // Backward compatibility: find first delivery for order (old behavior)
      delivery = await Delivery.findOne({ orderId });
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    }

    // Role-based authorization
    let isAuthorized = false;
    const sellerStatuses = ["packing", "ready_to_ship"]; // Sellers can only mark as ready_to_ship
    // Delivery agencies cannot update tracking status - they can only assign deliverers
    const deliveryAgencyStatuses = []; // Delivery agencies cannot update tracking
    const deliveryPersonStatuses = ["picked_up", "in_facility", "in_transit", "out_for_delivery", "delivered"]; // Deliverers handle from pickup onwards

    if (userRole === "admin") {
      isAuthorized = true;
    } else if (userRole === "seller" && sellerStatuses.includes(status)) {
      // Check if user is seller of the specific product being updated (per-item tracking)
      const Product = (await import("../models/product.js")).default;
      if (orderItemId || productId || delivery.productId) {
        // Per-item tracking: verify seller owns the specific product
        const targetProductId = productId || delivery.productId;
        if (targetProductId) {
          const product = await Product.findById(targetProductId);
          isAuthorized = product && (
            String(product.userID) === String(userId) || 
            product.userID.toString() === userId.toString()
          );
        } else {
          // Fallback: check if seller owns any product in the order (backward compatibility)
          const productIds = order.items.map((item) => item.productId);
          const products = await Product.find({ _id: { $in: productIds } });
          isAuthorized = products.some(
            (p) => String(p.userID) === String(userId) || p.userID.toString() === userId.toString()
          );
        }
      } else {
        // Backward compatibility: check if seller owns any product in the order
        const productIds = order.items.map((item) => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        isAuthorized = products.some(
          (p) => String(p.userID) === String(userId) || p.userID.toString() === userId.toString()
        );
      }
    } else if (userRole === "delivery_agency" && deliveryAgencyStatuses.includes(status)) {
      // Check if delivery is assigned to this agency
      isAuthorized = String(delivery.assignedDeliveryAgency) === String(userId);
    } else if (userRole === "delivery_person" && deliveryPersonStatuses.includes(status)) {
      // Check if delivery is assigned to this person
      const isAssigned = String(delivery.assignedDeliveryPerson) === String(userId);
      
      if (isAssigned) {
        // Get deliverer type
        const User = (await import("../models/user.js")).default;
        const deliverer = await User.findById(userId);
        
        if (deliverer?.delivererType === "warehouse") {
          // Warehouse deliverer can only update: picked_up -> in_facility
          const warehouseStatuses = ["picked_up", "in_facility"];
          isAuthorized = warehouseStatuses.includes(status);
          
          // Warehouse deliverer can only update if current status is ready_to_ship or picked_up
          if (!["ready_to_ship", "picked_up"].includes(delivery.status) && status === "picked_up") {
            isAuthorized = false;
          }
          if (delivery.status !== "picked_up" && status === "in_facility") {
            isAuthorized = false;
          }
        } else if (deliverer?.delivererType === "customer") {
          // Customer deliverer can only update: in_transit -> out_for_delivery -> delivered
          const customerStatuses = ["in_transit", "out_for_delivery", "delivered"];
          isAuthorized = customerStatuses.includes(status);
          
          // Customer deliverer can only update if current status is in_facility or in_transit or out_for_delivery
          if (!["in_facility", "in_transit"].includes(delivery.status) && status === "in_transit") {
            isAuthorized = false;
          }
          if (delivery.status !== "in_transit" && status === "out_for_delivery") {
            isAuthorized = false;
          }
          if (delivery.status !== "out_for_delivery" && status === "delivered") {
            isAuthorized = false;
          }
        } else {
          // Deliverer without type cannot update
          isAuthorized = false;
        }
      } else {
        isAuthorized = false;
      }
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

    // Update order item delivery status if updating specific item
    if (orderItemId || productId) {
      const order = await Order.findById(orderId);
      if (order) {
        const itemIndex = order.items.findIndex(
          (item) => 
            (orderItemId && String(item._id) === String(orderItemId)) ||
            (productId && String(item.productId) === String(productId))
        );
        if (itemIndex !== -1) {
          order.items[itemIndex].deliveryStatus = status;
          if (status === "delivered") {
            order.items[itemIndex].actualDeliveryDate = new Date();
          }
          await order.save();
        }
      }
    } else {
      // Backward compatibility: update overall order delivery status
      await Order.findByIdAndUpdate(orderId, { deliveryStatus: status });
    }

    // Notify relevant parties about status update
    try {
      const { createNotification } = await import("./notifications.js");
      const Product = (await import("../models/product.js")).default;
      const product = await Product.findById(delivery.productId).populate("userID", "fullName");
      const order = await Order.findById(orderId).populate("userId", "fullName email");
      
      const orderItemIdStr = (orderItemId || delivery.orderItemId)?.toString() || '';
      const productIdStr = (productId || delivery.productId)?.toString() || '';
      const statusLabel = status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      
      // Build action URL with item context
      const actionUrlBase = `/user/orders?orderId=${orderId}&orderItemId=${orderItemIdStr}&productId=${productIdStr}`;

      // Notify seller (product owner) about status updates
      if (product?.userID && userRole !== "seller") {
        // Don't notify seller if they're the one updating
        try {
          await createNotification({
            userId: product.userID._id || product.userID,
            type: "order",
            title: `Delivery Status Updated: ${statusLabel}`,
            message: `Delivery status for "${product.title}" from order #${orderId.toString().slice(-8)} has been updated to ${statusLabel}.`,
            relatedEntity: {
              entityType: "order",
              entityId: orderId,
            },
            actionUrl: `/user/products?orderId=${orderId}&orderItemId=${orderItemIdStr}&productId=${productIdStr}`,
            metadata: {
              orderId: orderId.toString(),
              deliveryId: delivery._id.toString(),
              productId: productIdStr,
              orderItemId: orderItemIdStr,
              productTitle: product.title,
              status: status,
              updatedBy: userId.toString(),
              updatedByRole: userRole,
            },
          });
        } catch (notifError) {
          console.error("Error creating seller notification:", notifError);
        }
      }

      // Notify delivery agency about status updates (except if they're the ones updating)
      if (delivery.assignedDeliveryAgency && userRole !== "delivery_agency" && userRole !== "admin") {
        try {
          await createNotification({
            userId: delivery.assignedDeliveryAgency,
            type: "order",
            title: `Delivery Status Updated: ${statusLabel}`,
            message: `Delivery status for order #${orderId.toString().slice(-8)} item "${product?.title || "Product"}" has been updated to ${statusLabel}.`,
            relatedEntity: {
              entityType: "order",
              entityId: orderId,
            },
            actionUrl: `/user/delivery-agency?orderId=${orderId}&orderItemId=${orderItemIdStr}&productId=${productIdStr}`,
            metadata: {
              orderId: orderId.toString(),
              deliveryId: delivery._id.toString(),
              productId: productIdStr,
              orderItemId: orderItemIdStr,
              productTitle: product?.title || "Product",
              status: status,
              updatedBy: userId.toString(),
              updatedByRole: userRole,
            },
          });
        } catch (notifError) {
          console.error("Error creating delivery agency notification:", notifError);
        }
      }

      // Notify deliverer about status updates (except if they're the ones updating)
      if (delivery.assignedDeliveryPerson && userRole !== "delivery_person" && userRole !== "admin") {
        try {
          await createNotification({
            userId: delivery.assignedDeliveryPerson,
            type: "order",
            title: `Delivery Status Updated: ${statusLabel}`,
            message: `Delivery status for order #${orderId.toString().slice(-8)} item "${product?.title || "Product"}" has been updated to ${statusLabel}.`,
            relatedEntity: {
              entityType: "order",
              entityId: orderId,
            },
            actionUrl: `/user/delivery-person?orderId=${orderId}&orderItemId=${orderItemIdStr}&productId=${productIdStr}`,
            metadata: {
              orderId: orderId.toString(),
              deliveryId: delivery._id.toString(),
              productId: productIdStr,
              orderItemId: orderItemIdStr,
              productTitle: product?.title || "Product",
              status: status,
              updatedBy: userId.toString(),
              updatedByRole: userRole,
            },
          });
        } catch (notifError) {
          console.error("Error creating deliverer notification:", notifError);
        }
      }

      // Special notification for ready_to_ship to delivery agency
      if (status === "ready_to_ship" && delivery.assignedDeliveryAgency) {
        try {
          await createNotification({
            userId: delivery.assignedDeliveryAgency,
            type: "order",
            title: "Item Ready to Ship",
            message: `Item "${product?.title || "Product"}" from order #${orderId.toString().slice(-8)} is ready to ship. Please assign a delivery person.`,
            relatedEntity: {
              entityType: "order",
              entityId: orderId,
            },
            actionUrl: `/user/delivery-agency?orderId=${orderId}&orderItemId=${orderItemIdStr}&productId=${productIdStr}`,
            metadata: {
              orderId: orderId.toString(),
              deliveryId: delivery._id.toString(),
              productId: productIdStr,
              orderItemId: orderItemIdStr,
              productTitle: product?.title || "Product",
            },
          });
        } catch (notifError) {
          console.error("Error creating ready_to_ship notification:", notifError);
        }
      }

      // Notify buyer about significant status updates
      if (order?.userId && (status === "out_for_delivery" || status === "delivered")) {
        try {
          await createNotification({
            userId: order.userId._id || order.userId,
            type: "order",
            title: `Delivery Update: ${statusLabel}`,
            message: `Your order #${orderId.toString().slice(-8)} item "${product?.title || "Product"}" is now ${statusLabel.toLowerCase()}.`,
            relatedEntity: {
              entityType: "order",
              entityId: orderId,
            },
            actionUrl: `/user/orders?orderId=${orderId}&orderItemId=${orderItemIdStr}&productId=${productIdStr}`,
            metadata: {
              orderId: orderId.toString(),
              deliveryId: delivery._id.toString(),
              productId: productIdStr,
              orderItemId: orderItemIdStr,
              productTitle: product?.title || "Product",
              status: status,
            },
          });
        } catch (notifError) {
          console.error("Error creating buyer notification:", notifError);
        }
      }
    } catch (notifError) {
      console.error("Error creating status update notifications:", notifError);
      // Don't fail the request if notification creation fails
    }

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

    // Get user role from request (set by Auth middleware)
    const userRole = req.userRole;
    
    // Check authorization: user can view if:
    // 1. They own the order (buyer)
    // 2. They are seller of products in the order
    // 3. They are delivery agency assigned to the delivery
    // 4. They are delivery person assigned to the delivery
    // 5. They are admin
    if (String(order.userId) !== String(userId) && userRole !== "admin") {
      let isAuthorized = false;
      
      // Check if user is seller of any product in the order
      const Product = (await import("../models/product.js")).default;
      const productIds = order.items.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      const isSeller = products.some(
        (p) => String(p.userID) === String(userId)
      );
      
      if (isSeller) {
        isAuthorized = true;
      } else if (userRole === "delivery_agency" || userRole === "delivery_person") {
        // Check if deliveries are assigned to this user
        const deliveries = await Delivery.find({ orderId });
        if (userRole === "delivery_agency") {
          isAuthorized = deliveries.some(
            (d) => d.assignedDeliveryAgency && String(d.assignedDeliveryAgency) === String(userId)
          );
        } else if (userRole === "delivery_person") {
          isAuthorized = deliveries.some(
            (d) => d.assignedDeliveryPerson && String(d.assignedDeliveryPerson) === String(userId)
          );
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({ message: "Unauthorized to view this delivery" });
      }
    }

    // Get all delivery tracking records for this order (one per item)
    const deliveries = await Delivery.find({ orderId }).populate("productId", "title thumbnail");
    
    if (!deliveries || deliveries.length === 0) {
      return res.json({ deliveries: [], order });
    }

    // Map deliveries to include order item info
    const deliveriesWithItems = deliveries.map(delivery => {
      const orderItem = order.items.find(
        item => String(item._id) === String(delivery.orderItemId) || 
                String(item.productId) === String(delivery.productId)
      );
      return {
        ...delivery.toObject(),
        orderItem: orderItem || null,
      };
    });

    return res.json({ deliveries: deliveriesWithItems, order });
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
