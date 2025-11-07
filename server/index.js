import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import config from "./config/index.js";
import { logger } from "./utils/index.js";
import { errorHandler } from "./utils/errorHandler.js";
import { defaultRateLimiter } from "./middlewares/rateLimiter.js";
import securityHeaders from "./middlewares/securityHeaders.js";
import { sanitizeInput } from "./middlewares/inputSanitization.js";
import { verifyApplicationToken } from "./middlewares/applicationToken.js";
import { requestIdMiddleware } from "./middlewares/requestId.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { compressionMiddleware } from "./middlewares/compression.js";
import { defaultTimeout } from "./middlewares/timeout.js";
import { metricsMiddleware } from "./middlewares/metrics.js";
import { gracefulShutdown } from "./utils/gracefulShutdown.js";

import productRoutes from "./routes/products.js";
import userRoutes from "./routes/users.js";
import cartRoutes from "./routes/carts.js";
import checkoutRoutes from "./routes/checkout.js";
import orderRoutes from "./routes/orders.js";
import notificationRoutes from "./routes/notifications.js";
import wishlistRoutes from "./routes/wishlist.js";
import deliveryRoutes from "./routes/delivery.js";
import chatRoutes from "./routes/chat.js";
import returnRoutes from "./routes/return.js";
import docsRoutes from "./routes/docs.js";
import payoutRoutes from "./routes/payout.js";
import bannerRoutes from "./routes/banner.js";
import themeRoutes from "./routes/theme.js";
import healthRoutes from "./routes/health.js";
import swaggerRoutes from "./routes/swagger.js";
import metricsRoutes from "./routes/metrics.js";

const app = express();

// Trust proxy - Required for load balancers and reverse proxies
// This allows Express to correctly identify the client's IP address
// from X-Forwarded-For, X-Real-IP, etc. headers
// Set to true to trust first proxy, or number to trust N proxies
// In production with load balancer, set to 1 (trust first proxy) or true
app.set("trust proxy", config.server.env === "production" ? 1 : false);

// Security headers - Apply globally (must be early in middleware chain)
app.use(securityHeaders);

// Request ID - Generate unique ID for each request (must be early)
app.use(requestIdMiddleware);

// Request/Response logging - Log all requests and responses
app.use(requestLogger);

// Compression - Compress responses
app.use(compressionMiddleware);

// Request timeout - Prevent hanging requests
app.use(defaultTimeout);

// Metrics middleware - Collect HTTP metrics
app.use(metricsMiddleware);

// Body parser middleware
app.use(bodyParser.json({ limit: config.upload.maxFileSize, extended: true }));
app.use(
  bodyParser.urlencoded({ limit: config.upload.maxFileSize, extended: true })
);

// CORS middleware
app.use(cors(config.cors));

// Input sanitization - Apply globally to all requests
app.use(sanitizeInput);

// Rate limiting
app.use("/api/", defaultRateLimiter);

// Static files
app.use(express.static("public"));

// Request logging (development)
if (config.server.env === "development") {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, { ip: req.ip });
    next();
  });
}

// API Versioning - All API routes are versioned
const apiVersion = config.server.apiVersion || "v1";
const apiBasePath = `/api/${apiVersion}`;

// Health check endpoint (no authentication required, no versioning)
app.use("/health", healthRoutes);

// Metrics endpoint (protected by application token, no versioning)
app.use("/metrics", metricsRoutes);

// API Documentation (Swagger) - Protected by application token, no versioning
app.use("/api-docs", swaggerRoutes);

// Application token verification - Required for all API endpoints
// This middleware applies to all routes under /api/v1/*
app.use(apiBasePath, verifyApplicationToken);

// API Routes - All routes are versioned and require application token
app.use(`${apiBasePath}/products`, productRoutes);
app.use(`${apiBasePath}/user`, userRoutes);
app.use(`${apiBasePath}/carts`, cartRoutes);
app.use(`${apiBasePath}/checkout`, checkoutRoutes);
app.use(`${apiBasePath}/orders`, orderRoutes);
app.use(`${apiBasePath}/notifications`, notificationRoutes);
app.use(`${apiBasePath}/wishlist`, wishlistRoutes);
app.use(`${apiBasePath}/delivery`, deliveryRoutes);
app.use(`${apiBasePath}/returns`, returnRoutes);
app.use(`${apiBasePath}/chat`, chatRoutes);
app.use(`${apiBasePath}/docs`, docsRoutes);
app.use(`${apiBasePath}/payouts`, payoutRoutes);
app.use(`${apiBasePath}/banners`, bannerRoutes);
app.use(`${apiBasePath}/theme`, themeRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  logger.info(`Server listening on port: ${PORT}`, {
    environment: config.server.env,
    port: PORT,
  });
});

// Graceful shutdown handler
gracefulShutdown(server, {
  timeout: 10000, // 10 seconds
  onShutdown: async () => {
    // Add any custom cleanup logic here
    logger.info("Custom shutdown tasks completed");
  },
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(`Port ${PORT} is already in use`, {
      port: PORT,
      suggestion: "Please stop the existing server or use a different port",
    });
    process.exit(1);
  } else {
    logger.error("Server error", { error: error.message, stack: error.stack });
    process.exit(1);
  }
});

// Database connection
mongoose.set("strictQuery", false);
mongoose
  .connect(config.database.uri, config.database.options)
  .then(() => {
    logger.info("MongoDB connected successfully", {
      uri: config.database.uri.replace(/\/\/.*@/, "//***@"), // Hide credentials
    });
  })
  .catch((error) => {
    logger.error("MongoDB connection error", {
      error: error.message || error.toString(),
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    process.exit(1);
  });

const chat = express();
chat.use(cors());

const users = {};

const chatServer = http.createServer(chat);
const io = new Server(chatServer);

chat.get("/", (req, res) => {
  res.send("Chat ready");
});

io.on("connection", (socket) => {
  socket.on("joined", ({ user }) => {
    users[socket.id] = user.email;

    socket.emit("welcome", {
      user: "Admin",
      message: `Welcome to the chat ${users[socket.id]}`,
    });
  });

  socket.on("message", ({ message, userid }) => {
    io.emit("sendMsg", { user: users[userid], message, userid });
  });
});

chatServer.listen(2000, () => {
  console.log(`Chat server listening on port: 2000`);
});

chatServer.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n❌ Port 2000 (chat server) is already in use.`);
    console.error(`   Please stop the existing chat server.\n`);
  } else {
    console.error("Chat server error:", error);
  }
});
