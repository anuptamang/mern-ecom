import Delivery from "../models/delivery.js";
import Order from "../models/order.js";
import User from "../models/user.js";
import config from "../config/index.js";

/**
 * Assign delivery to a delivery agency
 * Can be done by admin only (sellers cannot assign - agency is auto-assigned)
 */
export const assignToDeliveryAgency = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryAgencyId, orderItemId, productId } = req.body; // Support per-item assignment
    const userId = req.userId;
    const userRole = req.userRole;

    // Only admin can manually assign to delivery agency (agency is auto-assigned during creation)
    if (userRole !== "admin") {
      return res.status(403).json({ 
        message: "Only admins can manually assign orders to delivery agencies. Delivery agencies are automatically assigned during order creation." 
      });
    }

    // Verify delivery agency exists and has correct role
    const deliveryAgency = await User.findById(deliveryAgencyId);
    if (!deliveryAgency || deliveryAgency.role !== "delivery_agency") {
      return res.status(404).json({ message: "Delivery agency not found" });
    }

    // Find delivery tracking for specific item or all items (if per-item not specified)
    let deliveries;
    if (orderItemId || productId) {
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      deliveries = [await Delivery.findOne(query)];
      if (!deliveries[0]) {
        return res.status(404).json({ message: "Delivery tracking for this item not found" });
      }
    } else {
      // Assign all items in the order (backward compatibility)
      deliveries = await Delivery.find({ orderId });
      if (!deliveries || deliveries.length === 0) {
        return res.status(404).json({ message: "Delivery tracking not found for this order" });
      }
    }

    // Only assign if status is ready_to_ship or picked_up
    for (const delivery of deliveries) {
      if (delivery.status !== "ready_to_ship" && delivery.status !== "picked_up") {
        return res.status(400).json({ 
          message: `Can only assign to delivery agency when status is 'ready_to_ship' or 'picked_up'. Item ${delivery.orderItemId || delivery.productId} is currently ${delivery.status}` 
        });
      }
    }

    // Assign all deliveries
    for (const delivery of deliveries) {
      delivery.assignedDeliveryAgency = deliveryAgencyId;
      if (!delivery.assignedAt) {
        delivery.assignedAt = new Date();
      }
      delivery.statusHistory.push({
        status: delivery.status,
        timestamp: new Date(),
        note: `Assigned to delivery agency: ${deliveryAgency.fullName || deliveryAgency.email}`,
        updatedBy: userId,
        updatedByRole: userRole,
      });
      await delivery.save();
    }

    return res.json({ 
      message: `Delivery${deliveries.length > 1 ? 's' : ''} assigned to agency successfully`, 
      deliveries: deliveries.length === 1 ? deliveries[0] : deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error("Error assigning to delivery agency:", error);
    return res.status(500).json({ message: "Failed to assign delivery to agency" });
  }
};

/**
 * Assign delivery to a delivery person
 * Can be done by delivery agency or admin
 */
