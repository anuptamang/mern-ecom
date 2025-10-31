import Delivery from "../models/delivery.js";
import Order from "../models/order.js";
import User from "../models/user.js";

/**
 * Assign delivery to a delivery agency
 * Can be done by admin or seller (after picked_up status)
 */
export const assignToDeliveryAgency = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryAgencyId } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only admin or seller can assign to delivery agency
    if (userRole !== "admin" && userRole !== "seller") {
      return res.status(403).json({ 
        message: "Only admins or sellers can assign orders to delivery agencies." 
      });
    }

    // Verify delivery agency exists and has correct role
    const deliveryAgency = await User.findById(deliveryAgencyId);
    if (!deliveryAgency || deliveryAgency.role !== "delivery_agency") {
      return res.status(404).json({ message: "Delivery agency not found" });
    }

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ message: "Delivery tracking not found" });
    }

    // Only assign if status is ready_to_ship or picked_up
    if (delivery.status !== "ready_to_ship" && delivery.status !== "picked_up") {
      return res.status(400).json({ 
        message: "Can only assign to delivery agency when status is 'ready_to_ship' or 'picked_up'" 
      });
    }

    delivery.assignedDeliveryAgency = deliveryAgencyId;
    delivery.assignedAt = new Date();
    delivery.statusHistory.push({
      status: delivery.status,
      timestamp: new Date(),
      note: `Assigned to delivery agency: ${deliveryAgency.fullName || deliveryAgency.email}`,
      updatedBy: userId,
      updatedByRole: userRole,
    });

    await delivery.save();

    return res.json({ message: "Delivery assigned to agency successfully", delivery });
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
    const { deliveryPersonId } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only admin or delivery agency can assign to delivery person
    if (userRole !== "admin" && userRole !== "delivery_agency") {
      return res.status(403).json({ 
        message: "Only admins or delivery agencies can assign orders to delivery persons." 
      });
    }

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ message: "Delivery tracking not found" });
    }

    // If delivery agency is assigning, verify they own this delivery
    if (userRole === "delivery_agency" && String(delivery.assignedDeliveryAgency) !== String(userId)) {
      return res.status(403).json({ 
        message: "Unauthorized. You can only assign deliveries assigned to your agency." 
      });
    }

    // Verify delivery person exists and has correct role
    const deliveryPerson = await User.findById(deliveryPersonId);
    if (!deliveryPerson || deliveryPerson.role !== "delivery_person") {
      return res.status(404).json({ message: "Delivery person not found" });
    }

    // Verify delivery person belongs to the assigned agency
    if (delivery.assignedDeliveryAgency && String(deliveryPerson.deliveryAgencyId) !== String(delivery.assignedDeliveryAgency)) {
      return res.status(400).json({ 
        message: "Delivery person must belong to the assigned delivery agency." 
      });
    }

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

    return res.json({ message: "Delivery assigned to person successfully", delivery });
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
    const { note } = req.body;
    const deliveryProof = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== "delivery_person") {
      return res.status(403).json({ 
        message: "Only delivery persons can mark deliveries as delivered." 
      });
    }

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ message: "Delivery tracking not found" });
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

    delivery.status = "delivered";
    delivery.actualDeliveryDate = new Date();
    if (deliveryProof) {
      delivery.deliveryProof = deliveryProof;
    }
    delivery.buyerAcceptance = "pending"; // Awaiting buyer confirmation

    delivery.statusHistory.push({
      status: "delivered",
      timestamp: new Date(),
      note: note || "Package delivered",
      updatedBy: userId,
      updatedByRole: userRole,
    });

    await delivery.save();

    // Update order delivery status
    await Order.findByIdAndUpdate(orderId, { deliveryStatus: "delivered" });

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
    const userId = req.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify user owns the order
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized to accept this delivery" });
    }

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ message: "Delivery tracking not found" });
    }

    if (delivery.status !== "delivered") {
      return res.status(400).json({ message: "Order is not in delivered status" });
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
    const { reason } = req.body;
    const userId = req.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify user owns the order
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized to reject this delivery" });
    }

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({ message: "Delivery tracking not found" });
    }

    if (delivery.status !== "delivered") {
      return res.status(400).json({ message: "Order is not in delivered status" });
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
    }).select("fullName email phone");

    return res.json({ deliveryPersons, count: deliveryPersons.length });
  } catch (error) {
    console.error("Error fetching delivery persons:", error);
    return res.status(500).json({ message: "Failed to fetch delivery persons" });
  }
};
