import express from "express";
import {
  createNewPassword,
  changePassword,
  resetPassword,
  createUser,
  deleteUser,
  getUser,
  getUserStats,
  getUsers,
  login,
  registration,
  updateUserProfile,
  validateUser,
  uploadCoverPhoto,
  uploadProfilePhoto,
  getProfileCompletion,
} from "../controllers/user.js";

import Auth from "../middlewares/auth.js";
import { requireAdmin, requirePermission } from "../middlewares/rbac.js";
// Use Cloudflare upload middleware if available, otherwise fallback to local upload
import { Upload, uploadToCloudflare } from "../middlewares/uploadCloudflare.js";
// Keep local upload as fallback
import { Upload as UploadLocal } from "../middlewares/upload.js";
import {
  getWorkloadDashboard,
  getUserWorkload,
} from "../controllers/workload.js";

const router = express.Router();

// IMPORTANT: Specific routes must come BEFORE parameterized routes (/:id)
// Express matches routes in order, so /:id will catch everything if placed first

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and get JWT token
 *     tags: [Authentication]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user account
 *     tags: [Authentication]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller]
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 */
router.post("/register", registration);

/**
 * @swagger
 * /api/v1/user/check-user:
 *   post:
 *     summary: Check if user exists
 *     description: Verify if an email is already registered
 *     tags: [Authentication]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User check result
 */
router.post("/check-user", validateUser);

/**
 * @swagger
 * /api/v1/user/change-password:
 *   put:
 *     summary: Reset password (forgot password)
 *     description: Reset password using email verification
 *     tags: [Authentication]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.put("/change-password", createNewPassword);

/**
 * @swagger
 * /api/v1/user/reset-password:
 *   put:
 *     summary: Change password (authenticated)
 *     description: Change password for authenticated user
 *     tags: [Users]
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
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.put(
  "/reset-password",
  Auth,
  requirePermission("user", "update"),
  changePassword
);

/**
 * @swagger
 * /api/v1/user/profile-completion:
 *   get:
 *     summary: Get profile completion status
 *     description: Get the profile completion percentage for the current user
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile completion status
 */
router.get(
  "/profile-completion",
  Auth,
  requirePermission("user", "read"),
  getProfileCompletion
);

/**
 * @swagger
 * /api/v1/user/list:
 *   get:
 *     summary: Get all users (admin only)
 *     description: Retrieve a list of all users (admin only)
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/list", Auth, requireAdmin, getUsers);

/**
 * @swagger
 * /api/v1/user/create:
 *   post:
 *     summary: Create a new user (admin)
 *     description: Create a new user account (admin only)
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post("/create", Auth, requirePermission("user", "create"), createUser);

/**
 * @swagger
 * /api/v1/user/reset-password-admin:
 *   post:
 *     summary: Reset user password (admin)
 *     description: Admin resets password for a user
 *     tags: [Users]
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
 *               userId:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post(
  "/reset-password-admin",
  Auth,
  requirePermission("user", "update"),
  resetPassword
);

/**
 * @swagger
 * /api/v1/user/stats:
 *   get:
 *     summary: Get user statistics (admin only)
 *     description: Retrieve user statistics (admin only)
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 */
router.get("/stats", Auth, requireAdmin, getUserStats);

/**
 * @swagger
 * /api/v1/user/workload/dashboard:
 *   get:
 *     summary: Get workload dashboard
 *     description: Get workload dashboard data
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Workload dashboard data
 */
router.get(
  "/workload/dashboard",
  Auth,
  requirePermission("user", "read"),
  getWorkloadDashboard
);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve user profile by ID (users can view their own profile, admins can view any profile)
 *     tags: [Users]
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
 *         description: User profile
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot view other user's profile
 */
router.get("/:id", Auth, requirePermission("user", "read"), getUser);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   patch:
 *     summary: Update user profile
 *     description: Update user profile information
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch(
  "/:id",
  Auth,
  requirePermission("user", "update"),
  updateUserProfile
);

/**
 * @swagger
 * /api/v1/user/{id}/profile-photo:
 *   patch:
 *     summary: Upload profile photo
 *     description: Upload or update user profile photo
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile photo uploaded
 */
router.patch(
  "/:id/profile-photo",
  Auth,
  requirePermission("user", "update"),
  Upload.single("photo"),
  uploadToCloudflare,
  uploadProfilePhoto
);

/**
 * @swagger
 * /api/v1/user/{id}/cover-photo:
 *   patch:
 *     summary: Upload cover photo
 *     description: Upload or update user cover photo
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cover photo uploaded
 */
router.patch(
  "/:id/cover-photo",
  Auth,
  requirePermission("user", "update"),
  Upload.single("photo"),
  uploadToCloudflare,
  uploadCoverPhoto
);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user account
 *     tags: [Users]
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
 *         description: User deleted
 */
router.delete("/:id", Auth, requirePermission("user", "delete"), deleteUser);

/**
 * @swagger
 * /api/v1/user/workload/{userId}:
 *   get:
 *     summary: Get user workload
 *     description: Get workload data for a specific user
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User workload data
 */
router.get(
  "/workload/:userId",
  Auth,
  requirePermission("user", "read"),
  getUserWorkload
);

export default router;