export const assignToDeliveryPerson = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonId, orderItemId, productId } = req.body; // Support per-item assignment
    const userId = req.userId;
    const userRole = req.userRole;

    // Only admin, delivery agency, or warehouse operator can assign to delivery person
    // Warehouse operators can only assign customer deliverers
    if (userRole !== "admin" && userRole !== "delivery_agency" && userRole !== "warehouse_operator") {
      return res.status(403).json({ 
        message: "Only admins, delivery agencies, or warehouse operators can assign orders to delivery persons." 
      });
    }

    // Find delivery tracking for specific item or all items
    let deliveries;
    if (orderItemId || productId) {
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      deliveries = [await Delivery.findOne(query)];
      if (!deliveries[0]) {
        return res.status(404).json({ message: "Delivery tracking for this item not found" });
      }
    } else {
      // Assign all items in the order
      deliveries = await Delivery.find({ orderId });
      if (!deliveries || deliveries.length === 0) {
        return res.status(404).json({ message: "Delivery tracking not found for this order" });
      }
    }

    // If delivery agency is assigning, verify they own these deliveries
    if (userRole === "delivery_agency") {
      for (const delivery of deliveries) {
        if (String(delivery.assignedDeliveryAgency) !== String(userId)) {
          return res.status(403).json({ 
            message: "Unauthorized. You can only assign deliveries assigned to your agency." 
          });
        }
      }
    }
    
    // Verify delivery person exists and has correct role
    const deliveryPerson = await User.findById(deliveryPersonId);
    if (!deliveryPerson || deliveryPerson.role !== "delivery_person") {
      return res.status(404).json({ message: "Delivery person not found" });
    }
    
    // Warehouse operators can only assign customer deliverers and only when status is in_transit
    if (userRole === "warehouse_operator") {
      // Verify delivery person is a customer_delivery deliverer
      if (deliveryPerson.delivererType !== "customer_delivery") {
        return res.status(400).json({ 
          message: "Warehouse operators can only assign customer_delivery deliverers for regular order deliveries." 
        });
      }
      
      for (const delivery of deliveries) {
        const freshDelivery = await Delivery.findById(delivery._id);
        if (freshDelivery.status !== "in_transit") {
          return res.status(400).json({ 
            message: `Warehouse operator can only assign customer deliverers when status is 'in_transit'. Current status is '${freshDelivery.status}' for item ${freshDelivery.orderItemId || freshDelivery.productId}` 
          });
        }
      }
    }

    // Check deliverer type and current status
    for (const delivery of deliveries) {
      // Refresh delivery from database to ensure we have the latest status
      const freshDelivery = await Delivery.findById(delivery._id);
      if (!freshDelivery) {
        return res.status(404).json({ 
          message: `Delivery tracking not found for item ${delivery.orderItemId || delivery.productId}` 
        });
      }
      
      const currentStatus = freshDelivery.status;
      
      if (deliveryPerson.delivererType === "warehouse") {
        // Warehouse deliverer can only be assigned when status is ready_to_ship
        if (currentStatus !== "ready_to_ship") {
          return res.status(400).json({ 
            message: `Warehouse deliverer can only be assigned when status is 'ready_to_ship'. Current status is '${currentStatus}' for item ${freshDelivery.orderItemId || freshDelivery.productId}` 
          });
        }
        // If there's already a customer deliverer assigned, they shouldn't be able to assign warehouse deliverer
        if (freshDelivery.assignedDeliveryPerson) {
          // Check if the assigned person is a customer deliverer
          const assignedPerson = await User.findById(freshDelivery.assignedDeliveryPerson);
          if (assignedPerson?.delivererType === "customer") {
            return res.status(400).json({ 
              message: "Cannot assign warehouse deliverer when a customer deliverer is already assigned. Please reassign only when status allows." 
            });
          }
        }
      } else if (deliveryPerson.delivererType === "customer_delivery" || deliveryPerson.delivererType === "customer_return") {
        // Customer deliverer can be assigned when status is in_facility or in_transit
        // If assigned by warehouse operator, status must be in_transit
        if (userRole === "warehouse_operator") {
          if (currentStatus !== "in_transit") {
            return res.status(400).json({ 
              message: `Warehouse operator can only assign customer deliverers when status is 'in_transit'. Current status is '${currentStatus}' for item ${freshDelivery.orderItemId || freshDelivery.productId}.` 
            });
          }
        } else {
          // For admin or delivery agency, customer deliverer can be assigned at in_facility or in_transit
          if (currentStatus !== "in_facility" && currentStatus !== "in_transit") {
            return res.status(400).json({ 
              message: `Customer deliverer can only be assigned when status is 'in_facility' or 'in_transit'. Current status is '${currentStatus}' for item ${freshDelivery.orderItemId || freshDelivery.productId}. Please assign a warehouse deliverer first to move status to 'in_facility'.` 
            });
          }
        }
        // When assigning customer deliverer, clear previous warehouse deliverer assignment
        // This ensures we transition from warehouse to customer deliverer
      } else {
        return res.status(400).json({ 
          message: "Delivery person must have a valid deliverer type (warehouse, customer_delivery, or customer_return)" 
        });
      }
    }

    // Verify delivery person belongs to the assigned agency (check first delivery)
    if (deliveries.length > 0 && deliveries[0].assignedDeliveryAgency) {
      const agencyId = deliveries[0].assignedDeliveryAgency;
      if (String(deliveryPerson.deliveryAgencyId) !== String(agencyId)) {
        return res.status(400).json({ 
          message: "Delivery person must belong to the assigned delivery agency." 
        });
      }
    }

    // Assign all deliveries and send notifications
    const { createNotification } = await import("./notifications.js");
    const Product = (await import("../models/product.js")).default;
    
    for (const deliveryDoc of deliveries) {
      // Get fresh delivery document to ensure we're working with the latest data
      const delivery = await Delivery.findById(deliveryDoc._id);
      if (!delivery) continue;
      
      // When assigning customer deliverer, clear warehouse deliverer assignment
      // When assigning warehouse deliverer, ensure no customer deliverer is assigned
      const previousAssignedPerson = delivery.assignedDeliveryPerson;
      
      // Check if we're switching from warehouse to customer deliverer
      if ((deliveryPerson.delivererType === "customer_delivery" || deliveryPerson.delivererType === "customer_return") && previousAssignedPerson) {
        const previousPerson = await User.findById(previousAssignedPerson);
        if (previousPerson?.delivererType === "warehouse") {
          // Clear previous warehouse deliverer assignment
          // This allows transition from warehouse to customer deliverer
        }
      }
      
      // Check if this is a reassignment (different deliverer) or first assignment
      const previousAssignedPersonId = delivery.assignedDeliveryPerson;
      const isReassignment = previousAssignedPersonId && String(previousAssignedPersonId) !== String(deliveryPersonId);
      
      delivery.assignedDeliveryPerson = deliveryPersonId;
      delivery.assignedAt = new Date(); // Always update assignedAt when reassigning
      
      // Only add status history entry if status actually changed OR this is first assignment
      // If status hasn't changed and it's just a reassignment, don't duplicate the status entry
      // Instead, add a note-only entry or update the existing entry
      const assignmentNote = deliveryPerson.delivererType === "warehouse" 
        ? `Assigned to warehouse deliverer: ${deliveryPerson.fullName || deliveryPerson.email}`
        : deliveryPerson.delivererType === "customer_delivery"
        ? `Assigned to customer delivery deliverer: ${deliveryPerson.fullName || deliveryPerson.email}`
        : `Assigned to customer return deliverer: ${deliveryPerson.fullName || deliveryPerson.email}`;
      
      // Check if last status history entry has the same status and is recent (within 60 seconds)
      // If so, combine them to avoid duplicate entries
      const lastHistoryEntry = delivery.statusHistory[delivery.statusHistory.length - 1];
      const statusUnchanged = lastHistoryEntry && lastHistoryEntry.status === delivery.status;
      const isRecentEntry = lastHistoryEntry && (new Date() - new Date(lastHistoryEntry.timestamp)) < 60000; // Within 60 seconds
      
      if (statusUnchanged && isRecentEntry && !isReassignment) {
        // Status hasn't changed and last entry is recent - append assignment info to existing entry
        if (lastHistoryEntry.note && !lastHistoryEntry.note.includes(assignmentNote)) {
          lastHistoryEntry.note = `${lastHistoryEntry.note}. ${assignmentNote}`;
        } else if (!lastHistoryEntry.note) {
          lastHistoryEntry.note = assignmentNote;
        }
      } else {
        // Status changed OR entry is old OR reassignment - add new status history entry
        delivery.statusHistory.push({
          status: delivery.status,
          timestamp: new Date(),
          note: assignmentNote,
          updatedBy: userId,
          updatedByRole: userRole,
        });
      }
      
      await delivery.save();

      // Notify deliverer and seller about assignment
      try {
        const product = await Product.findById(delivery.productId).populate("userID", "fullName");
        const order = await Order.findById(delivery.orderId);
        
        // Notify deliverer that they've been assigned
        await createNotification({
          userId: deliveryPersonId,
          type: "order",
          title: "New Delivery Assignment",
          message: `You have been assigned to deliver "${product?.title || "Product"}" from order #${delivery.orderId.toString().slice(-8)}.`,
          relatedEntity: {
            entityType: "order",
            entityId: delivery.orderId,
          },
          actionUrl: `/user/delivery-person?orderId=${delivery.orderId}&orderItemId=${delivery.orderItemId || ''}&productId=${delivery.productId}`,
          metadata: {
            orderId: delivery.orderId.toString(),
            deliveryId: delivery._id.toString(),
            productId: delivery.productId.toString(),
            orderItemId: delivery.orderItemId?.toString(),
            productTitle: product?.title || "Product",
          },
        });

        // Notify seller about assignment
        if (product?.userID) {
          try {
            await createNotification({
              userId: product.userID._id || product.userID,
              type: "order",
              title: "Delivery Person Assigned",
              message: `Delivery person "${deliveryPerson.fullName || deliveryPerson.email}" has been assigned to deliver your product "${product.title}" from order #${delivery.orderId.toString().slice(-8)}.`,
              relatedEntity: {
                entityType: "order",
                entityId: delivery.orderId,
              },
              actionUrl: `/user/products?orderId=${delivery.orderId}&orderItemId=${delivery.orderItemId || ''}&productId=${delivery.productId}`,
              metadata: {
                orderId: delivery.orderId.toString(),
                deliveryId: delivery._id.toString(),
                productId: delivery.productId.toString(),
                orderItemId: delivery.orderItemId?.toString(),
                productTitle: product.title,
              },
            });
          } catch (notifError) {
            console.error("Error creating seller notification:", notifError);
          }
        }
      } catch (notifError) {
        console.error("Error creating deliverer assignment notification:", notifError);
      }
    }

    return res.json({ 
      message: `Delivery${deliveries.length > 1 ? 's' : ''} assigned to person successfully`, 
      deliveries: deliveries.length === 1 ? deliveries[0] : deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error("Error assigning to delivery person:", error);
    return res.status(500).json({ message: "Failed to assign delivery to person" });
  }
};

