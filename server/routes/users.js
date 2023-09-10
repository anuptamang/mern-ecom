import express from "express";
import {
  createNewPassword,
  deleteUser,
  getUser,
  getUsers,
  login,
  registration,
  updateUserProfile,
  validateUser,
} from "../controllers/user.js";

import Auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/registration", registration);
router.get("/list", getUsers);
router.get("/:id", getUser);
router.patch("/:id", Auth, updateUserProfile);
router.delete("/:id", Auth, deleteUser);

router.post("/check-user", validateUser);
router.put("/change-password", createNewPassword);

export default router;
