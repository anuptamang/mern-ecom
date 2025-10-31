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
  // Create buyer user
  const buyerEmail = "test@example.com";
  let buyer = await User.findOne({ email: buyerEmail });
  if (!buyer) {
    const password = await bcrypt.hash("password123", 12);
    buyer = await User.create({
      email: buyerEmail,
      role: "user",
      password,
      fullName: "Test User",
    });
    console.log(`Created buyer: ${buyerEmail} / password123`);
  } else {
    console.log(`Buyer already exists: ${buyerEmail}`);
  }

  // Create seller user
  const sellerEmail = "seller@example.com";
  let seller = await User.findOne({ email: sellerEmail });
  if (!seller) {
    const password = await bcrypt.hash("password123", 12);
    seller = await User.create({
      email: sellerEmail,
      role: "seller",
      password,
      fullName: "Test Seller",
    });
    console.log(`Created seller: ${sellerEmail} / password123`);
  } else {
    console.log(`Seller already exists: ${sellerEmail}`);
  }

  return { buyer, seller };
}

function sampleProducts() {
  return [
    // Electronics
    {
      title: "Wireless Mouse",
      body: { summary: "Ergonomic 2.4GHz wireless mouse with long battery life", price: 24.99 },
      categories: ["electronics"],
      tag: ["mouse", "wireless", "computer"],
      slug: "wireless-mouse",
      thumbnail: "",
      stock: 50,
      price: 24.99,
    },
    {
      title: "Mechanical Keyboard",
      body: { summary: "RGB backlit mechanical keyboard with blue switches", price: 79.99 },
      categories: ["electronics"],
      tag: ["keyboard", "mechanical", "rgb"],
      slug: "mechanical-keyboard",
      thumbnail: "",
      stock: 30,
      price: 79.99,
    },
    {
      title: "USB-C Hub",
      body: { summary: "7-in-1 USB-C hub with HDMI, USB 3.0, and card reader", price: 39.99 },
      categories: ["electronics", "accessories"],
      tag: ["usb-c", "hub", "adapter"],
      slug: "usb-c-hub",
      thumbnail: "",
      stock: 45,
      price: 39.99,
    },
    {
      title: "Wireless Headphones",
      body: { summary: "Noise-cancelling wireless headphones with 30-hour battery", price: 129.99 },
      categories: ["electronics"],
      tag: ["headphones", "wireless", "audio"],
      slug: "wireless-headphones",
      thumbnail: "",
      stock: 25,
      price: 129.99,
    },
    {
      title: "USB Flash Drive 64GB",
      body: { summary: "High-speed USB 3.0 flash drive with 64GB capacity", price: 12.99 },
      categories: ["electronics"],
      tag: ["usb", "storage", "flash-drive"],
      slug: "usb-flash-drive-64gb",
      thumbnail: "",
      stock: 100,
      price: 12.99,
    },
    {
      title: "Webcam HD 1080p",
      body: { summary: "Full HD 1080p webcam with built-in microphone", price: 49.99 },
      categories: ["electronics"],
      tag: ["webcam", "camera", "video"],
      slug: "webcam-hd-1080p",
      thumbnail: "",
      stock: 35,
      price: 49.99,
    },
    // Accessories
    {
      title: "Laptop Stand",
      body: { summary: "Adjustable aluminum laptop stand for better ergonomics", price: 29.99 },
      categories: ["accessories"],
      tag: ["laptop", "stand", "ergonomic"],
      slug: "laptop-stand",
      thumbnail: "",
      stock: 40,
      price: 29.99,
    },
    {
      title: "Phone Case",
      body: { summary: "Protective phone case with shock absorption", price: 19.99 },
      categories: ["accessories"],
      tag: ["phone", "case", "protection"],
      slug: "phone-case",
      thumbnail: "",
      stock: 80,
      price: 19.99,
    },
    {
      title: "Laptop Bag",
      body: { summary: "Water-resistant laptop bag with padded compartment", price: 59.99 },
      categories: ["accessories"],
      tag: ["laptop", "bag", "backpack"],
      slug: "laptop-bag",
      thumbnail: "",
      stock: 20,
      price: 59.99,
    },
    // Clothing
    {
      title: "Cotton T-Shirt",
      body: { summary: "100% cotton comfortable t-shirt in various colors", price: 24.99 },
      categories: ["clothing"],
      tag: ["tshirt", "cotton", "apparel"],
      slug: "cotton-tshirt",
      thumbnail: "",
      stock: 150,
      price: 24.99,
    },
    {
      title: "Denim Jeans",
      body: { summary: "Classic fit denim jeans in multiple sizes", price: 49.99 },
      categories: ["clothing"],
      tag: ["jeans", "denim", "apparel"],
      slug: "denim-jeans",
      thumbnail: "",
      stock: 60,
      price: 49.99,
    },
    {
      title: "Running Shoes",
      body: { summary: "Lightweight running shoes with cushioned sole", price: 79.99 },
      categories: ["clothing", "sports"],
      tag: ["shoes", "running", "sports"],
      slug: "running-shoes",
      thumbnail: "",
      stock: 40,
      price: 79.99,
    },
    // Books
    {
      title: "JavaScript Guide",
      body: { summary: "Comprehensive guide to modern JavaScript programming", price: 34.99 },
      categories: ["books"],
      tag: ["javascript", "programming", "education"],
      slug: "javascript-guide",
      thumbnail: "",
      stock: 25,
      price: 34.99,
    },
    {
      title: "Design Patterns Book",
      body: { summary: "Essential design patterns for software development", price: 39.99 },
      categories: ["books"],
      tag: ["design", "patterns", "programming"],
      slug: "design-patterns-book",
      thumbnail: "",
      stock: 15,
      price: 39.99,
    },
    // Home & Kitchen
    {
      title: "Coffee Maker",
      body: { summary: "Programmable coffee maker with 12-cup capacity", price: 89.99 },
      categories: ["home", "kitchen"],
      tag: ["coffee", "maker", "appliance"],
      slug: "coffee-maker",
      thumbnail: "",
      stock: 30,
      price: 89.99,
    },
    {
      title: "Bluetooth Speaker",
      body: { summary: "Portable Bluetooth speaker with 360-degree sound", price: 49.99 },
      categories: ["electronics", "home"],
      tag: ["speaker", "bluetooth", "audio"],
      slug: "bluetooth-speaker",
      thumbnail: "",
      stock: 50,
      price: 49.99,
    },
    // Some out of stock items
    {
      title: "Vintage Watch",
      body: { summary: "Classic vintage watch with leather strap", price: 149.99 },
      categories: ["accessories"],
      tag: ["watch", "vintage", "timepiece"],
      slug: "vintage-watch",
      thumbnail: "",
      stock: 0,
      price: 149.99,
    },
    {
      title: "Limited Edition Headphones",
      body: { summary: "Premium limited edition headphones with wood accents", price: 299.99 },
      categories: ["electronics"],
      tag: ["headphones", "premium", "limited"],
      slug: "limited-edition-headphones",
      thumbnail: "",
      stock: 0,
      price: 299.99,
    },
  ];
}

async function seedProducts(sellerId) {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`Products already present: ${count}`);
    return;
  }
  const now = new Date().toISOString();
  const data = sampleProducts().map((p) => ({
    ...p,
    userID: sellerId,
    createdAt: now,
  }));
  await Product.insertMany(data);
  console.log(`Inserted ${data.length} products.`);
}

async function main() {
  try {
    await connect();
    const { buyer, seller } = await seedUser();
    await seedProducts(seller._id);
    console.log("Seeding completed successfully!");
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
