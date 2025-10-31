import Delivery from "../models/delivery.js";
import Order from "../models/order.js";
import User from "../models/user.js";

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

    // Only admin or delivery agency can assign to delivery person
    if (userRole !== "admin" && userRole !== "delivery_agency") {
      return res.status(403).json({ 
        message: "Only admins or delivery agencies can assign orders to delivery persons." 
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
      } else if (deliveryPerson.delivererType === "customer") {
        // Customer deliverer can only be assigned when status is in_facility
        if (currentStatus !== "in_facility") {
          return res.status(400).json({ 
            message: `Customer deliverer can only be assigned when status is 'in_facility'. Current status is '${currentStatus}' for item ${freshDelivery.orderItemId || freshDelivery.productId}. Please assign a warehouse deliverer first to move status to 'in_facility'.` 
          });
        }
      } else {
        return res.status(400).json({ 
          message: "Delivery person must have a valid deliverer type (warehouse or customer)" 
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
      
      delivery.assignedDeliveryPerson = deliveryPersonId;
      if (!delivery.assignedAt) {
        delivery.assignedAt = new Date();
      }
      delivery.statusHistory.push({
        status: delivery.status,
        timestamp: new Date(),
        note: `Assigned to delivery person: ${deliveryPerson.fullName || deliveryPerson.email}`,
        updatedBy: userId,
        updatedByRole: userRole,
      });
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
    const deliveryProof = req.file ? `/uploads/${req.file.filename}` : null;
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

    // Verify deliverer is customer type
    const User = (await import("../models/user.js")).default;
    const deliverer = await User.findById(userId);
    if (deliverer?.delivererType !== "customer") {
      return res.status(403).json({ 
        message: "Only customer deliverers can mark deliveries as delivered" 
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
      .populate("assignedDeliveryPerson", "fullName email phone")
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
 * Get delivery persons for an agency
 */
export const getAgencyPersons = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== "delivery_agency" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const agencyId = userRole === "admin" ? req.params.agencyId : userId;

    const deliveryPersons = await User.find({
      role: "delivery_person",
      deliveryAgencyId: agencyId,
    }).select("fullName email phone delivererType");

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

    if (!delivererType || !["warehouse", "customer"].includes(delivererType)) {
      return res.status(400).json({ 
        message: "Deliverer type is required and must be 'warehouse' or 'customer'" 
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
