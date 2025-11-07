import Return from "../models/return.js";
import Order from "../models/order.js";
import User from "../models/user.js";
import config from "../config/index.js";

/**
 * Get return requests for support team
 */
export const getSupportReturns = async (req, res) => {
  try {
    const userRole = req.userRole;
    
    // Only support, support_user, and admin can access
    if (userRole !== "support" && userRole !== "support_user" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Get all returns (support team sees all returns)
    const returns = await Return.find({})
      .populate("orderId")
      .populate("userId", "fullName email phone")
      .populate("assignedSupportUser", "fullName email")
      .populate("assignedDeliveryAgency", "fullName email")
      .sort({ createdAt: -1 });
    
    return res.json({ returns, count: returns.length });
  } catch (error) {
    console.error("Error fetching support returns:", error);
    return res.status(500).json({ message: "Failed to fetch support returns" });
  }
};

/**
 * Get return assignments for delivery agency
 */
export const getAgencyReturns = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Only delivery agency or admin can access
    if (userRole !== "delivery_agency" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Get returns assigned to this agency
    const returns = await Return.find({
      assignedDeliveryAgency: userId,
    })
      .populate("orderId")
      .populate("userId", "fullName email phone")
      .populate("assignedReturnDeliverer", "fullName email phone delivererType")
      .populate("assignedSupportUser", "fullName email")
      .populate("statusHistory.changedBy", "fullName email")
      .sort({ createdAt: -1 });
    
    return res.json({ returns, count: returns.length });
  } catch (error) {
    console.error("Error fetching agency returns:", error);
    return res.status(500).json({ message: "Failed to fetch agency returns" });
  }
};

/**
 * Get return assignments for return deliverer
 */
export const getReturnDelivererReturns = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Only delivery_person with customer_return type or admin can access
    if (userRole !== "delivery_person" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Verify user is a return deliverer
    if (userRole === "delivery_person") {
      const deliverer = await User.findById(userId);
      if (!deliverer || deliverer.delivererType !== "customer_return") {
        return res.status(403).json({ message: "Unauthorized. Only customer_return deliverers can access this endpoint" });
      }
    }
    
    // Get returns assigned to this return deliverer - show all returns they were assigned to (for history tracking)
    const returns = await Return.find({
      assignedReturnDeliverer: userId,
    })
      .populate("orderId")
      .populate("userId", "fullName email phone")
      .populate("assignedDeliveryAgency", "fullName email")
      .populate("assignedSupportUser", "fullName email")
      .populate("statusHistory.changedBy", "fullName email")
      .sort({ createdAt: -1 });
    
    return res.json({ returns, count: returns.length });
  } catch (error) {
    console.error("Error fetching return deliverer returns:", error);
    return res.status(500).json({ message: "Failed to fetch return deliverer returns" });
  }
};

/**
 * Get return assignments for verification team
 */
export const getVerificationTeamReturns = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Only verification_team or admin can access
    if (userRole !== "verification_team" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Get returns assigned to this verification team - show all returns they were assigned to (for history tracking)
    const returns = await Return.find({
      assignedVerificationTeam: userId,
    })
      .populate("orderId")
      .populate("userId", "fullName email phone")
      .populate("assignedInspector", "fullName email")
      .populate("assignedSupportUser", "fullName email")
      .populate("statusHistory.changedBy", "fullName email")
      .sort({ createdAt: -1 });
    
    return res.json({ returns, count: returns.length });
  } catch (error) {
    console.error("Error fetching verification team returns:", error);
    return res.status(500).json({ message: "Failed to fetch verification team returns" });
  }
};

/**
 * Get return assignments for inspector
 */
export const getInspectorReturns = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Only return_inspector or admin can access
    if (userRole !== "return_inspector" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Get returns assigned to this inspector - show all returns they were assigned to (for history tracking)
    const returns = await Return.find({
      assignedInspector: userId,
    })
      .populate("orderId")
      .populate("userId", "fullName email phone")
      .populate("assignedVerificationTeam", "fullName email")
      .populate("assignedSupportUser", "fullName email")
      .populate("statusHistory.changedBy", "fullName email")
      .sort({ createdAt: -1 });
    
    return res.json({ returns, count: returns.length });
  } catch (error) {
    console.error("Error fetching inspector returns:", error);
    return res.status(500).json({ message: "Failed to fetch inspector returns" });
  }
};

/**
 * Get return assignments for finance
 */
export const getFinanceReturns = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Only finance or admin can access
    if (userRole !== "finance" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Get returns assigned to this finance user - show all returns they were assigned to (for history tracking)
    const returns = await Return.find({
      assignedFinance: userId,
    })
      .populate("orderId")
      .populate("userId", "fullName email phone")
      .populate("assignedSupportUser", "fullName email")
      .populate("statusHistory.changedBy", "fullName email")
      .sort({ createdAt: -1 });
    
    return res.json({ returns, count: returns.length });
  } catch (error) {
    console.error("Error fetching finance returns:", error);
    return res.status(500).json({ message: "Failed to fetch finance returns" });
  }
};

/**
 * Assign support user to return request
 */