/**
 * Mark delivery as delivered with proof
 * Only delivery person assigned to this delivery can do this
 */
export const markAsDelivered = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note, orderItemId, productId } = req.body; // Support per-item delivery
    const deliveryProof = req.file ? `${config.upload.imageBucketUrl}/${req.file.filename}` : null;
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== "delivery_person") {
      return res.status(403).json({ 
        message: "Only delivery persons can mark deliveries as delivered." 
      });
    }

    // Find delivery tracking for specific item (per-item tracking requires itemId)
    let delivery;
    if (orderItemId || productId) {
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      delivery = await Delivery.findOne(query);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking for this item not found" });
      }
    } else {
      // Backward compatibility: find first delivery for order
      delivery = await Delivery.findOne({ orderId });
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    }

    // Verify delivery is assigned to this person
    if (String(delivery.assignedDeliveryPerson) !== String(userId)) {
      return res.status(403).json({ 
        message: "Unauthorized. You can only mark deliveries assigned to you as delivered." 
      });
    }

    // Verify status is out_for_delivery
    if (delivery.status !== "out_for_delivery") {
      return res.status(400).json({ 
        message: "Can only mark as delivered when status is 'out_for_delivery'" 
      });
    }

    // Verify deliverer is customer_delivery type (for regular order deliveries)
    const User = (await import("../models/user.js")).default;
    const deliverer = await User.findById(userId);
    if (deliverer?.delivererType !== "customer_delivery") {
      return res.status(403).json({ 
        message: "Only customer delivery deliverers can mark regular order deliveries as delivered" 
      });
    }

    // Require delivery proof
    if (!deliveryProof) {
      return res.status(400).json({ 
        message: "Delivery proof (proof of delivery acceptance) is required" 
      });
    }

    delivery.status = "delivered";
    delivery.actualDeliveryDate = new Date();
    delivery.deliveryProof = deliveryProof;
    delivery.buyerAcceptance = "accepted"; // Automatically accepted when customer deliverer marks as delivered with proof
    delivery.buyerAcceptedAt = new Date();

    delivery.statusHistory.push({
      status: "delivered",
      timestamp: new Date(),
      note: note || "Package delivered",
      updatedBy: userId,
      updatedByRole: userRole,
    });

    await delivery.save();

    // Update order item delivery status
    const order = await Order.findById(orderId);
    if (order) {
      const itemIndex = order.items.findIndex(
        (item) => 
          (orderItemId && String(item._id) === String(orderItemId)) ||
          (productId && String(item.productId) === String(productId))
      );
      if (itemIndex !== -1) {
        order.items[itemIndex].deliveryStatus = "delivered";
        order.items[itemIndex].actualDeliveryDate = new Date();
        await order.save();
      }
    }

    return res.json({ 
      message: "Delivery marked as delivered successfully", 
      delivery,
      awaitingBuyerConfirmation: true,
    });
  } catch (error) {
    console.error("Error marking delivery as delivered:", error);
    return res.status(500).json({ message: "Failed to mark delivery as delivered" });
  }
};

/**
 * Buyer accepts delivery
 */
