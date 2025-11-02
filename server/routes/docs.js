import express from "express";
import {
  getDocsList,
  getDoc,
  searchDocs,
} from "../controllers/docs.js";

const router = express.Router();

// Public routes (documentation is accessible to all)
router.get("/list", getDocsList);
router.get("/search", searchDocs);
router.get("/:docName", getDoc);

export default router;
