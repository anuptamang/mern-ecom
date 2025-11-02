import mongoose from "mongoose";

const deliveryTrackingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "orders",
      required: true,
      index: true,
    },
    orderItemId: {
      type: String, // Index in order.items array or unique identifier for the item
      required: true,
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "products",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "packing",
        "ready_to_ship",
        "picked_up",
        "in_facility",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "rejected",
        "cancelled",
      ],
      default: "packing",
      required: true,
      index: true,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    carrier: {
      type: String,
    },
    // Delivery agency and person assignment
    assignedDeliveryAgency: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedDeliveryPerson: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedAt: {
      type: Date,
    },
    deliveryAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
      addressType: { type: String, enum: ["primary", "secondary"] },
    },
    // Delivery proof and buyer acceptance
    deliveryProof: {
      type: String, // Image URL
    },
    buyerAcceptance: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    buyerRejectionReason: {
      type: String,
    },
    buyerAcceptedAt: {
      type: Date,
    },
    buyerRejectedAt: {
      type: Date,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        updatedBy: { type: mongoose.Types.ObjectId, ref: "User" }, // Who updated the status
        updatedByRole: { type: String }, // Role of who updated (seller, delivery_agency, delivery_person)
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add index for efficient queries
deliveryTrackingSchema.index({ orderId: 1, productId: 1, status: 1 });
deliveryTrackingSchema.index({ orderId: 1, orderItemId: 1 }, { unique: true });

const Delivery = mongoose.model("deliveries", deliveryTrackingSchema);

export default Delivery;
