import express from "express";
import {
  createNewPassword,
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
} from "../controllers/user.js";

import Auth from "../middlewares/auth.js";
import { Upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", registration);
router.get("/list", getUsers);
router.post("/check-user", validateUser);
router.put("/change-password", createNewPassword);
router.get("/stats", Auth, getUserStats);

router.get("/:id", getUser);
router.patch("/:id", Auth, updateUserProfile);
router.delete("/:id", Auth, deleteUser);
router.patch("/:id/profile-photo", Auth, Upload, uploadProfilePhoto);
router.patch("/:id/cover-photo", Auth, Upload, uploadCoverPhoto);

export default router;
