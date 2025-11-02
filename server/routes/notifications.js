import express from "express";
import Auth from "../middlewares/auth.js";
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

// Get notifications (with optional filters: ?read=true/false&limit=50&skip=0)
router.get("/", getNotifications);

// Get unread count
router.get("/unread/count", getUnreadCount);

// Mark all notifications as read (must come before /:id/read to avoid route conflict)
router.patch("/all/read", markAllAsRead);

// Mark notification as read
router.patch("/:id/read", markAsRead);

// Delete a notification
router.delete("/:id", deleteNotification);

// Delete all notifications
router.delete("/", deleteAllNotifications);

export default router;
