import mongoose from "mongoose";

const deliveryTrackingSchema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "orders",
      required: true,
      unique: true,
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
    deliveryAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
      addressType: { type: String, enum: ["primary", "secondary"] },
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add index for efficient queries
deliveryTrackingSchema.index({ orderId: 1, status: 1 });

const Delivery = mongoose.model("deliveries", deliveryTrackingSchema);

export default Delivery;
