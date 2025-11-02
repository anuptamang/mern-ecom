import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "orders",
      required: true,
      index: true,
    },
    orderItemId: {
      type: String, // Index in order.items array or unique identifier
      required: true,
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "products",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deliveryId: {
      type: mongoose.Types.ObjectId,
      ref: "deliveries",
      required: true,
      index: true,
    },
    payoutAmount: {
      type: Number,
      required: true, // Amount in cents
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
      required: true,
      index: true,
    },
    bankPayout: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      routingNumber: { type: String },
      swiftCode: { type: String },
      iban: { type: String },
      accountType: { type: String, enum: ["checking", "savings"] },
    },
    // Finance user who processed the payout
    processedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
    },
    // Stripe transfer ID (if using Stripe Connect for payouts)
    transferId: {
      type: String,
    },
    failureReason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
payoutSchema.index({ sellerId: 1, status: 1 });
payoutSchema.index({ status: 1, createdAt: -1 });
payoutSchema.index({ orderId: 1, orderItemId: 1 });

const Payout = mongoose.model("payouts", payoutSchema);

export default Payout;
