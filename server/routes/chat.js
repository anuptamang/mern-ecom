import express from "express";
import Auth from "../middlewares/auth.js";
import {
  createOrGetChat,
  getMyChats,
  getChatById,
  sendMessage,
  markChatResolved,
  getUnreadCount,
} from "../controllers/chat.js";

const router = express.Router();

// All chat routes require authentication
router.use(Auth);

// Get unread message count
router.get("/unread", getUnreadCount);

// Get all chats for current user
router.get("/", getMyChats);

// Create or get existing chat
router.post("/", createOrGetChat);

// Get specific chat by ID
router.get("/:chatId", getChatById);

// Send message to chat
router.post("/:chatId/message", sendMessage);

// Mark chat as resolved (seller/support/admin only)
router.patch("/:chatId/resolve", markChatResolved);

export default router;

