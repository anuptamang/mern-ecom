import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Types.ObjectId, ref: "products", required: true },
    title: { type: String, required: true },
    thumbnail: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
    currency: { type: String, default: "usd" },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

cartSchema.methods.getTotals = function () {
  const totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalQuantity, totalPrice };
};

const Cart = mongoose.model("carts", cartSchema);

export default Cart;