export const acceptDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderItemId, productId } = req.body; // Support per-item acceptance
    const userId = req.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify user owns the order
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized to accept this delivery" });
    }

    // Find delivery tracking for specific item
    let delivery;
    if (orderItemId || productId) {
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      delivery = await Delivery.findOne(query);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking for this item not found" });
      }
    } else {
      // Backward compatibility: find first delivery for order
      delivery = await Delivery.findOne({ orderId });
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    }

    if (delivery.status !== "delivered") {
      return res.status(400).json({ message: "Order item is not in delivered status" });
    }

    if (delivery.buyerAcceptance !== "pending") {
      return res.status(400).json({ 
        message: `Delivery has already been ${delivery.buyerAcceptance}` 
      });
    }

    delivery.buyerAcceptance = "accepted";
    delivery.buyerAcceptedAt = new Date();

    delivery.statusHistory.push({
      status: delivery.status,
      timestamp: new Date(),
      note: "Buyer accepted delivery",
      updatedBy: userId,
      updatedByRole: "user",
    });

    await delivery.save();

    // Check if item has been returned/refunded - if not, create payout notification for finance
    try {
      const Return = (await import("../models/return.js")).default;
      const Product = (await import("../models/product.js")).default;
      const { createNotification } = await import("./notifications.js");
      const Payout = (await import("../models/payout.js")).default;

      // Find order item
      const orderItem = order.items.find(
        (item) =>
          (orderItemId && String(item._id) === String(orderItemId)) ||
          (productId && String(item.productId) === String(productId))
      );

      if (orderItem) {
        // Check if item has been returned or refunded
        const returnRequest = await Return.findOne({
          orderId: orderId,
          returnStatus: { $nin: ["cancelled"] },
          "items.productId": orderItem.productId,
        });

        const hasReturn = returnRequest && returnRequest.returnStatus !== "cancelled";
        const isRefunded = orderItem.refundStatus === "succeeded" || orderItem.returnStatus === "completed";

        // If not returned/refunded, create payout notification
        if (!hasReturn && !isRefunded) {
          // Get product and seller info
          const product = await Product.findById(orderItem.productId).populate("userID");
          const seller = product?.userID;

          if (seller && seller.role === "seller") {
            // Check if payout already exists for this delivery
            const existingPayout = await Payout.findOne({
              orderId: orderId,
              orderItemId: orderItemId || orderItem._id.toString(),
              productId: orderItem.productId,
              deliveryId: delivery._id,
            });

            if (!existingPayout) {
              // Calculate payout amount (seller's portion after platform fee, if any)
              // For now, use the full item price * quantity (platform fee can be added later)
              const payoutAmount = Math.round(orderItem.price * orderItem.quantity); // Amount in cents

              // Create payout record
              const payout = await Payout.create({
                orderId: orderId,
                orderItemId: orderItemId || orderItem._id.toString(),
                productId: orderItem.productId,
                sellerId: seller._id,
                deliveryId: delivery._id,
                payoutAmount: payoutAmount,
                currency: order.currency || "usd",
                status: "pending",
                bankPayout: seller.bankPayout || null,
              });

              // Notify all finance users
              const User = (await import("../models/user.js")).default;
              const financeUsers = await User.find({ role: "finance" }).select("_id");

              for (const financeUser of financeUsers) {
                await createNotification({
                  userId: financeUser._id,
                  type: "order",
                  title: "Pending Payout to Seller",
                  message: `Payout pending for order #${orderId.toString().slice(-8)} item "${product?.title || "Product"}" (${seller.fullName || seller.email}). Amount: $${(payoutAmount / 100).toFixed(2)}`,
                  relatedEntity: {
                    entityType: "order",
                    entityId: orderId,
                  },
                  actionUrl: `/user/finance?payoutId=${payout._id}`,
                  metadata: {
                    orderId: orderId.toString(),
                    payoutId: payout._id.toString(),
                    sellerId: seller._id.toString(),
                    productId: orderItem.productId.toString(),
                    productTitle: product?.title || "Product",
                    payoutAmount: payoutAmount,
                    sellerName: seller.fullName || seller.email,
                  },
                });
              }
            }
          }
        }
      }
    } catch (payoutError) {
      // Log error but don't fail the delivery acceptance
      console.error("Error creating payout notification:", payoutError);
    }

    return res.json({ message: "Delivery accepted successfully", delivery });
  } catch (error) {
    console.error("Error accepting delivery:", error);
    return res.status(500).json({ message: "Failed to accept delivery" });
  }
};

/**
 * Buyer rejects delivery
 */
export const rejectDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, orderItemId, productId } = req.body; // Support per-item rejection
    const userId = req.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify user owns the order
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized to reject this delivery" });
    }

    // Find delivery tracking for specific item
    let delivery;
    if (orderItemId || productId) {
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      delivery = await Delivery.findOne(query);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking for this item not found" });
      }
    } else {
      // Backward compatibility: find first delivery for order
      delivery = await Delivery.findOne({ orderId });
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    }

    if (delivery.status !== "delivered") {
      return res.status(400).json({ message: "Order item is not in delivered status" });
    }

    if (delivery.buyerAcceptance !== "pending") {
      return res.status(400).json({ 
        message: `Delivery has already been ${delivery.buyerAcceptance}` 
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: "Please provide a reason for rejecting delivery" });
    }

    delivery.buyerAcceptance = "rejected";
    delivery.buyerRejectionReason = reason;
    delivery.buyerRejectedAt = new Date();

    delivery.statusHistory.push({
      status: delivery.status,
      timestamp: new Date(),
      note: `Buyer rejected delivery: ${reason}`,
      updatedBy: userId,
      updatedByRole: "user",
    });

    await delivery.save();

    return res.json({ 
      message: "Delivery rejected. The seller will be notified.",
      delivery,
    });
  } catch (error) {
    console.error("Error rejecting delivery:", error);
    return res.status(500).json({ message: "Failed to reject delivery" });
  }
};

/**
 * Get deliveries assigned to a delivery agency
 */
export const getAgencyDeliveries = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== "delivery_agency" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deliveries = await Delivery.find({
      assignedDeliveryAgency: userId,
    })
      .populate("orderId")
      .populate("assignedDeliveryPerson", "fullName email phone delivererType")
      .sort({ createdAt: -1 });

    return res.json({ deliveries, count: deliveries.length });
  } catch (error) {
    console.error("Error fetching agency deliveries:", error);
    return res.status(500).json({ message: "Failed to fetch agency deliveries" });
  }
};