export const assignSupportUser = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { supportUserId } = req.body;
    const assignedBy = req.userId;
    const userRole = req.userRole;
    
    // Only support team can assign support users
    if (userRole !== "support" && userRole !== "support_user" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify support user exists and has correct role
    const supportUser = await User.findById(supportUserId);
    if (!supportUser || (supportUser.role !== "support_user" && supportUser.role !== "support")) {
      return res.status(400).json({ message: "Invalid support user" });
    }
    
    if (returnRequest.returnStatus !== "pending" && returnRequest.returnStatus !== "assigned_support") {
      return res.status(400).json({ 
        message: `Cannot assign support user. Current status: ${returnRequest.returnStatus}` 
      });
    }
    
    returnRequest.assignedSupportUser = supportUserId;
    returnRequest.returnStatus = "assigned_support";
    returnRequest.statusHistory.push({
      status: "assigned_support",
      timestamp: new Date(),
      note: `Assigned to support user: ${supportUser.fullName || supportUser.email}`,
      changedBy: assignedBy,
    });
    
    await returnRequest.save();
    
    // Notify assigned support user
    try {
      const { createNotification } = await import("./notifications.js");
      await createNotification({
        userId: supportUserId,
        type: "return",
        title: "Return Request Assigned",
        message: `You have been assigned to handle return request #${returnId.toString().slice(-8)}`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/support?returnId=${returnRequest._id}`,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
    
    return res.json({ 
      message: "Support user assigned successfully", 
      returnRequest 
    });
  } catch (error) {
    console.error("Error assigning support user:", error);
    return res.status(500).json({ message: "Failed to assign support user" });
  }
};

/**
 * Assign delivery agency for return pickup
 */
export const assignReturnDeliveryAgency = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { agencyId } = req.body;
    const assignedBy = req.userId;
    const userRole = req.userRole;
    
    // Only support_user or admin can assign agency (support team cannot assign agency)
    if (userRole !== "support_user" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized. Only support_user or admin can assign delivery agency" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify agency exists
    const agency = await User.findById(agencyId);
    if (!agency || agency.role !== "delivery_agency") {
      return res.status(400).json({ message: "Invalid delivery agency" });
    }
    
    if (returnRequest.returnStatus !== "assigned_support") {
      return res.status(400).json({ 
        message: `Cannot assign agency. Current status: ${returnRequest.returnStatus}` 
      });
    }
    
    returnRequest.assignedDeliveryAgency = agencyId;
    returnRequest.returnStatus = "assigned_agency";
    returnRequest.statusHistory.push({
      status: "assigned_agency",
      timestamp: new Date(),
      note: `Assigned to delivery agency: ${agency.fullName || agency.email} for return pickup`,
      changedBy: assignedBy,
    });
    
    await returnRequest.save();
    
    // Notify delivery agency
    try {
      const { createNotification } = await import("./notifications.js");
      await createNotification({
        userId: agencyId,
        type: "return",
        title: "Return Delivery Assigned",
        message: `You have been assigned to pick up return for order #${returnRequest.orderId.toString().slice(-8)}`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/delivery-agency?returnId=${returnRequest._id}`,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
    
    return res.json({ 
      message: "Delivery agency assigned successfully", 
      returnRequest 
    });
  } catch (error) {
    console.error("Error assigning delivery agency:", error);
    return res.status(500).json({ message: "Failed to assign delivery agency" });
  }
};

/**
 * Assign return deliverer
 */
export const assignReturnDeliverer = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { delivererId } = req.body;
    const assignedBy = req.userId;
    const userRole = req.userRole;
    
    // Only delivery_agency or admin can assign deliverer
    if (userRole !== "delivery_agency" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify agency owns this assignment
    if (String(returnRequest.assignedDeliveryAgency) !== String(assignedBy) && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to assign deliverer for this return" });
    }
    
    // Verify deliverer exists and is customer_return type
    const deliverer = await User.findById(delivererId);
    if (!deliverer || deliverer.role !== "delivery_person" || deliverer.delivererType !== "customer_return") {
      return res.status(400).json({ message: "Invalid return deliverer. Must be a delivery person with customer_return type" });
    }
    
    // Verify deliverer belongs to the agency
    if (String(deliverer.deliveryAgencyId) !== String(assignedBy) && userRole !== "admin") {
      return res.status(403).json({ message: "Deliverer must belong to your agency" });
    }
    
    if (returnRequest.returnStatus !== "assigned_agency" && returnRequest.returnStatus !== "re_delivery") {
      return res.status(400).json({ 
        message: `Cannot assign deliverer. Current status: ${returnRequest.returnStatus}` 
      });
    }
    
    returnRequest.assignedReturnDeliverer = delivererId;
    if (returnRequest.returnStatus === "assigned_agency") {
      returnRequest.returnStatus = "assigned_deliverer";
    } else if (returnRequest.returnStatus === "re_delivery") {
      // For re-delivery flow, status remains re_delivery until deliverer picks up from support
      // Don't change status here - it will change when deliverer picks up
    }
    returnRequest.statusHistory.push({
      status: returnRequest.returnStatus,
      timestamp: new Date(),
      note: returnRequest.returnStatus === "re_delivery" 
        ? `Assigned return deliverer for re-delivery: ${deliverer.fullName || deliverer.email}. Pick up from support and deliver to buyer.`
        : `Assigned return deliverer: ${deliverer.fullName || deliverer.email}`,
      changedBy: assignedBy,
    });
    
    await returnRequest.save();
    
    // Notify return deliverer with detailed information
    try {
      const { createNotification } = await import("./notifications.js");
      // Populate orderId and userId to get details for notification
      await returnRequest.populate([
        { path: "orderId", select: "_id deliveryAddress" },
        { path: "userId", select: "fullName email phone" }
      ]);
      
      const orderIdStr = returnRequest.orderId?._id ? returnRequest.orderId._id.toString().slice(-8) : "N/A";
      const customerName = returnRequest.userId?.fullName || returnRequest.userId?.email || "Customer";
      const customerPhone = returnRequest.userId?.phone || "N/A";
      const deliveryAddress = returnRequest.orderId?.deliveryAddress;
      let addressStr = "";
      if (deliveryAddress) {
        addressStr = `${deliveryAddress.street || ""}, ${deliveryAddress.city || ""}, ${deliveryAddress.state || ""} ${deliveryAddress.zipCode || ""}`.trim();
      }
      
      const message = `Pick up return package from ${customerName} (${customerPhone})${addressStr ? ` at ${addressStr}` : ""}. Order #${orderIdStr}, Return ID: ${returnRequest._id.toString().slice(-8)}. Amount: $${((returnRequest.returnAmount || 0) / 100).toFixed(2)}`;
      
      await createNotification({
        userId: delivererId,
        type: "return",
        title: "Return Pickup Assigned",
        message: message,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/return-deliverer?returnId=${returnRequest._id}`,
        metadata: {
          returnId: returnRequest._id.toString(),
          orderId: returnRequest.orderId?._id?.toString() || returnRequest.orderId?.toString(),
          returnAmount: returnRequest.returnAmount,
          customerName: customerName,
          customerPhone: customerPhone,
          deliveryAddress: deliveryAddress,
        },
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
    
    return res.json({ 
      message: "Return deliverer assigned successfully", 
      returnRequest 
    });
  } catch (error) {
    console.error("Error assigning return deliverer:", error);
    return res.status(500).json({ message: "Failed to assign return deliverer" });
  }
};

/**
 * Mark return as picked up by return deliverer
 */
export const markReturnPickedUp = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { note } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Only customer_return deliverers can mark as picked up
    if (userRole !== "delivery_person") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify deliverer is assigned and is customer_return type
    const deliverer = await User.findById(userId);
    if (!deliverer || deliverer.delivererType !== "customer_return") {
      return res.status(403).json({ message: "Only customer return deliverers can mark returns as picked up" });
    }
    
    if (String(returnRequest.assignedReturnDeliverer) !== String(userId)) {
      return res.status(403).json({ message: "You are not assigned to this return" });
    }
    
    // Allow pickup for both initial return (assigned_deliverer) and re-delivery (re_delivery)
    if (returnRequest.returnStatus !== "assigned_deliverer" && returnRequest.returnStatus !== "re_delivery") {
      return res.status(400).json({ 
        message: `Cannot mark as picked up. Current status: ${returnRequest.returnStatus}` 
      });
    }
    
    // Get pickup proof from uploaded file
    const pickupProof = req.file ? `${config.upload.imageBucketUrl}/${req.file.filename}` : null;
    
    // Determine pickup context
    const isReDelivery = returnRequest.returnStatus === "re_delivery";
    const pickupNote = note || (
      isReDelivery 
        ? `Return package picked up from support by ${deliverer.fullName || deliverer.email} for re-delivery to buyer`
        : `Return package picked up from buyer by ${deliverer.fullName || deliverer.email}`
    );
    
    returnRequest.returnStatus = "picked_up";
    returnRequest.pickedUpAt = new Date();
    returnRequest.pickedUpBy = userId;
    if (pickupProof) returnRequest.pickupProof = pickupProof;
    returnRequest.statusHistory.push({
      status: "picked_up",
      timestamp: new Date(),
      note: pickupNote,
      changedBy: userId,
    });
    
    await returnRequest.save();
    
    // Notify support user
    if (returnRequest.assignedSupportUser) {
      try {
        const { createNotification } = await import("./notifications.js");
        await createNotification({
          userId: returnRequest.assignedSupportUser,
          type: "return",
          title: "Return Picked Up",
          message: `Return package has been picked up for order #${returnRequest.orderId.toString().slice(-8)}`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
          actionUrl: `/user/support?returnId=${returnRequest._id}`,
        });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
    }
    
    return res.json({ 
      message: "Return marked as picked up successfully", 
      returnRequest 
    });
  } catch (error) {
    console.error("Error marking return as picked up:", error);
    return res.status(500).json({ message: "Failed to mark return as picked up" });
  }
};

/**
 * Mark return as delivered to buyer (for re-delivery flow)
 */
export const markReturnDelivered = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { note } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Only customer_return deliverers can mark as delivered
    if (userRole !== "delivery_person") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify deliverer is assigned and is customer_return type
    const deliverer = await User.findById(userId);
    if (!deliverer || deliverer.delivererType !== "customer_return") {
      return res.status(403).json({ message: "Only customer return deliverers can mark returns as delivered" });
    }
    
    if (String(returnRequest.assignedReturnDeliverer) !== String(userId)) {
      return res.status(403).json({ message: "You are not assigned to this return" });
    }
    
    // Only allow marking as delivered if status is picked_up (after picking up from support for re-delivery)
    if (returnRequest.returnStatus !== "picked_up") {
      return res.status(400).json({ 
        message: `Cannot mark as delivered. Current status: ${returnRequest.returnStatus}. Package must be picked up first.` 
      });
    }
    
    // Check if this is a re-delivery (was originally rejected)
    // A return can be marked as delivered if:
    // 1. It was rejected during inspection (inspectionResult === "rejected"), OR
    // 2. The return has inspectionRejectionReason set (indicating it was rejected)
    const wasRejected = returnRequest.inspectionResult === "rejected" || returnRequest.inspectionRejectionReason;
    
    if (!wasRejected) {
      return res.status(400).json({ 
        message: "This endpoint is only for re-delivery of rejected returns. Use 'submit-to-support' for regular returns." 
      });
    }
    
    returnRequest.returnStatus = "completed";
    returnRequest.statusHistory.push({
      status: "completed",
      timestamp: new Date(),
      note: note || `Return package delivered to buyer by ${deliverer.fullName || deliverer.email}. Re-delivery completed.`,
      changedBy: userId,
    });
    
    await returnRequest.save();
    
    // Notify buyer
    try {
      const { createNotification } = await import("./notifications.js");
      await createNotification({
        userId: returnRequest.userId,
        type: "return",
        title: "Rejected Return Delivered",
        message: `Your rejected return package has been re-delivered to you. The return request has been completed.`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/returns?returnId=${returnRequest._id}`,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
    
    return res.json({ 
      message: "Return marked as delivered successfully", 
      returnRequest 
    });
  } catch (error) {
    console.error("Error marking return as delivered:", error);
    return res.status(500).json({ message: "Failed to mark return as delivered" });
  }
};

/**
 * Submit return package to support team (after pickup)
 */
export const submitToSupport = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { note } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Only customer_return deliverers can submit to support
    if (userRole !== "delivery_person") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify deliverer is assigned and is customer_return type
    const deliverer = await User.findById(userId);
    if (!deliverer || deliverer.delivererType !== "customer_return") {
      return res.status(403).json({ message: "Only customer return deliverers can submit returns to support" });
    }
    
    if (String(returnRequest.assignedReturnDeliverer) !== String(userId)) {
      return res.status(403).json({ message: "You are not assigned to this return" });
    }
    
    if (returnRequest.returnStatus !== "picked_up") {
      return res.status(400).json({ 
        message: `Cannot submit to support. Current status: ${returnRequest.returnStatus}` 
      });
    }
    
    returnRequest.returnStatus = "submitted_to_support";
    returnRequest.statusHistory.push({
      status: "submitted_to_support",
      timestamp: new Date(),
      note: note || `Return package submitted to support team by ${deliverer.fullName || deliverer.email}`,
      changedBy: userId,
    });
    
    await returnRequest.save();
    
    // Notify support user
    if (returnRequest.assignedSupportUser) {
      try {
        const { createNotification } = await import("./notifications.js");
        await returnRequest.populate("orderId", "_id");
        const orderIdStr = returnRequest.orderId?._id ? returnRequest.orderId._id.toString().slice(-8) : "N/A";
        await createNotification({
          userId: returnRequest.assignedSupportUser,
          type: "return",
          title: "Return Package Submitted",
          message: `Return package has been submitted to support for order #${orderIdStr}. You can now assign verification team.`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
          actionUrl: `/user/support?returnId=${returnRequest._id}`,
        });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
    }
    
    return res.json({ 
      message: "Return submitted to support successfully", 
      returnRequest 
    });
  } catch (error) {
    console.error("Error submitting return to support:", error);
    return res.status(500).json({ message: "Failed to submit return to support" });
  }
};

