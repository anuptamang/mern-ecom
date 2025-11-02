import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import http from "http";
import { Server, Socket } from "socket.io";
dotenv.config();

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

const app = express();

app.use(bodyParser.json({ limit: "20mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));

app.use(cors());

app.use(express.static("public"));

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

const PORT = process.env.PORT || 3010;

const server = app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Please stop the existing server or use a different port.`);
    console.error(`   You can run: npm run dev:stop\n`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => console.log(error));

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
