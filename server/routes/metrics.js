/**
 * Metrics Route
 *
 * Exposes Prometheus metrics endpoint at /metrics
 * Protected by application token in production, public in development
 */

import express from "express";
import { metricsHandler } from "../middlewares/metrics.js";
import { verifyApplicationToken } from "../middlewares/applicationToken.js";
import config from "../config/index.js";

const router = express.Router();

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get Prometheus metrics
 *     description: Retrieve Prometheus-compatible metrics (protected by application token in production, public in development)
 *     tags: [Health]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Prometheus metrics in text format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
// Metrics endpoint
// In development: public access (for easier testing)
// In production: protected by application token (for security)
if (config.server.env === "production") {
  router.get("/", verifyApplicationToken, metricsHandler);
} else {
  // Public in development - allows direct browser access
  router.get("/", metricsHandler);
}

export default router;