/**
 * Get deliveries assigned to a delivery person
 */
export const getPersonDeliveries = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== "delivery_person" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deliveries = await Delivery.find({
      assignedDeliveryPerson: userId,
    })
      .populate("orderId")
      .populate("assignedDeliveryAgency", "fullName email")
      .sort({ createdAt: -1 });

    return res.json({ deliveries, count: deliveries.length });
  } catch (error) {
    console.error("Error fetching person deliveries:", error);
    return res.status(500).json({ message: "Failed to fetch person deliveries" });
  }
};

/**
 * Get deliveries for warehouse operator
 * Warehouse operators see deliveries with status in_facility or in_transit
 */
export const getWarehouseOperatorDeliveries = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== "warehouse_operator" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Warehouse operators see deliveries they've handled: in_facility, in_transit, out_for_delivery, delivered
    // Include both assigned and unassigned for visibility of all facility operations
    const deliveries = await Delivery.find({
      $or: [
        { status: { $in: ["in_facility", "in_transit", "out_for_delivery"] } },
        { assignedWarehouseOperator: userId, status: "delivered" },
      ],
    })
      .populate("orderId")
      .populate("assignedDeliveryAgency", "fullName email")
      .populate("assignedDeliveryPerson", "fullName email phone delivererType")
      .sort({ createdAt: -1 });

    return res.json({ deliveries, count: deliveries.length });
  } catch (error) {
    console.error("Error fetching warehouse operator deliveries:", error);
    return res.status(500).json({ message: "Failed to fetch warehouse operator deliveries" });
  }
};

/**
 * Get warehouse operators list
 * Can be accessed by delivery agency or admin
 */
export const getWarehouseOperators = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== "delivery_agency" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Get all warehouse operators
    const warehouseOperators = await User.find({
      role: "warehouse_operator",
    }).select("fullName email phone");

    return res.json({ warehouseOperators, count: warehouseOperators.length });
  } catch (error) {
    console.error("Error fetching warehouse operators:", error);
    return res.status(500).json({ message: "Failed to fetch warehouse operators" });
  }
};

/**
 * Assign warehouse operator to a delivery
 * Can be done by delivery agency when status is in_facility
 */
export const assignWarehouseOperator = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { warehouseOperatorId, orderItemId, productId } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== "delivery_agency" && userRole !== "admin") {
      return res.status(403).json({
        message: "Only delivery agencies or admins can assign warehouse operators."
      });
    }

    // Find delivery tracking for specific item or all items
    let deliveries;
    if (orderItemId || productId) {
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      deliveries = [await Delivery.findOne(query)];
      if (!deliveries[0]) {
        return res.status(404).json({ message: "Delivery tracking for this item not found" });
      }
    } else {
      deliveries = await Delivery.find({ orderId });
      if (!deliveries || deliveries.length === 0) {
        return res.status(404).json({ message: "Delivery tracking not found for this order" });
      }
    }

    // If delivery agency is assigning, verify they own these deliveries
    if (userRole === "delivery_agency") {
      for (const delivery of deliveries) {
        if (String(delivery.assignedDeliveryAgency) !== String(userId)) {
          return res.status(403).json({
            message: "Unauthorized. You can only assign warehouse operators to deliveries assigned to your agency."
          });
        }
      }
    }

    // Verify warehouse operator exists and has correct role
    const warehouseOperator = await User.findById(warehouseOperatorId);
    if (!warehouseOperator || warehouseOperator.role !== "warehouse_operator") {
      return res.status(404).json({ message: "Warehouse operator not found" });
    }

    // Verify all deliveries have status in_facility
    for (const delivery of deliveries) {
      const freshDelivery = await Delivery.findById(delivery._id);
      if (!freshDelivery) {
        return res.status(404).json({
          message: `Delivery tracking not found for item ${delivery.orderItemId || delivery.productId}`
        });
      }
      
      if (freshDelivery.status !== "in_facility") {
        return res.status(400).json({
          message: `Warehouse operator can only be assigned when status is 'in_facility'. Current status is '${freshDelivery.status}' for item ${freshDelivery.orderItemId || freshDelivery.productId}`
        });
      }
    }

    // Assign warehouse operator and send notifications
    const { createNotification } = await import("./notifications.js");
    const Product = (await import("../models/product.js")).default;
    const Order = (await import("../models/order.js")).default;
    
    for (const deliveryDoc of deliveries) {
      const delivery = await Delivery.findById(deliveryDoc._id);
      if (!delivery) continue;

      delivery.assignedWarehouseOperator = warehouseOperatorId;
      
      // Check if last status history entry has the same status and is recent (within 60 seconds)
      // If so, combine them to avoid duplicate entries
      const assignmentNote = `Assigned to warehouse operator: ${warehouseOperator.fullName || warehouseOperator.email}`;
      const lastHistoryEntry = delivery.statusHistory[delivery.statusHistory.length - 1];
      const statusUnchanged = lastHistoryEntry && lastHistoryEntry.status === delivery.status;
      const isRecentEntry = lastHistoryEntry && (new Date() - new Date(lastHistoryEntry.timestamp)) < 60000; // Within 60 seconds
      
      if (statusUnchanged && isRecentEntry) {
        // Status hasn't changed and last entry is recent - append assignment info to existing entry
        if (lastHistoryEntry.note && !lastHistoryEntry.note.includes(assignmentNote)) {
          lastHistoryEntry.note = `${lastHistoryEntry.note}. ${assignmentNote}`;
        } else if (!lastHistoryEntry.note) {
          lastHistoryEntry.note = assignmentNote;
        }
      } else {
        // Status changed OR entry is old - add new status history entry
        delivery.statusHistory.push({
          status: delivery.status,
          timestamp: new Date(),
          note: assignmentNote,
          updatedBy: userId,
          updatedByRole: userRole,
        });
      }
      
      await delivery.save();

      // Notify warehouse operator
      try {
        const product = await Product.findById(delivery.productId);
        const order = await Order.findById(delivery.orderId);
        
        await createNotification({
          userId: warehouseOperatorId,
          type: "order",
          title: "Package Assigned for Processing",
          message: `Package for order #${orderId.toString().slice(-8)} item "${product?.title || "Product"}" has been assigned to you for processing.`,
          relatedEntity: {
            entityType: "order",
            entityId: orderId,
          },
          actionUrl: `/user/warehouse-operator?orderId=${orderId}&orderItemId=${delivery.orderItemId?.toString() || ''}&productId=${delivery.productId?.toString() || ''}`,
          metadata: {
            orderId: orderId.toString(),
            deliveryId: delivery._id.toString(),
            productId: delivery.productId?.toString() || '',
            orderItemId: delivery.orderItemId?.toString() || '',
            productTitle: product?.title || "Product",
            status: delivery.status,
          },
        });
      } catch (notifError) {
        console.error("Error creating warehouse operator notification:", notifError);
      }
    }

    return res.json({
      message: `Warehouse operator assigned successfully`,
      deliveries: deliveries.length === 1 ? deliveries[0] : deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error("Error assigning warehouse operator:", error);
    return res.status(500).json({ message: "Failed to assign warehouse operator" });
  }
};

