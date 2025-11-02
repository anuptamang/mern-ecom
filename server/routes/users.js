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
import { Upload } from "../middlewares/upload.js";
import {
  getWorkloadDashboard,
  getUserWorkload,
} from "../controllers/workload.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", registration);
router.get("/list", Auth, getUsers); // Require auth for user listing
router.post("/create", Auth, createUser); // Create user with role-based authorization
router.post("/check-user", validateUser);
router.put("/change-password", createNewPassword); // Forgot password flow
router.put("/reset-password", Auth, changePassword); // User changes own password
router.post("/reset-password-admin", Auth, resetPassword); // Admin resets child user password
router.get("/profile-completion", Auth, getProfileCompletion);
router.get("/stats", Auth, getUserStats);
// Workload routes
router.get("/workload/dashboard", Auth, getWorkloadDashboard);
router.get("/workload/:userId", Auth, getUserWorkload);

router.get("/:id", getUser);
router.patch("/:id", Auth, updateUserProfile);
router.delete("/:id", Auth, deleteUser);
router.patch("/:id/profile-photo", Auth, Upload.single("photo"), uploadProfilePhoto);
router.patch("/:id/cover-photo", Auth, Upload.single("photo"), uploadCoverPhoto);

export default router;
