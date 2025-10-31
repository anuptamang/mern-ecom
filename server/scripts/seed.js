import mongoose from "mongoose";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Product from "../models/product.js";
import User from "../models/user.js";

dotenv.config();

async function connect() {
  mongoose.set("strictQuery", false);
  const uri = process.env.MONGODB;
  if (!uri) throw new Error("MONGODB env variable is not set");
  await mongoose.connect(uri);
}

async function seedUser() {
  const email = "test@example.com";
  let user = await User.findOne({ email });
  if (!user) {
    const password = await bcrypt.hash("password123", 12);
    user = await User.create({
      email,
      role: "user",
      password,
      fullName: "Test User",
    });
    console.log(`Created user: ${email} / password123`);
  } else {
    console.log(`User already exists: ${email}`);
  }
  return user;
}

function sampleProducts() {
  return [
    {
      title: "Wireless Mouse",
      body: { summary: "Ergonomic 2.4GHz wireless mouse", price: 24.99 },
      categories: ["electronics"],
      tag: ["mouse", "wireless"],
      slug: "wireless-mouse",
      thumbnail: "",
    },
    {
      title: "Mechanical Keyboard",
      body: { summary: "RGB backlit blue switches", price: 79.99 },
      categories: ["electronics"],
      tag: ["keyboard", "mechanical"],
      slug: "mechanical-keyboard",
      thumbnail: "",
    },
    {
      title: "USB-C Hub",
      body: { summary: "7-in-1 USB-C hub with HDMI", price: 39.99 },
      categories: ["accessories"],
      tag: ["usb-c", "hub"],
      slug: "usb-c-hub",
      thumbnail: "",
    },
  ];
}

async function seedProducts(userId) {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`Products already present: ${count}`);
    return;
  }
  const now = new Date().toISOString();
  const data = sampleProducts().map((p) => ({
    ...p,
    userID: userId,
    createdAt: now,
  }));
  await Product.insertMany(data);
  console.log(`Inserted ${data.length} products.`);
}

async function main() {
  try {
    await connect();
    const user = await seedUser();
    await seedProducts(user._id);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