/**
 * Get delivery persons for an agency
 * Also allows warehouse operators to get customer deliverers from any agency
 */
export const getAgencyPersons = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { agencyId } = req.params;

    if (userRole !== "delivery_agency" && userRole !== "admin" && userRole !== "warehouse_operator") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Build query based on role
    let query = {};
    
    if (userRole === "warehouse_operator") {
      // Warehouse operators can see customer_delivery deliverers from any agency
      // They assign customer_delivery deliverers for regular order deliveries
      query = {
        role: "delivery_person",
        delivererType: "customer_delivery",
      };
    } else {
      // Delivery agencies and admins see all deliverers from their agency
      const agencyIdToUse = userRole === "admin" ? (agencyId || userId) : userId;
      query = {
        role: "delivery_person",
        deliveryAgencyId: agencyIdToUse,
      };
    }

    const deliveryPersons = await User.find(query).select("fullName email phone delivererType deliveryAgencyId");

    return res.json({ deliveryPersons, count: deliveryPersons.length });
  } catch (error) {
    console.error("Error fetching delivery persons:", error);
    return res.status(500).json({ message: "Failed to fetch delivery persons" });
  }
};

/**
 * Create a delivery person for an agency
 * Can be done by delivery agency or admin
 */
export const createDeliveryPerson = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { email, password, fullName, phone, delivererType } = req.body;

    // Only admin or delivery agency can create delivery persons
    if (userRole !== "admin" && userRole !== "delivery_agency") {
      return res.status(403).json({ 
        message: "Only admins or delivery agencies can create delivery persons." 
      });
    }

    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        message: "Email, password, and full name are required" 
      });
    }

    if (!delivererType || !["warehouse", "customer_delivery", "customer_return"].includes(delivererType)) {
      return res.status(400).json({ 
        message: "Deliverer type is required and must be 'warehouse', 'customer_delivery', or 'customer_return'" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const bcrypt = (await import("bcryptjs")).default;
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine agency ID
    const agencyId = userRole === "admin" ? req.params.agencyId || userId : userId;

    // Create delivery person
    const deliveryPerson = await User.create({
      email,
      password: hashedPassword,
      fullName,
      phone: phone || undefined,
      role: "delivery_person",
      deliveryAgencyId: agencyId,
      delivererType: delivererType,
    });

    return res.status(201).json({ 
      message: "Delivery person created successfully",
      deliveryPerson: {
        _id: deliveryPerson._id,
        email: deliveryPerson.email,
        fullName: deliveryPerson.fullName,
        phone: deliveryPerson.phone,
        role: deliveryPerson.role,
        deliveryAgencyId: deliveryPerson.deliveryAgencyId,
        delivererType: deliveryPerson.delivererType,
      }
    });
  } catch (error) {
    console.error("Error creating delivery person:", error);
    return res.status(500).json({ message: "Failed to create delivery person" });
  }
};

/**
 * Reassign delivery agency
 * Can be done by admin or previous agency (for reassignment)
 */
export const reassignDeliveryAgency = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newAgencyId, orderItemId, productId, reason } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only admin can reassign delivery agency
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only admins can reassign delivery agency" });
    }

    // Verify new delivery agency exists
    const newAgency = await User.findById(newAgencyId);
    if (!newAgency || newAgency.role !== "delivery_agency") {
      return res.status(404).json({ message: "Delivery agency not found" });
    }

    // Find delivery tracking
    let delivery;
    if (orderItemId || productId) {
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      delivery = await Delivery.findOne(query);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    } else {
      delivery = await Delivery.findOne({ orderId });
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    }

    // Store previous assignment in history
    if (delivery.assignedDeliveryAgency) {
      const previousAgency = await User.findById(delivery.assignedDeliveryAgency);
      delivery.previousAssignments.push({
        assignmentType: "agency",
        assignedTo: delivery.assignedDeliveryAgency,
        assignedAt: delivery.assignedAt || delivery.createdAt,
        reassignedAt: new Date(),
        reassignedBy: userId,
        reassignmentReason: reason || "Reassigned by admin",
      });
    }

    // Reassign
    const oldAgencyId = delivery.assignedDeliveryAgency;
    delivery.assignedDeliveryAgency = newAgencyId;
    delivery.assignedAt = new Date();
    delivery.assignmentRejected = false; // Clear any previous rejection

    delivery.statusHistory.push({
      status: delivery.status,
      timestamp: new Date(),
      note: `Delivery agency reassigned from ${oldAgencyId ? 'previous agency' : 'none'} to ${newAgency.fullName || newAgency.email}${reason ? `. Reason: ${reason}` : ''}`,
      updatedBy: userId,
      updatedByRole: userRole,
    });

    await delivery.save();

    // Notify new agency
    const { createNotification } = await import("./notifications.js");
    try {
      await createNotification({
        userId: newAgencyId,
        type: "delivery",
        title: "Delivery Assigned",
        message: `A delivery for order #${orderId.toString().slice(-8)} has been assigned to your agency.`,
        relatedEntity: {
          entityType: "delivery",
          entityId: delivery._id,
        },
        actionUrl: `/user/delivery-agency?orderId=${orderId}&orderItemId=${delivery.orderItemId || ''}&productId=${delivery.productId}`,
      });

      // Notify old agency if existed
      if (oldAgencyId) {
        await createNotification({
          userId: oldAgencyId,
          type: "delivery",
          title: "Delivery Reassigned",
          message: `Delivery for order #${orderId.toString().slice(-8)} has been reassigned to another agency.`,
          relatedEntity: {
            entityType: "delivery",
            entityId: delivery._id,
          },
          actionUrl: `/user/delivery-agency?orderId=${orderId}`,
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Delivery agency reassigned successfully", delivery });
  } catch (error) {
    console.error("Error reassigning delivery agency:", error);
    return res.status(500).json({ message: "Failed to reassign delivery agency" });
  }
};

/**
 * Reassign delivery person
 * Can be done by delivery agency, warehouse operator, or admin
 */
export const reassignDeliveryPerson = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newPersonId, orderItemId, productId, reason } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only admin, delivery agency, or warehouse operator can reassign
    if (userRole !== "admin" && userRole !== "delivery_agency" && userRole !== "warehouse_operator") {
      return res.status(403).json({ message: "Unauthorized to reassign delivery person" });
    }

    // Verify new delivery person exists
    const newPerson = await User.findById(newPersonId);
    if (!newPerson || newPerson.role !== "delivery_person") {
      return res.status(404).json({ message: "Delivery person not found" });
    }

    // Find delivery tracking
    let delivery;
    if (orderItemId || productId) {
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      delivery = await Delivery.findOne(query);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    } else {
      delivery = await Delivery.findOne({ orderId });
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    }

    // Verify authorization
    if (userRole === "delivery_agency" && String(delivery.assignedDeliveryAgency) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized. You can only reassign deliveries assigned to your agency." });
    }

    // Verify deliverer type matches expected type for current status
    if (delivery.status === "ready_to_ship" && newPerson.delivererType !== "warehouse") {
      return res.status(400).json({ message: "Only warehouse deliverers can be assigned at ready_to_ship status" });
    }
    if ((delivery.status === "in_transit" || delivery.status === "out_for_delivery") && newPerson.delivererType !== "customer_delivery") {
      return res.status(400).json({ message: "Only customer delivery deliverers can be assigned at in_transit/out_for_delivery status" });
    }

    // Store previous assignment in history
    if (delivery.assignedDeliveryPerson) {
      const previousPerson = await User.findById(delivery.assignedDeliveryPerson);
      delivery.previousAssignments.push({
        assignmentType: "deliverer",
        assignedTo: delivery.assignedDeliveryPerson,
        assignedAt: delivery.assignedAt || delivery.createdAt,
        reassignedAt: new Date(),
        reassignedBy: userId,
        reassignmentReason: reason || "Reassigned",
      });
    }

    // Reassign
    const oldPersonId = delivery.assignedDeliveryPerson;
    delivery.assignedDeliveryPerson = newPersonId;
    delivery.assignedAt = new Date();
    delivery.assignmentRejected = false;

    delivery.statusHistory.push({
      status: delivery.status,
      timestamp: new Date(),
      note: `Delivery person reassigned from ${oldPersonId ? 'previous person' : 'none'} to ${newPerson.fullName || newPerson.email} (${newPerson.delivererType})${reason ? `. Reason: ${reason}` : ''}`,
      updatedBy: userId,
      updatedByRole: userRole,
    });

    await delivery.save();

    // Notify new person
    const { createNotification } = await import("./notifications.js");
    try {
      await createNotification({
        userId: newPersonId,
        type: "delivery",
        title: "Delivery Assigned",
        message: `A delivery for order #${orderId.toString().slice(-8)} has been assigned to you.`,
        relatedEntity: {
          entityType: "delivery",
          entityId: delivery._id,
        },
        actionUrl: `/user/delivery-person?orderId=${orderId}&orderItemId=${delivery.orderItemId || ''}&productId=${delivery.productId}`,
      });

      // Notify old person if existed
      if (oldPersonId) {
        await createNotification({
          userId: oldPersonId,
          type: "delivery",
          title: "Delivery Reassigned",
          message: `Delivery for order #${orderId.toString().slice(-8)} has been reassigned to another person.`,
          relatedEntity: {
            entityType: "delivery",
            entityId: delivery._id,
          },
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Delivery person reassigned successfully", delivery });
  } catch (error) {
    console.error("Error reassigning delivery person:", error);
    return res.status(500).json({ message: "Failed to reassign delivery person" });
  }
};

/**
 * Reassign warehouse operator
 * Can be done by delivery agency or admin
 */
export const reassignWarehouseOperator = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newOperatorId, orderItemId, productId, reason } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only admin or delivery agency can reassign warehouse operator
    if (userRole !== "admin" && userRole !== "delivery_agency") {
      return res.status(403).json({ message: "Unauthorized to reassign warehouse operator" });
    }

    // Verify new warehouse operator exists
    const newOperator = await User.findById(newOperatorId);
    if (!newOperator || newOperator.role !== "warehouse_operator") {
      return res.status(404).json({ message: "Warehouse operator not found" });
    }

    // Find delivery tracking
    let delivery;
    if (orderItemId || productId) {
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      delivery = await Delivery.findOne(query);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    } else {
      delivery = await Delivery.findOne({ orderId });
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    }

    // Verify authorization
    if (userRole === "delivery_agency" && String(delivery.assignedDeliveryAgency) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized. You can only reassign deliveries assigned to your agency." });
    }

    // Store previous assignment in history
    if (delivery.assignedWarehouseOperator) {
      delivery.previousAssignments.push({
        assignmentType: "warehouse_operator",
        assignedTo: delivery.assignedWarehouseOperator,
        assignedAt: delivery.assignedAt || delivery.createdAt,
        reassignedAt: new Date(),
        reassignedBy: userId,
        reassignmentReason: reason || "Reassigned",
      });
    }

    // Reassign
    const oldOperatorId = delivery.assignedWarehouseOperator;
    delivery.assignedWarehouseOperator = newOperatorId;
    delivery.assignmentRejected = false;

    delivery.statusHistory.push({
      status: delivery.status,
      timestamp: new Date(),
      note: `Warehouse operator reassigned from ${oldOperatorId ? 'previous operator' : 'none'} to ${newOperator.fullName || newOperator.email}${reason ? `. Reason: ${reason}` : ''}`,
      updatedBy: userId,
      updatedByRole: userRole,
    });

    await delivery.save();

    // Notify new operator
    const { createNotification } = await import("./notifications.js");
    try {
      await createNotification({
        userId: newOperatorId,
        type: "delivery",
        title: "Package Assigned",
        message: `A package for order #${orderId.toString().slice(-8)} has been assigned to you.`,
        relatedEntity: {
          entityType: "delivery",
          entityId: delivery._id,
        },
        actionUrl: `/user/warehouse-operator?orderId=${orderId}&orderItemId=${delivery.orderItemId || ''}&productId=${delivery.productId}`,
      });

      // Notify old operator if existed
      if (oldOperatorId) {
        await createNotification({
          userId: oldOperatorId,
          type: "delivery",
          title: "Package Reassigned",
          message: `Package for order #${orderId.toString().slice(-8)} has been reassigned to another operator.`,
          relatedEntity: {
            entityType: "delivery",
            entityId: delivery._id,
          },
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Warehouse operator reassigned successfully", delivery });
  } catch (error) {
    console.error("Error reassigning warehouse operator:", error);
    return res.status(500).json({ message: "Failed to reassign warehouse operator" });
  }
};

/**
 * Reject delivery assignment
 * Can be done by assigned user (delivery agency, deliverer, or warehouse operator)
 */
export const rejectDeliveryAssignment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderItemId, productId, rejectionReason, assignmentType } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    // Find delivery tracking
    let delivery;
    if (orderItemId || productId) {
      const query = { orderId };
      if (orderItemId) query.orderItemId = orderItemId;
      if (productId) query.productId = productId;
      delivery = await Delivery.findOne(query);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    } else {
      delivery = await Delivery.findOne({ orderId });
      if (!delivery) {
        return res.status(404).json({ message: "Delivery tracking not found" });
      }
    }

    // Verify user is assigned to this delivery based on assignment type
    let isAssigned = false;
    if (assignmentType === "agency" || userRole === "delivery_agency") {
      isAssigned = String(delivery.assignedDeliveryAgency) === String(userId);
    } else if (assignmentType === "deliverer" || userRole === "delivery_person") {
      isAssigned = String(delivery.assignedDeliveryPerson) === String(userId);
    } else if (assignmentType === "warehouse_operator" || userRole === "warehouse_operator") {
      isAssigned = String(delivery.assignedWarehouseOperator) === String(userId);
    }

    if (!isAssigned) {
      return res.status(403).json({ message: "Unauthorized. You can only reject assignments made to you." });
    }

    // Mark as rejected
    delivery.assignmentRejected = true;
    delivery.assignmentRejectedAt = new Date();
    delivery.assignmentRejectedBy = userId;
    delivery.assignmentRejectionReason = rejectionReason;

    // Clear assignment based on type
    if (assignmentType === "agency" || userRole === "delivery_agency") {
      delivery.assignedDeliveryAgency = null;
    } else if (assignmentType === "deliverer" || userRole === "delivery_person") {
      delivery.assignedDeliveryPerson = null;
    } else if (assignmentType === "warehouse_operator" || userRole === "warehouse_operator") {
      delivery.assignedWarehouseOperator = null;
    }

    delivery.statusHistory.push({
      status: delivery.status,
      timestamp: new Date(),
      note: `Assignment rejected by ${userRole}. Reason: ${rejectionReason}`,
      updatedBy: userId,
      updatedByRole: userRole,
    });

    await delivery.save();

    // Notify agency/admin
    const { createNotification } = await import("./notifications.js");
    try {
      if (delivery.assignedDeliveryAgency && String(delivery.assignedDeliveryAgency) !== String(userId)) {
        await createNotification({
          userId: delivery.assignedDeliveryAgency,
          type: "delivery",
          title: "Assignment Rejected",
          message: `Delivery assignment for order #${orderId.toString().slice(-8)} has been rejected. Reason: ${rejectionReason}`,
          relatedEntity: {
            entityType: "delivery",
            entityId: delivery._id,
          },
          actionUrl: `/user/delivery-agency?orderId=${orderId}&orderItemId=${delivery.orderItemId || ''}&productId=${delivery.productId}`,
        });
      }

      // Notify admin
      const adminUsers = await User.find({ role: "admin" });
      for (const admin of adminUsers) {
        await createNotification({
          userId: admin._id,
          type: "delivery",
          title: "Assignment Rejected",
          message: `Delivery assignment for order #${orderId.toString().slice(-8)} has been rejected. Reason: ${rejectionReason}`,
          relatedEntity: {
            entityType: "delivery",
            entityId: delivery._id,
          },
          actionUrl: `/user/admin`,
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Assignment rejected successfully", delivery });
  } catch (error) {
    console.error("Error rejecting delivery assignment:", error);
    return res.status(500).json({ message: "Failed to reject assignment" });
  }
};
