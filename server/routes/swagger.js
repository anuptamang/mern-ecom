/**
 * Swagger UI Route
 *
 * Serves interactive API documentation at /api-docs
 */

import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger.js";
import { verifyApplicationToken } from "../middlewares/applicationToken.js";
import config from "../config/index.js";

const router = express.Router();

// Swagger UI options
const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "E-Commerce API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

// Swagger JSON endpoint (public in development, protected in production)
// Accessible at: /api-docs/swagger.json
if (config.server.env === "production") {
  router.get("/swagger.json", verifyApplicationToken, (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=swagger.json");
    res.send(swaggerSpec);
  });
} else {
  router.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=swagger.json");
    res.send(swaggerSpec);
  });
}

// Swagger YAML endpoint (public in development, protected in production)
// Accessible at: /api-docs/swagger.yaml
// Note: Converts JSON to YAML format for tools that prefer YAML
const jsonToYaml = (obj, indent = 0) => {
  const indentStr = "  ".repeat(indent);
  if (typeof obj !== "object" || obj === null) {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return obj
      .map((item) => `${indentStr}- ${jsonToYaml(item, indent + 1)}`)
      .join("\n");
  }
  return Object.entries(obj)
    .map(([key, value]) => {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        return `${indentStr}${key}:\n${jsonToYaml(value, indent + 1)}`;
      }
      return `${indentStr}${key}: ${jsonToYaml(value, indent)}`;
    })
    .join("\n");
};

if (config.server.env === "production") {
  router.get("/swagger.yaml", verifyApplicationToken, (req, res) => {
    const yamlContent = jsonToYaml(swaggerSpec);
    res.setHeader("Content-Type", "text/yaml");
    res.setHeader("Content-Disposition", "attachment; filename=swagger.yaml");
    res.send(yamlContent);
  });
} else {
  router.get("/swagger.yaml", (req, res) => {
    const yamlContent = jsonToYaml(swaggerSpec);
    res.setHeader("Content-Type", "text/yaml");
    res.setHeader("Content-Disposition", "attachment; filename=swagger.yaml");
    res.send(yamlContent);
  });
}

// Swagger UI endpoint
// In development: public access (users can enter API key in UI)
// In production: protected by application token
if (config.server.env === "production") {
  router.use("/", verifyApplicationToken, swaggerUi.serve);
  router.get(
    "/",
    verifyApplicationToken,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );
} else {
  // Public in development - users can enter API key in Swagger UI
  router.use("/", swaggerUi.serve);
  router.get("/", swaggerUi.setup(swaggerSpec, swaggerUiOptions));
}

export default router;
