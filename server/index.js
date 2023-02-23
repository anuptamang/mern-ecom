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

const app = express();

app.use(bodyParser.json({ limit: "20mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));

app.use(cors());

app.use(express.static("public"));

app.use("/products", productRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 3010;

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));

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

const server = http.createServer(chat);
const io = new Server(server);

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

server.listen(2000, () => {
  console.log(`Server listening on port: 2000`);
});
