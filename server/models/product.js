import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: String,
  body: { type: Object },
  status: String,
  name: String,
  userID: { type: mongoose.Types.ObjectId, ref: "User" },
  tag: [{ type: String }],
  categories: [{ type: String }],
  slug: { type: String },
  thumbnail: { type: String },
  images: [{ type: String }], // Gallery images
  price: { type: Number },
  stock: { type: Number, default: 0 }, // Stock availability count
  estimatedDeliveryDays: { type: Number, default: 7 }, // Typical estimated delivery time in days
  rating: { type: Number, default: 0 }, // Average rating
  ratings: [
    {
      userId: { type: mongoose.Types.ObjectId, ref: "User" },
      rating: { type: Number, required: true, min: 1, max: 5 },
      review: { type: String },
      createdAt: { type: Date, default: new Date() },
    },
  ],
  comments: [
    {
      text: { type: String, required: true },
      userId: { type: mongoose.Types.ObjectId, ref: "User" },
      likes: { type: Number, default: 0 },
      replies: [{ type: String }],
    },
  ],
  likes: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const product = mongoose.model("products", productSchema);

export default product;
