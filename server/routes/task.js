import express from "express";

import {
  getTasks,
  getTask,
  deleteTask,
  createTask,
  updateTask,
} from "../controllers/tasks.js";

import Auth from '../middlewares/auth.js'

const router = express.Router();

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", Auth, createTask);
router.patch("/:id", Auth, updateTask);
router.delete("/:id", Auth, deleteTask);

export default router;
