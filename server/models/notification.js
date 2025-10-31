import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // For efficient querying
    },
    type: {
      type: String,
      enum: [
        "comment",
        "rating",
        "review",
        "reply",
        "order",
        "order_cancelled",
        "cart_update",
        "product_update",
        "system",
        "chat",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedEntity: {
      type: {
        entityType: {
          type: String,
          enum: ["product", "order", "comment", "rating", "user", "chat"],
        },
        entityId: mongoose.Types.ObjectId,
      },
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    actionUrl: {
      type: String, // URL to navigate when notification is clicked
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Store additional data (e.g., product title, user name)
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model("notifications", notificationSchema);

export default Notification;
