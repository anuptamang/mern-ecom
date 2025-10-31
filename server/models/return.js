import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Types.ObjectId, ref: "products", required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    reason: { type: String },
  },
  { _id: false }
);

const returnSchema = mongoose.Schema(
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
    reason: { type: String },
    returnStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "processing", "refunded", "completed", "cancelled"],
      default: "pending",
      required: true,
      index: true,
    },
    refundId: { type: String }, // Stripe refund ID
    refundStatus: {
      type: String,
      enum: ["pending", "processing", "succeeded", "failed", "canceled"],
      default: null,
    },
    refundAmount: { type: Number }, // Actual refunded amount
    refundCreatedAt: { type: Date },
    refundCompletedAt: { type: Date },
    refundFailureReason: { type: String },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Types.ObjectId, ref: "User" }, // Seller who approved
    rejectedAt: { type: Date },
    rejectedBy: { type: mongoose.Types.ObjectId, ref: "User" }, // Seller who rejected
    rejectionReason: { type: String },
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
