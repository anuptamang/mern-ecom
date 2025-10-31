import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Types.ObjectId, ref: "products", required: true },
    title: { type: String, required: true },
    thumbnail: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    paymentIntentId: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("orders", orderSchema);

export default Order;
