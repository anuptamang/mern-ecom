import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["admin", "seller", "user", "delivery_agency", "delivery_person", "support"],
    },
    text: {
      type: String,
      required: true,
    },
    // Product information when chat is initiated from product page
    productInfo: {
      productId: { type: mongoose.Types.ObjectId, ref: "products" },
      productTitle: { type: String },
      productThumbnail: { type: String },
      productPrice: { type: Number },
      productSlug: { type: String },
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    seenAt: {
      type: Date,
    },
    seenBy: {
      type: Map,
      of: Date, // userId -> seenAt timestamp
      default: {},
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "seller", "user", "delivery_agency", "delivery_person", "support"],
        },
      },
    ],
    messages: [messageSchema],
    // Product context - chat initiated from a specific product
    productContext: {
      productId: { type: mongoose.Types.ObjectId, ref: "products" },
      productTitle: { type: String },
      productThumbnail: { type: String },
      productPrice: { type: Number },
      productSlug: { type: String },
    },
    // Chat metadata
    lastMessage: {
      text: { type: String },
      senderId: { type: mongoose.Types.ObjectId, ref: "User" },
      timestamp: { type: Date },
    },
    unreadCount: {
      type: Map,
      of: Number, // userId -> count
      default: {},
    },
    status: {
      type: String,
      enum: ["active", "resolved", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
chatSchema.index({ "participants.userId": 1, status: 1 });
chatSchema.index({ "messages.senderId": 1 });
chatSchema.index({ "productContext.productId": 1 });
chatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model("chats", chatSchema);

export default Chat;

