import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "products",
      required: true,
    },
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    reason: { type: String },
  },
  { _id: false }
);

const returnSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "orders",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [returnItemSchema], required: true },
    returnAmount: { type: Number, required: true }, // Amount to be refunded in cents
    reason: { type: String, required: true },
    proofImages: [{ type: String }], // Array of image URLs for proof
    returnStatus: {
      type: String,
      enum: [
        "pending", // Buyer submitted, awaiting support assignment
        "assigned_support", // Support user assigned
        "assigned_agency", // Delivery agency assigned for return pickup
        "assigned_deliverer", // Return deliverer assigned
        "picked_up", // Return deliverer picked up package from buyer
        "submitted_to_support", // Return deliverer submitted package to support team
        "in_inspection", // Package received by verification team
        "inspector_assigned", // Inspector assigned
        "inspection_accepted", // Inspector accepted return
        "inspection_rejected", // Inspector rejected return
        "refund_processing", // Finance processing refund
        "refunded", // Refund completed
        "re_delivery", // Re-delivery to buyer (after rejection)
        "completed", // Return completed
        "cancelled",
      ],
      default: "pending",
      required: true,
      index: true,
    },
    refundId: { type: String }, // Stripe refund ID
    refundStatus: {
      type: String,
      enum: ["pending", "processing", "succeeded", "failed", "canceled"],
      // Optional - only set when refund is processed
      required: false,
      set: function (value) {
        // Convert null to undefined to avoid enum validation error
        return value === null ? undefined : value;
      },
    },
    refundAmount: { type: Number }, // Actual refunded amount
    refundCreatedAt: { type: Date },
    refundCompletedAt: { type: Date },
    refundFailureReason: { type: String },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Types.ObjectId, ref: "User" }, // Seller who approved (legacy)
    rejectedAt: { type: Date },
    rejectedBy: { type: mongoose.Types.ObjectId, ref: "User" }, // Seller who rejected (legacy)
    rejectionReason: { type: String },
    // New workflow assignments
    assignedSupportUser: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedDeliveryAgency: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedReturnDeliverer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedVerificationTeam: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedInspector: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedFinance: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Inspection details
    inspectionResult: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    inspectionNote: { type: String },
    inspectionRejectionReason: { type: String }, // Custom reason if rejected
    inspectionDate: { type: Date },
    // Pickup details
    pickedUpAt: { type: Date },
    pickedUpBy: { type: mongoose.Types.ObjectId, ref: "User" },
    pickupProof: { type: String }, // Image URL
    // Re-delivery details (if inspection rejected)
    redeliveryOrderId: { type: mongoose.Types.ObjectId, ref: "orders" },
    // Assignment rejection tracking
    assignmentRejected: {
      type: Boolean,
      default: false,
    },
    assignmentRejectedAt: {
      type: Date,
    },
    assignmentRejectedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignmentRejectionReason: {
      type: String,
    },
    assignmentRejectionType: {
      type: String,
      enum: [
        "support",
        "agency",
        "deliverer",
        "verification",
        "inspector",
        "finance",
      ],
    },
    // Track previous assignments for reassignment history
    previousAssignments: [
      {
        assignmentType: {
          type: String,
          enum: [
            "support",
            "agency",
            "deliverer",
            "verification",
            "inspector",
            "finance",
          ],
        },
        assignedTo: { type: mongoose.Types.ObjectId, ref: "User" },
        assignedAt: { type: Date },
        reassignedAt: { type: Date },
        reassignedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        reassignmentReason: { type: String },
      },
    ],
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        changedBy: { type: mongoose.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add index for efficient queries
returnSchema.index({ orderId: 1, returnStatus: 1 });
returnSchema.index({ userId: 1, returnStatus: 1 });

const Return = mongoose.model("returns", returnSchema);

export default Return;