/**
 * Assign verification team
 */
export const assignVerificationTeam = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { verificationTeamId } = req.body;
    const assignedBy = req.userId;
    const userRole = req.userRole;
    
    // Only support_user or admin can assign verification team
    if (userRole !== "support_user" && userRole !== "support" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify verification team exists
    const verificationTeam = await User.findById(verificationTeamId);
    if (!verificationTeam || verificationTeam.role !== "verification_team") {
      return res.status(400).json({ message: "Invalid verification team" });
    }
    
    if (returnRequest.returnStatus !== "submitted_to_support") {
      return res.status(400).json({ 
        message: `Cannot assign verification team. Current status: ${returnRequest.returnStatus}. Return must be submitted to support first.` 
      });
    }
    
    returnRequest.assignedVerificationTeam = verificationTeamId;
    returnRequest.returnStatus = "in_inspection";
    returnRequest.statusHistory.push({
      status: "in_inspection",
      timestamp: new Date(),
      note: `Assigned to verification team: ${verificationTeam.fullName || verificationTeam.email}`,
      changedBy: assignedBy,
    });
    
    await returnRequest.save();
    
    // Notify verification team
    try {
      const { createNotification } = await import("./notifications.js");
      await createNotification({
        userId: verificationTeamId,
        type: "return",
        title: "Return Inspection Assigned",
        message: `Inspect return package for order #${returnRequest.orderId.toString().slice(-8)}`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/verification?returnId=${returnRequest._id}`,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
    
    return res.json({ 
      message: "Verification team assigned successfully", 
      returnRequest 
    });
  } catch (error) {
    console.error("Error assigning verification team:", error);
    return res.status(500).json({ message: "Failed to assign verification team" });
  }
};

/**
 * Assign return inspector
 */
export const assignReturnInspector = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { inspectorId } = req.body;
    const assignedBy = req.userId;
    const userRole = req.userRole;
    
    // Only verification_team or admin can assign inspector
    if (userRole !== "verification_team" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify inspector exists
    const inspector = await User.findById(inspectorId);
    if (!inspector || inspector.role !== "return_inspector") {
      return res.status(400).json({ message: "Invalid inspector" });
    }
    
    // Verify verification team owns this assignment
    if (String(returnRequest.assignedVerificationTeam) !== String(assignedBy) && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to assign inspector for this return" });
    }
    
    if (returnRequest.returnStatus !== "in_inspection") {
      return res.status(400).json({ 
        message: `Cannot assign inspector. Current status: ${returnRequest.returnStatus}` 
      });
    }
    
    returnRequest.assignedInspector = inspectorId;
    returnRequest.returnStatus = "inspector_assigned";
    returnRequest.statusHistory.push({
      status: "inspector_assigned",
      timestamp: new Date(),
      note: `Assigned to inspector: ${inspector.fullName || inspector.email}`,
      changedBy: assignedBy,
    });
    
    await returnRequest.save();
    
    // Notify inspector
    try {
      const { createNotification } = await import("./notifications.js");
      await createNotification({
        userId: inspectorId,
        type: "return",
        title: "Return Inspection Assigned",
        message: `Inspect return package for order #${returnRequest.orderId.toString().slice(-8)}`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/inspector?returnId=${returnRequest._id}`,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
    
    return res.json({ 
      message: "Inspector assigned successfully", 
      returnRequest 
    });
  } catch (error) {
    console.error("Error assigning inspector:", error);
    return res.status(500).json({ message: "Failed to assign inspector" });
  }
};

/**
 * Inspect return (accept or reject)
 */
export const inspectReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { result, note, rejectionReason } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Only return_inspector can inspect
    if (userRole !== "return_inspector" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify inspector is assigned
    if (String(returnRequest.assignedInspector) !== String(userId) && userRole !== "admin") {
      return res.status(403).json({ message: "You are not assigned to inspect this return" });
    }
    
    if (returnRequest.returnStatus !== "inspector_assigned") {
      return res.status(400).json({ 
        message: `Cannot inspect. Current status: ${returnRequest.returnStatus}` 
      });
    }
    
    if (!result || !["accepted", "rejected"].includes(result)) {
      return res.status(400).json({ message: "Result must be 'accepted' or 'rejected'" });
    }
    
    returnRequest.inspectionResult = result;
    returnRequest.inspectionDate = new Date();
    if (note) returnRequest.inspectionNote = note;
    if (rejectionReason) returnRequest.inspectionRejectionReason = rejectionReason;
    
    if (result === "accepted") {
      returnRequest.returnStatus = "inspection_accepted";
      returnRequest.statusHistory.push({
        status: "inspection_accepted",
        timestamp: new Date(),
        note: note || "Return accepted by inspector",
        changedBy: userId,
      });
    } else {
      returnRequest.returnStatus = "inspection_rejected";
      returnRequest.statusHistory.push({
        status: "inspection_rejected",
        timestamp: new Date(),
        note: rejectionReason || note || "Return rejected by inspector",
        changedBy: userId,
      });
      
      // Notify buyer of rejection
      try {
        const { createNotification } = await import("./notifications.js");
        await createNotification({
          userId: returnRequest.userId,
          type: "return",
          title: "Return Rejected",
          message: `Your return request has been rejected. Reason: ${rejectionReason || "Item condition does not meet return criteria"}`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
          actionUrl: `/user/returns?returnId=${returnRequest._id}`,
        });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
    }
    
    await returnRequest.save();
    
    // Notify support user
    if (returnRequest.assignedSupportUser) {
      try {
        const { createNotification } = await import("./notifications.js");
        await createNotification({
          userId: returnRequest.assignedSupportUser,
          type: "return",
          title: `Return ${result === "accepted" ? "Accepted" : "Rejected"}`,
          message: `Return inspection ${result} for order #${returnRequest.orderId.toString().slice(-8)}`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
          actionUrl: `/user/support?returnId=${returnRequest._id}`,
        });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
    }
    
    return res.json({ 
      message: `Return ${result} successfully`, 
      returnRequest 
    });
  } catch (error) {
    console.error("Error inspecting return:", error);
    return res.status(500).json({ message: "Failed to inspect return" });
  }
};

/**
 * Assign finance team
 */
export const assignFinance = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { financeId } = req.body;
    const assignedBy = req.userId;
    const userRole = req.userRole;
    
    // Only support_user or admin can assign finance
    if (userRole !== "support_user" && userRole !== "support" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify finance user exists
    const finance = await User.findById(financeId);
    if (!finance || finance.role !== "finance") {
      return res.status(400).json({ message: "Invalid finance user" });
    }
    
    if (returnRequest.returnStatus !== "inspection_accepted") {
      return res.status(400).json({ 
        message: `Cannot assign finance. Current status: ${returnRequest.returnStatus}` 
      });
    }
    
    returnRequest.assignedFinance = financeId;
    returnRequest.returnStatus = "refund_processing";
    returnRequest.statusHistory.push({
      status: "refund_processing",
      timestamp: new Date(),
      note: `Assigned to finance: ${finance.fullName || finance.email} for refund processing`,
      changedBy: assignedBy,
    });
    
    await returnRequest.save();
    
    // Notify finance team
    try {
      const { createNotification } = await import("./notifications.js");
      await createNotification({
        userId: financeId,
        type: "return",
        title: "Refund Processing Assigned",
        message: `Process refund for return order #${returnRequest.orderId.toString().slice(-8)}`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/finance?returnId=${returnRequest._id}`,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
    
    return res.json({ 
      message: "Finance team assigned successfully", 
      returnRequest 
    });
  } catch (error) {
    console.error("Error assigning finance:", error);
    return res.status(500).json({ message: "Failed to assign finance team" });
  }
};

/**
 * Process refund
 */
export const processRefund = async (req, res) => {
  try {
    const { returnId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Only finance can process refund
    if (userRole !== "finance" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Verify finance user is assigned
    if (String(returnRequest.assignedFinance) !== String(userId) && userRole !== "admin") {
      return res.status(403).json({ message: "You are not assigned to process this refund" });
    }
    
    if (returnRequest.returnStatus !== "refund_processing") {
      return res.status(400).json({ 
        message: `Cannot process refund. Current status: ${returnRequest.returnStatus}` 
      });
    }
    
    const order = await Order.findById(returnRequest.orderId);
    if (!order || !order.paymentIntentId) {
      return res.status(400).json({ message: "Order payment intent not found" });
    }
    
    // Process refund via Stripe
    try {
      const stripe = (await import("stripe")).default;
      const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
      
      const refund = await stripeInstance.refunds.create({
        payment_intent: order.paymentIntentId,
        amount: returnRequest.returnAmount, // Amount in cents
        reason: "requested_by_customer",
      });
      
      returnRequest.refundId = refund.id;
      returnRequest.refundStatus = refund.status;
      returnRequest.refundAmount = refund.amount;
      returnRequest.refundCreatedAt = new Date(refund.created * 1000);
      
      if (refund.status === "succeeded") {
        returnRequest.returnStatus = "refunded";
        returnRequest.refundCompletedAt = new Date();
        returnRequest.statusHistory.push({
          status: "refunded",
          timestamp: new Date(),
          note: `Refund processed successfully. Stripe refund ID: ${refund.id}`,
          changedBy: userId,
        });
        
        // Notify buyer
        try {
          const { createNotification } = await import("./notifications.js");
          await createNotification({
            userId: returnRequest.userId,
            type: "return",
            title: "Refund Processed",
            message: `Your refund of $${(returnRequest.returnAmount / 100).toFixed(2)} has been processed successfully.`,
            relatedEntity: {
              entityType: "return",
              entityId: returnRequest._id,
            },
            actionUrl: `/user/returns?returnId=${returnRequest._id}`,
          });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      } else {
        returnRequest.statusHistory.push({
          status: "refund_processing",
          timestamp: new Date(),
          note: `Refund initiated. Stripe refund ID: ${refund.id}. Status: ${refund.status}`,
          changedBy: userId,
        });
      }
      
      await returnRequest.save();
      
      return res.json({ 
        message: "Refund processed successfully", 
        returnRequest,
        refund 
      });
    } catch (stripeError) {
      console.error("Stripe refund error:", stripeError);
      returnRequest.refundStatus = "failed";
      returnRequest.refundFailureReason = stripeError.message || "Stripe refund failed";
      returnRequest.statusHistory.push({
        status: "refund_processing",
        timestamp: new Date(),
        note: `Refund failed: ${stripeError.message}`,
        changedBy: userId,
      });
      await returnRequest.save();
      
      return res.status(500).json({ 
        message: "Failed to process refund via Stripe", 
        error: stripeError.message 
      });
    }
  } catch (error) {
    console.error("Error processing refund:", error);
    return res.status(500).json({ message: "Failed to process refund" });
  }
};

/**
 * Assign delivery agency for re-delivery (after rejection)
 */
export const assignRedeliveryAgency = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { agencyId } = req.body;
    const assignedBy = req.userId;
    const userRole = req.userRole;
    
    // Only support_user or admin can assign for re-delivery (support team cannot assign agency)
    if (userRole !== "support_user" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized. Only support_user or admin can assign delivery agency" });
    }
    
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    if (returnRequest.returnStatus !== "inspection_rejected") {
      return res.status(400).json({ 
        message: `Cannot assign re-delivery. Current status: ${returnRequest.returnStatus}` 
      });
    }
    
    // Verify agency exists
    const agency = await User.findById(agencyId);
    if (!agency || agency.role !== "delivery_agency") {
      return res.status(400).json({ message: "Invalid delivery agency" });
    }
    
    returnRequest.assignedDeliveryAgency = agencyId;
    returnRequest.returnStatus = "re_delivery";
    returnRequest.statusHistory.push({
      status: "re_delivery",
      timestamp: new Date(),
      note: `Assigned to delivery agency: ${agency.fullName || agency.email} for re-delivery to buyer`,
      changedBy: assignedBy,
    });
    
    await returnRequest.save();
    
    // Notify delivery agency
    try {
      const { createNotification } = await import("./notifications.js");
      await createNotification({
        userId: agencyId,
        type: "return",
        title: "Re-delivery Assigned",
        message: `Re-deliver package to buyer for order #${returnRequest.orderId.toString().slice(-8)}`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/delivery-agency?returnId=${returnRequest._id}`,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
    
    return res.json({ 
      message: "Re-delivery agency assigned successfully", 
      returnRequest 
    });
  } catch (error) {
    console.error("Error assigning re-delivery agency:", error);
    return res.status(500).json({ message: "Failed to assign re-delivery agency" });
  }
};

/**
 * Reassign return support user
 * Can be done by support admin or admin
 */
export const reassignSupportUser = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { newSupportUserId, reason } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only support or admin can reassign support user
    if (userRole !== "support" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to reassign support user" });
    }

    // Verify new support user exists
    const newSupportUser = await User.findById(newSupportUserId);
    if (!newSupportUser || newSupportUser.role !== "support_user") {
      return res.status(404).json({ message: "Support user not found" });
    }

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Store previous assignment
    if (returnRequest.assignedSupportUser) {
      returnRequest.previousAssignments.push({
        assignmentType: "support",
        assignedTo: returnRequest.assignedSupportUser,
        assignedAt: returnRequest.statusHistory.find(h => h.status === "assigned_support")?.timestamp || returnRequest.createdAt,
        reassignedAt: new Date(),
        reassignedBy: userId,
        reassignmentReason: reason || "Reassigned",
      });
    }

    // Reassign
    const oldSupportUserId = returnRequest.assignedSupportUser;
    returnRequest.assignedSupportUser = newSupportUserId;
    returnRequest.assignmentRejected = false;

    returnRequest.statusHistory.push({
      status: returnRequest.returnStatus,
      timestamp: new Date(),
      note: `Support user reassigned from ${oldSupportUserId ? 'previous user' : 'none'} to ${newSupportUser.fullName || newSupportUser.email}${reason ? `. Reason: ${reason}` : ''}`,
      changedBy: userId,
    });

    await returnRequest.save();

    // Notify new support user
    const { createNotification } = await import("./notifications.js");
    try {
      await createNotification({
        userId: newSupportUserId,
        type: "return",
        title: "Return Request Assigned",
        message: `Return request #${returnId.toString().slice(-8)} has been assigned to you.`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/support?returnId=${returnId}`,
      });

      // Notify old support user if existed
      if (oldSupportUserId) {
        await createNotification({
          userId: oldSupportUserId,
          type: "return",
          title: "Return Request Reassigned",
          message: `Return request #${returnId.toString().slice(-8)} has been reassigned to another support user.`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Support user reassigned successfully", returnRequest });
  } catch (error) {
    console.error("Error reassigning support user:", error);
    return res.status(500).json({ message: "Failed to reassign support user" });
  }
};

/**
 * Reassign return delivery agency
 * Can be done by support_user or admin
 */
export const reassignReturnDeliveryAgency = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { newAgencyId, reason } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only support_user or admin can reassign delivery agency
    if (userRole !== "support_user" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to reassign delivery agency" });
    }

    // Verify new agency exists
    const newAgency = await User.findById(newAgencyId);
    if (!newAgency || newAgency.role !== "delivery_agency") {
      return res.status(404).json({ message: "Delivery agency not found" });
    }

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Store previous assignment
    if (returnRequest.assignedDeliveryAgency) {
      returnRequest.previousAssignments.push({
        assignmentType: "agency",
        assignedTo: returnRequest.assignedDeliveryAgency,
        assignedAt: returnRequest.statusHistory.find(h => h.status === "assigned_agency" || h.status === "re_delivery")?.timestamp || returnRequest.createdAt,
        reassignedAt: new Date(),
        reassignedBy: userId,
        reassignmentReason: reason || "Reassigned",
      });
    }

    // Reassign
    const oldAgencyId = returnRequest.assignedDeliveryAgency;
    returnRequest.assignedDeliveryAgency = newAgencyId;
    returnRequest.assignmentRejected = false;

    returnRequest.statusHistory.push({
      status: returnRequest.returnStatus,
      timestamp: new Date(),
      note: `Delivery agency reassigned from ${oldAgencyId ? 'previous agency' : 'none'} to ${newAgency.fullName || newAgency.email}${reason ? `. Reason: ${reason}` : ''}`,
      changedBy: userId,
    });

    await returnRequest.save();

    // Notify new agency
    const { createNotification } = await import("./notifications.js");
    try {
      await createNotification({
        userId: newAgencyId,
        type: "return",
        title: "Return Request Assigned",
        message: `Return request #${returnId.toString().slice(-8)} has been assigned to your agency.`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/delivery-agency?returnId=${returnId}`,
      });

      // Notify old agency if existed
      if (oldAgencyId) {
        await createNotification({
          userId: oldAgencyId,
          type: "return",
          title: "Return Request Reassigned",
          message: `Return request #${returnId.toString().slice(-8)} has been reassigned to another agency.`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Delivery agency reassigned successfully", returnRequest });
  } catch (error) {
    console.error("Error reassigning delivery agency:", error);
    return res.status(500).json({ message: "Failed to reassign delivery agency" });
  }
};

/**
 * Reassign return deliverer
 * Can be done by delivery agency or admin
 */
export const reassignReturnDeliverer = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { newDelivererId, reason } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only delivery_agency or admin can reassign return deliverer
    if (userRole !== "delivery_agency" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to reassign return deliverer" });
    }

    // Verify new deliverer exists
    const newDeliverer = await User.findById(newDelivererId);
    if (!newDeliverer || newDeliverer.role !== "delivery_person" || newDeliverer.delivererType !== "customer_return") {
      return res.status(404).json({ message: "Return deliverer not found" });
    }

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Verify authorization
    if (userRole === "delivery_agency" && String(returnRequest.assignedDeliveryAgency) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized. You can only reassign returns assigned to your agency." });
    }

    // Store previous assignment
    if (returnRequest.assignedReturnDeliverer) {
      returnRequest.previousAssignments.push({
        assignmentType: "deliverer",
        assignedTo: returnRequest.assignedReturnDeliverer,
        assignedAt: returnRequest.statusHistory.find(h => h.status === "assigned_deliverer")?.timestamp || returnRequest.createdAt,
        reassignedAt: new Date(),
        reassignedBy: userId,
        reassignmentReason: reason || "Reassigned",
      });
    }

    // Reassign
    const oldDelivererId = returnRequest.assignedReturnDeliverer;
    returnRequest.assignedReturnDeliverer = newDelivererId;
    returnRequest.assignmentRejected = false;

    returnRequest.statusHistory.push({
      status: returnRequest.returnStatus,
      timestamp: new Date(),
      note: `Return deliverer reassigned from ${oldDelivererId ? 'previous deliverer' : 'none'} to ${newDeliverer.fullName || newDeliverer.email}${reason ? `. Reason: ${reason}` : ''}`,
      changedBy: userId,
    });

    await returnRequest.save();

    // Notify new deliverer
    const { createNotification } = await import("./notifications.js");
    try {
      await createNotification({
        userId: newDelivererId,
        type: "return",
        title: "Return Assignment",
        message: `Return request #${returnId.toString().slice(-8)} has been assigned to you.`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/return-deliverer?returnId=${returnId}`,
      });

      // Notify old deliverer if existed
      if (oldDelivererId) {
        await createNotification({
          userId: oldDelivererId,
          type: "return",
          title: "Return Request Reassigned",
          message: `Return request #${returnId.toString().slice(-8)} has been reassigned to another deliverer.`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Return deliverer reassigned successfully", returnRequest });
  } catch (error) {
    console.error("Error reassigning return deliverer:", error);
    return res.status(500).json({ message: "Failed to reassign return deliverer" });
  }
};

/**
 * Reassign verification team
 * Can be done by support or admin
 */
export const reassignVerificationTeam = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { newTeamId, reason } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only support, support_user, or admin can reassign verification team
    if (userRole !== "support" && userRole !== "support_user" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to reassign verification team" });
    }

    // Verify new team exists
    const newTeam = await User.findById(newTeamId);
    if (!newTeam || newTeam.role !== "verification_team") {
      return res.status(404).json({ message: "Verification team not found" });
    }

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Store previous assignment
    if (returnRequest.assignedVerificationTeam) {
      returnRequest.previousAssignments.push({
        assignmentType: "verification",
        assignedTo: returnRequest.assignedVerificationTeam,
        assignedAt: returnRequest.statusHistory.find(h => h.status === "in_inspection")?.timestamp || returnRequest.createdAt,
        reassignedAt: new Date(),
        reassignedBy: userId,
        reassignmentReason: reason || "Reassigned",
      });
    }

    // Reassign
    const oldTeamId = returnRequest.assignedVerificationTeam;
    returnRequest.assignedVerificationTeam = newTeamId;
    returnRequest.assignmentRejected = false;

    returnRequest.statusHistory.push({
      status: returnRequest.returnStatus,
      timestamp: new Date(),
      note: `Verification team reassigned from ${oldTeamId ? 'previous team' : 'none'} to ${newTeam.fullName || newTeam.email}${reason ? `. Reason: ${reason}` : ''}`,
      changedBy: userId,
    });

    await returnRequest.save();

    // Notify new team
    const { createNotification } = await import("./notifications.js");
    try {
      await createNotification({
        userId: newTeamId,
        type: "return",
        title: "Return Assigned for Inspection",
        message: `Return request #${returnId.toString().slice(-8)} has been assigned to your team for inspection.`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/verification?returnId=${returnId}`,
      });

      // Notify old team if existed
      if (oldTeamId) {
        await createNotification({
          userId: oldTeamId,
          type: "return",
          title: "Return Request Reassigned",
          message: `Return request #${returnId.toString().slice(-8)} has been reassigned to another verification team.`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Verification team reassigned successfully", returnRequest });
  } catch (error) {
    console.error("Error reassigning verification team:", error);
    return res.status(500).json({ message: "Failed to reassign verification team" });
  }
};

/**
 * Reassign inspector
 * Can be done by verification team or admin
 */
export const reassignInspector = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { newInspectorId, reason } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only verification_team or admin can reassign inspector
    if (userRole !== "verification_team" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to reassign inspector" });
    }

    // Verify new inspector exists
    const newInspector = await User.findById(newInspectorId);
    if (!newInspector || newInspector.role !== "return_inspector") {
      return res.status(404).json({ message: "Inspector not found" });
    }

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Verify authorization
    if (userRole === "verification_team" && String(returnRequest.assignedVerificationTeam) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized. You can only reassign returns assigned to your team." });
    }

    // Store previous assignment
    if (returnRequest.assignedInspector) {
      returnRequest.previousAssignments.push({
        assignmentType: "inspector",
        assignedTo: returnRequest.assignedInspector,
        assignedAt: returnRequest.statusHistory.find(h => h.status === "inspector_assigned")?.timestamp || returnRequest.createdAt,
        reassignedAt: new Date(),
        reassignedBy: userId,
        reassignmentReason: reason || "Reassigned",
      });
    }

    // Reassign
    const oldInspectorId = returnRequest.assignedInspector;
    returnRequest.assignedInspector = newInspectorId;
    returnRequest.assignmentRejected = false;

    returnRequest.statusHistory.push({
      status: returnRequest.returnStatus,
      timestamp: new Date(),
      note: `Inspector reassigned from ${oldInspectorId ? 'previous inspector' : 'none'} to ${newInspector.fullName || newInspector.email}${reason ? `. Reason: ${reason}` : ''}`,
      changedBy: userId,
    });

    await returnRequest.save();

    // Notify new inspector
    const { createNotification } = await import("./notifications.js");
    try {
      await createNotification({
        userId: newInspectorId,
        type: "return",
        title: "Inspection Assigned",
        message: `Return request #${returnId.toString().slice(-8)} has been assigned to you for inspection.`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/inspector?returnId=${returnId}`,
      });

      // Notify old inspector if existed
      if (oldInspectorId) {
        await createNotification({
          userId: oldInspectorId,
          type: "return",
          title: "Inspection Reassigned",
          message: `Return request #${returnId.toString().slice(-8)} has been reassigned to another inspector.`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Inspector reassigned successfully", returnRequest });
  } catch (error) {
    console.error("Error reassigning inspector:", error);
    return res.status(500).json({ message: "Failed to reassign inspector" });
  }
};

/**
 * Reassign finance
 * Can be done by support or admin
 */
export const reassignFinance = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { newFinanceId, reason } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Only support, support_user, or admin can reassign finance
    if (userRole !== "support" && userRole !== "support_user" && userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to reassign finance" });
    }

    // Verify new finance user exists
    const newFinance = await User.findById(newFinanceId);
    if (!newFinance || newFinance.role !== "finance") {
      return res.status(404).json({ message: "Finance user not found" });
    }

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Store previous assignment
    if (returnRequest.assignedFinance) {
      returnRequest.previousAssignments.push({
        assignmentType: "finance",
        assignedTo: returnRequest.assignedFinance,
        assignedAt: returnRequest.statusHistory.find(h => h.status === "refund_processing")?.timestamp || returnRequest.createdAt,
        reassignedAt: new Date(),
        reassignedBy: userId,
        reassignmentReason: reason || "Reassigned",
      });
    }

    // Reassign
    const oldFinanceId = returnRequest.assignedFinance;
    returnRequest.assignedFinance = newFinanceId;
    returnRequest.assignmentRejected = false;

    returnRequest.statusHistory.push({
      status: returnRequest.returnStatus,
      timestamp: new Date(),
      note: `Finance user reassigned from ${oldFinanceId ? 'previous user' : 'none'} to ${newFinance.fullName || newFinance.email}${reason ? `. Reason: ${reason}` : ''}`,
      changedBy: userId,
    });

    await returnRequest.save();

    // Notify new finance user
    const { createNotification } = await import("./notifications.js");
    try {
      await createNotification({
        userId: newFinanceId,
        type: "return",
        title: "Refund Processing Assigned",
        message: `Return request #${returnId.toString().slice(-8)} has been assigned to you for refund processing.`,
        relatedEntity: {
          entityType: "return",
          entityId: returnRequest._id,
        },
        actionUrl: `/user/finance?returnId=${returnId}`,
      });

      // Notify old finance user if existed
      if (oldFinanceId) {
        await createNotification({
          userId: oldFinanceId,
          type: "return",
          title: "Refund Processing Reassigned",
          message: `Return request #${returnId.toString().slice(-8)} has been reassigned to another finance user.`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Finance user reassigned successfully", returnRequest });
  } catch (error) {
    console.error("Error reassigning finance:", error);
    return res.status(500).json({ message: "Failed to reassign finance user" });
  }
};

/**
 * Reject return assignment
 * Can be done by assigned user (support, agency, deliverer, verification, inspector, finance)
 */
export const rejectReturnAssignment = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { rejectionReason, assignmentType } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Verify user is assigned to this return based on assignment type
    let isAssigned = false;
    let clearedField = null;
    let assignmentTypeName = "";

    if (assignmentType === "support" || userRole === "support_user") {
      isAssigned = returnRequest.assignedSupportUser && String(returnRequest.assignedSupportUser) === String(userId);
      clearedField = "assignedSupportUser";
      assignmentTypeName = "support";
    } else if (assignmentType === "agency" || userRole === "delivery_agency") {
      isAssigned = returnRequest.assignedDeliveryAgency && String(returnRequest.assignedDeliveryAgency) === String(userId);
      clearedField = "assignedDeliveryAgency";
      assignmentTypeName = "agency";
    } else if (assignmentType === "deliverer" || userRole === "delivery_person") {
      isAssigned = returnRequest.assignedReturnDeliverer && String(returnRequest.assignedReturnDeliverer) === String(userId);
      clearedField = "assignedReturnDeliverer";
      assignmentTypeName = "deliverer";
    } else if (assignmentType === "verification" || userRole === "verification_team") {
      isAssigned = returnRequest.assignedVerificationTeam && String(returnRequest.assignedVerificationTeam) === String(userId);
      clearedField = "assignedVerificationTeam";
      assignmentTypeName = "verification";
    } else if (assignmentType === "inspector" || userRole === "return_inspector") {
      isAssigned = returnRequest.assignedInspector && String(returnRequest.assignedInspector) === String(userId);
      clearedField = "assignedInspector";
      assignmentTypeName = "inspector";
    } else if (assignmentType === "finance" || userRole === "finance") {
      isAssigned = returnRequest.assignedFinance && String(returnRequest.assignedFinance) === String(userId);
      clearedField = "assignedFinance";
      assignmentTypeName = "finance";
    }

    if (!isAssigned) {
      return res.status(403).json({ message: "Unauthorized. You can only reject assignments made to you." });
    }

    // Mark as rejected
    returnRequest.assignmentRejected = true;
    returnRequest.assignmentRejectedAt = new Date();
    returnRequest.assignmentRejectedBy = userId;
    returnRequest.assignmentRejectionReason = rejectionReason;
    returnRequest.assignmentRejectionType = assignmentTypeName;

    // Clear assignment
    if (clearedField) {
      returnRequest[clearedField] = null;
    }

    returnRequest.statusHistory.push({
      status: returnRequest.returnStatus,
      timestamp: new Date(),
      note: `${assignmentTypeName} assignment rejected by ${userRole}. Reason: ${rejectionReason}`,
      changedBy: userId,
    });

    await returnRequest.save();

    // Notify admin/support
    const { createNotification } = await import("./notifications.js");
    try {
      // Notify support admin
      const supportUsers = await User.find({ role: { $in: ["support", "support_user"] } });
      for (const supportUser of supportUsers) {
        await createNotification({
          userId: supportUser._id,
          type: "return",
          title: "Assignment Rejected",
          message: `${assignmentTypeName} assignment for return #${returnId.toString().slice(-8)} has been rejected. Reason: ${rejectionReason}`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
          actionUrl: `/user/support?returnId=${returnId}`,
        });
      }

      // Notify admin
      const adminUsers = await User.find({ role: "admin" });
      for (const admin of adminUsers) {
        await createNotification({
          userId: admin._id,
          type: "return",
          title: "Assignment Rejected",
          message: `${assignmentTypeName} assignment for return #${returnId.toString().slice(-8)} has been rejected. Reason: ${rejectionReason}`,
          relatedEntity: {
            entityType: "return",
            entityId: returnRequest._id,
          },
          actionUrl: `/user/admin`,
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    return res.json({ message: "Assignment rejected successfully", returnRequest });
  } catch (error) {
    console.error("Error rejecting return assignment:", error);
    return res.status(500).json({ message: "Failed to reject assignment" });
  }
};
