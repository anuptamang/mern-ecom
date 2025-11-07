import express from "express";
import Auth from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/rbac.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notifications.js";

const router = express.Router();

// All notification routes require authentication
router.use(Auth);

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get notifications
 *     description: Retrieve all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", requirePermission("user", "read"), getNotifications);

/**
 * @swagger
 * /api/v1/notifications/unread/count:
 *   get:
 *     summary: Get unread notification count
 *     description: Get the count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 */
router.get("/unread/count", requirePermission("user", "read"), getUnreadCount);

/**
 * @swagger
 * /api/v1/notifications/all/read:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Mark all notifications as read for the current user
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch("/all/read", requirePermission("user", "update"), markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch("/:id/read", requirePermission("user", "update"), markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     description: Delete a specific notification
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 */
router.delete("/:id", requirePermission("user", "delete"), deleteNotification);

/**
 * @swagger
 * /api/v1/notifications:
 *   delete:
 *     summary: Delete all notifications
 *     description: Delete all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted
 */
router.delete("/", requirePermission("user", "delete"), deleteAllNotifications);

export default router;
