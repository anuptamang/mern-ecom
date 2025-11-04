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
// Use wildcard route to handle nested paths like "API/README.md"
router.get("/*", getDoc);

export default router;
