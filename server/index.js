import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server, Socket } from "socket.io";
import config from "./config/index.js";
import { logger } from "./utils/index.js";
import { errorHandler } from "./utils/errorHandler.js";
import { defaultRateLimiter } from "./middlewares/rateLimiter.js";

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
import healthRoutes from "./routes/health.js";

const app = express();

// Body parser middleware
app.use(bodyParser.json({ limit: config.upload.maxFileSize, extended: true }));
app.use(bodyParser.urlencoded({ limit: config.upload.maxFileSize, extended: true }));

// CORS middleware
app.use(cors(config.cors));

// Rate limiting
app.use('/api/', defaultRateLimiter);

// Static files
app.use(express.static("public"));

// Request logging (development)
if (config.server.env === 'development') {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, { ip: req.ip });
    next();
  });
}

// API Routes
app.use("/products", productRoutes);
app.use("/user", userRoutes);
app.use("/carts", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/orders", orderRoutes);
app.use("/notifications", notificationRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/delivery", deliveryRoutes);
app.use("/returns", returnRoutes);
app.use("/chat", chatRoutes);
app.use("/docs", docsRoutes);
app.use("/payouts", payoutRoutes);
app.use("/banners", bannerRoutes);

// Health check endpoint
app.use("/health", healthRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  logger.info(`Server listening on port: ${PORT}`, {
    environment: config.server.env,
    port: PORT,
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`, {
      port: PORT,
      suggestion: 'Please stop the existing server or use a different port',
    });
    process.exit(1);
  } else {
    logger.error('Server error', { error: error.message, stack: error.stack });
    process.exit(1);
  }
});

// Database connection
mongoose.set("strictQuery", false);
mongoose
  .connect(config.database.uri, config.database.options)
  .then(() => {
    logger.info("MongoDB connected successfully", {
      uri: config.database.uri.replace(/\/\/.*@/, '//***@'), // Hide credentials
    });
  })
  .catch((error) => {
    logger.error("MongoDB connection error", { error: error.message });
    process.exit(1);
  });

const chat = express();
chat.use(cors());

const users = [{}];

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

chatServer.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port 2000 (chat server) is already in use.`);
    console.error(`   Please stop the existing chat server.\n`);
  } else {
    console.error('Chat server error:', error);
  }
});
