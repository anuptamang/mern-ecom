import express from "express";
import {
  login,
  registration,
  deleteUser,
  updateUserProfile,
  getUser,
  getUsers,
} from "../controllers/user.js";

import Auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/registration", registration);
router.get("/list", getUsers);
router.get("/:id", getUser);
router.patch("/:id", Auth, updateUserProfile);
router.delete("/:id", Auth, deleteUser);

export default router;
