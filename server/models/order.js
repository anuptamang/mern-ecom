import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Types.ObjectId, ref: "products", required: true },
    title: { type: String, required: true },
    thumbnail: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    // Per-item tracking
    deliveryStatus: {
      type: String,
      enum: [
        "packing",
        "ready_to_ship",
        "picked_up",
        "in_facility",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "packing",
    },
    estimatedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Types.ObjectId, ref: "User" },
    cancellationReason: { type: String },
    refundStatus: {
      type: String,
      enum: ["pending", "processing", "succeeded", "failed", "canceled"],
      default: undefined,
      sparse: true,
    },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundCreatedAt: { type: Date },
    refundCompletedAt: { type: Date },
    refundFailureReason: { type: String },
    returnStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected", "processing", "completed"],
      default: "none",
    },
    returnRequestedAt: { type: Date },
    returnReason: { type: String },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: { 
      type: String, 
      enum: ["created", "paid", "failed", "cancelled", "refunded"], 
      default: "created" 
    },
    paymentIntentId: { type: String },
    refundId: { type: String }, // Stripe refund ID
    refundStatus: {
      type: String,
      enum: ["pending", "processing", "succeeded", "failed", "canceled"],
      default: undefined,
      sparse: true,
    },
    refundAmount: { type: Number }, // Amount refunded in cents
    refundCreatedAt: { type: Date },
    refundCompletedAt: { type: Date },
    refundFailureReason: { type: String },
    deliveryAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
      addressType: { type: String, enum: ["primary", "secondary"] },
    },
    deliveryStatus: {
      type: String,
      enum: [
        "packing",
        "ready_to_ship",
        "picked_up",
        "in_facility",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "packing",
    },
    estimatedDeliveryDate: { type: Date },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Types.ObjectId, ref: "User" },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("orders", orderSchema);

export default Order;
