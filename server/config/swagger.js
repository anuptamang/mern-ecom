/**
 * Swagger/OpenAPI Configuration
 *
 * Generates OpenAPI 3.0 specification from JSDoc comments
 * Provides interactive API documentation at /api-docs
 */

import swaggerJsdoc from "swagger-jsdoc";
import config from "./index.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description:
        "Enterprise-grade e-commerce API with comprehensive security and features",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: config.server.baseUrl,
        description:
          config.server.env === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description:
            "Application token for API access (REQUIRED for all endpoints). Get this from server/.env APPLICATION_TOKEN",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT token for user authentication (OPTIONAL - only needed for authenticated endpoints). Get this by logging in via /api/v1/user/login",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            error: {
              type: "string",
              example: "Error details",
            },
            requestId: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Success message",
            },
            data: {
              type: "object",
            },
            requestId: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
          },
        },
      },
    },
    security: [
      { ApiKeyAuth: [] }, // Application token is required for all endpoints
      // BearerAuth is optional - only needed for authenticated endpoints
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "Products",
        description: "Product management endpoints",
      },
      {
        name: "Orders",
        description: "Order management endpoints",
      },
      {
        name: "Carts",
        description: "Shopping cart endpoints",
      },
      {
        name: "Checkout",
        description: "Checkout and payment endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Health",
        description: "Health check and monitoring endpoints",
      },
      {
        name: "Delivery",
        description: "Delivery and tracking endpoints",
      },
      {
        name: "Returns",
        description: "Return and refund management endpoints",
      },
      {
        name: "Wishlist",
        description: "Wishlist management endpoints",
      },
      {
        name: "Notifications",
        description: "Notification management endpoints",
      },
      {
        name: "Payouts",
        description: "Payout management endpoints",
      },
      {
        name: "Banners",
        description: "Banner management endpoints",
      },
      {
        name: "Theme",
        description: "Theme management endpoints",
      },
      {
        name: "Chat",
        description: "Chat and messaging endpoints",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js", "./index.js"],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
