import Chat from "../models/chat.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import { createNotification } from "./notifications.js";

/**
 * Create a new chat or get existing chat between participants
 * If chat is initiated from product page, include product context
 */
export const createOrGetChat = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    let { recipientId, productId, initialMessage } = req.body;

    // If chat is initiated from product page, get seller as recipient
    if (productId && !recipientId) {
      const product = await Product.findById(productId).populate("userID");
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (!product.userID) {
        return res.status(404).json({ message: "Product seller not found" });
      }
      // product.userID is either ObjectId (not populated) or populated User object
      const sellerId = product.userID?._id
        ? product.userID._id
        : product.userID;
      recipientId = String(sellerId);
    }

    if (!recipientId) {
      return res.status(400).json({ message: "Recipient ID is required" });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Find existing chat between these participants
    let chat = await Chat.findOne({
      "participants.userId": { $all: [userId, recipientId] },
      status: { $in: ["active", "resolved"] },
    });

    let productInfo = null;
    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        productInfo = {
          productId: product._id, // Keep as ObjectId for schema
          productTitle: product.title || "",
          productThumbnail: product.thumbnail || "",
          productPrice: product.price || 0,
          productSlug: product.slug || String(product._id),
        };
      }
    }

    // Create new chat if doesn't exist
    if (!chat) {
      chat = await Chat.create({
        participants: [
          { userId, role: userRole },
          { userId: recipientId, role: recipient.role },
        ],
        messages: [],
        productContext: productInfo,
        status: "active",
        unreadCount: new Map(),
      });
    } else {
      // Update product context if provided and not already set
      if (productInfo && !chat.productContext?.productId) {
        chat.productContext = productInfo;
        await chat.save();
      }
    }

    // Add initial message if provided
    if (initialMessage) {
      const newMessage = {
        senderId: userId,
        senderRole: userRole,
        text: initialMessage,
        productInfo: productInfo || undefined,
        read: false,
      };

      chat.messages.push(newMessage);
      chat.lastMessage = {
        text: initialMessage,
        senderId: userId,
        timestamp: new Date(),
      };

      // Update unread count for recipient
      const recipientUnread = chat.unreadCount.get(recipientId.toString()) || 0;
      chat.unreadCount.set(recipientId.toString(), recipientUnread + 1);

      await chat.save();
    }

    // Populate participants for response
    await chat.populate("participants.userId", "fullName email profilePhoto");
    await chat.populate("messages.senderId", "fullName email profilePhoto");

    return res.json({ chat });
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    return res.status(500).json({ message: "Failed to create/get chat" });
  }
};

/**
 * Get all chats for the current user
 */
export const getMyChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({
      "participants.userId": userId,
      status: { $in: ["active", "resolved"] },
    })
      .populate("participants.userId", "fullName email profilePhoto role")
      .populate("messages.senderId", "fullName email profilePhoto")
      .populate("productContext.productId", "title thumbnail price slug")
      .sort({ updatedAt: -1 });

    // Calculate unread count for each chat
    const chatsWithUnread = chats.map((chat) => {
      const unreadCount = chat.unreadCount.get(userId.toString()) || 0;
      return {
        ...chat.toObject(),
        unreadCount,
      };
    });

    return res.json({ chats: chatsWithUnread, count: chats.length });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ message: "Failed to fetch chats" });
  }
};

/**
 * Get a specific chat by ID
 */
export const getChatById = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      "participants.userId": userId,
    })
      .populate("participants.userId", "fullName email profilePhoto role")
      .populate("messages.senderId", "fullName email profilePhoto")
      .populate("productContext.productId", "title thumbnail price slug");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Mark messages as read for current user
    const unreadMessages = chat.messages.filter(
      (msg) => !msg.read && String(msg.senderId) !== String(userId)
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg) => {
        msg.read = true;
        msg.readAt = new Date();
      });

      // Reset unread count for current user
      chat.unreadCount.set(userId.toString(), 0);
      await chat.save();
    }

    return res.json({ chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return res.status(500).json({ message: "Failed to fetch chat" });
  }
};

/**
 * Send a message to a chat
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      "participants.userId": userId,
      status: { $in: ["active", "resolved"] },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Get sender info for notification
    const sender = await User.findById(userId);

    // Create new message with timestamp
    const newMessage = {
      senderId: userId,
      senderRole: userRole,
      text: text.trim(),
      read: false,
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);
    chat.lastMessage = {
      text: text.trim(),
      senderId: userId,
      timestamp: new Date(),
    };

    // Update unread count and create notifications for other participants
    const recipientIds = [];
    chat.participants.forEach((participant) => {
      if (String(participant.userId) !== String(userId)) {
        const currentUnread =
          chat.unreadCount.get(participant.userId.toString()) || 0;
        chat.unreadCount.set(participant.userId.toString(), currentUnread + 1);
        recipientIds.push(participant.userId);
      }
    });

    // Mark chat as active if it was resolved
    if (chat.status === "resolved") {
      chat.status = "active";
    }

    await chat.save();

    // Create notifications for recipients
    for (const recipientId of recipientIds) {
      try {
        const recipient = await User.findById(recipientId);
        const otherParticipant = chat.participants.find(
          (p) => String(p.userId) !== String(recipientId)
        );

        // Get product context for notification
        let productTitle = "";
        if (chat.productContext?.productTitle) {
          productTitle = ` about "${chat.productContext.productTitle}"`;
        }

        await createNotification({
          userId: recipientId,
          type: "system",
          title: "New Message",
          message: `${
            sender?.fullName || "Someone"
          } sent you a message${productTitle}`,
          relatedEntity: {
            entityType: "chat",
            entityId: chat._id,
          },
          actionUrl: `/user/chats?chatId=${chat._id}`,
          metadata: {
            chatId: chat._id.toString(),
            senderId: userId.toString(),
            senderName: sender?.fullName || "Unknown",
            messageText: text.trim().substring(0, 100),
            productContext: chat.productContext || null,
          },
        });
      } catch (notifError) {
        console.error("Error creating chat notification:", notifError);
        // Don't fail the request if notification creation fails
      }
    }

    // Populate sender info for response
    await chat.populate(
      "participants.userId",
      "fullName email profilePhoto role"
    );
    await chat.populate("messages.senderId", "fullName email profilePhoto");
    const sentMessage = chat.messages[chat.messages.length - 1];

    return res.json({
      message: sentMessage,
      chat,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

/**
 * Mark chat as resolved
 */
export const markChatResolved = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      "participants.userId": userId,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Only seller, support, or admin can mark as resolved
    if (!["seller", "support", "admin"].includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to mark chat as resolved" });
    }

    chat.status = "resolved";
    await chat.save();

    return res.json({ message: "Chat marked as resolved", chat });
  } catch (error) {
    console.error("Error marking chat as resolved:", error);
    return res.status(500).json({ message: "Failed to mark chat as resolved" });
  }
};

/**
 * Get unread message count for current user
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({
      "participants.userId": userId,
      status: { $in: ["active", "resolved"] },
    });

    let totalUnread = 0;
    chats.forEach((chat) => {
      const unread = chat.unreadCount.get(userId.toString()) || 0;
      totalUnread += unread;
    });

    return res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return res.status(500).json({ message: "Failed to fetch unread count" });
  }
};
