import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  title: String,
  body: { type: Object },
  status: String,
  name: String,
  userID: String,
  tag: [{ type: String }],
  categories: [{ type: String }],
  slug: { type: String },
  thumbnail: { type: String },
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
