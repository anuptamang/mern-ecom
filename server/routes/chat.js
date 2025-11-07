import express from "express";
import Auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/rbac.js";
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

/**
 * @swagger
 * /api/v1/chat/unread:
 *   get:
 *     summary: Get unread chat count
 *     description: Get the count of unread chat messages
 *     tags: [Chat]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread chat count
 */
router.get("/unread", requirePermission("chat", "read"), getUnreadCount);

/**
 * @swagger
 * /api/v1/chat:
 *   get:
 *     summary: Get my chats
 *     description: Retrieve all chats for the current user
 *     tags: [Chat]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 */
router.get("/", requirePermission("chat", "read"), getMyChats);

/**
 * @swagger
 * /api/v1/chat:
 *   post:
 *     summary: Create or get chat
 *     description: Create a new chat or get existing chat
 *     tags: [Chat]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat created or retrieved
 */
router.post("/", requirePermission("chat", "create"), createOrGetChat);

/**
 * @swagger
 * /api/v1/chat/{chatId}:
 *   get:
 *     summary: Get chat by ID
 *     description: Retrieve a specific chat with all messages
 *     tags: [Chat]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat details with messages
 */
router.get("/:chatId", requirePermission("chat", "read"), getChatById);

/**
 * @swagger
 * /api/v1/chat/{chatId}/message:
 *   post:
 *     summary: Send message
 *     description: Send a message in a chat
 *     tags: [Chat]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 */
router.post(
  "/:chatId/message",
  requirePermission("chat", "create"),
  sendMessage
);

/**
 * @swagger
 * /api/v1/chat/{chatId}/resolve:
 *   patch:
 *     summary: Mark chat as resolved
 *     description: Mark a chat as resolved
 *     tags: [Chat]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat marked as resolved
 */
router.patch(
  "/:chatId/resolve",
  requirePermission("chat", "update"),
  markChatResolved
);

export default router;
