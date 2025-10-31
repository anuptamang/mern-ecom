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
      phone: "+1-555-0101",
      secondaryPhone: "+1-555-0102",
      secondaryEmail: "test.secondary@example.com",
      primaryAddress: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
      secondaryAddress: {
        street: "456 Oak Avenue",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90001",
        country: "USA",
      },
    });
    console.log(`Created buyer: ${buyerEmail} / password123`);
  } else {
    console.log(`Buyer already exists: ${buyerEmail}`);
    // Update existing buyer with new fields if not set
    if (!buyer.phone) {
      buyer.phone = "+1-555-0101";
      buyer.secondaryPhone = "+1-555-0102";
      buyer.secondaryEmail = "test.secondary@example.com";
      buyer.primaryAddress = {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      };
      buyer.secondaryAddress = {
        street: "456 Oak Avenue",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90001",
        country: "USA",
      };
      await buyer.save();
      console.log(`Updated buyer with address and contact info`);
    }
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
      phone: "+1-555-0201",
      secondaryPhone: "+1-555-0202",
      secondaryEmail: "seller.secondary@example.com",
      primaryAddress: {
        street: "789 Business Blvd",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102",
        country: "USA",
      },
      secondaryAddress: {
        street: "321 Commerce St",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        country: "USA",
      },
    });
    console.log(`Created seller: ${sellerEmail} / password123`);
  } else {
    console.log(`Seller already exists: ${sellerEmail}`);
    // Update existing seller with new fields if not set
    if (!seller.phone) {
      seller.phone = "+1-555-0201";
      seller.secondaryPhone = "+1-555-0202";
      seller.secondaryEmail = "seller.secondary@example.com";
      seller.primaryAddress = {
        street: "789 Business Blvd",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102",
        country: "USA",
      };
      seller.secondaryAddress = {
        street: "321 Commerce St",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        country: "USA",
      };
      await seller.save();
      console.log(`Updated seller with address and contact info`);
    }
  }

  // Create admin user
  const adminEmail = "admin@example.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const password = await bcrypt.hash("password123", 12);
    admin = await User.create({
      email: adminEmail,
      role: "admin",
      password,
      fullName: "Platform Admin",
      phone: "+1-555-0001",
      primaryAddress: {
        street: "1 Admin Plaza",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
    });
    console.log(`Created admin: ${adminEmail} / password123`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  // Create delivery agency user
  const agencyEmail = "delivery@example.com";
  let deliveryAgency = await User.findOne({ email: agencyEmail });
  if (!deliveryAgency) {
    const password = await bcrypt.hash("password123", 12);
    deliveryAgency = await User.create({
      email: agencyEmail,
      role: "delivery_agency",
      password,
      fullName: "Fast Delivery Co.",
      phone: "+1-555-0301",
      primaryAddress: {
        street: "100 Delivery St",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
      },
    });
    console.log(`Created delivery agency: ${agencyEmail} / password123`);
  } else {
    console.log(`Delivery agency already exists: ${agencyEmail}`);
  }

  // Create delivery person users (belonging to the delivery agency)
  const person1Email = "deliverer1@example.com";
  let deliveryPerson1 = await User.findOne({ email: person1Email });
  if (!deliveryPerson1) {
    const password = await bcrypt.hash("password123", 12);
    deliveryPerson1 = await User.create({
      email: person1Email,
      role: "delivery_person",
      password,
      fullName: "John Delivery",
      phone: "+1-555-0401",
      deliveryAgencyId: deliveryAgency._id,
      primaryAddress: {
        street: "50 Worker Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60602",
        country: "USA",
      },
    });
    console.log(`Created delivery person: ${person1Email} / password123`);
  } else {
    console.log(`Delivery person 1 already exists: ${person1Email}`);
  }

  const person2Email = "deliverer2@example.com";
  let deliveryPerson2 = await User.findOne({ email: person2Email });
  if (!deliveryPerson2) {
    const password = await bcrypt.hash("password123", 12);
    deliveryPerson2 = await User.create({
      email: person2Email,
      role: "delivery_person",
      password,
      fullName: "Jane Courier",
      phone: "+1-555-0402",
      deliveryAgencyId: deliveryAgency._id,
      primaryAddress: {
        street: "51 Worker Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60602",
        country: "USA",
      },
    });
    console.log(`Created delivery person: ${person2Email} / password123`);
  } else {
    console.log(`Delivery person 2 already exists: ${person2Email}`);
  }

  return {
    buyer,
    seller,
    admin,
    deliveryAgency,
    deliveryPerson1,
    deliveryPerson2,
  };
}

function sampleProducts() {
  return [
    // Electronics
    {
      title: "Wireless Mouse",
      body: {
        summary: "Ergonomic 2.4GHz wireless mouse with long battery life",
        price: 24.99,
      },
      categories: ["electronics"],
      tag: ["mouse", "wireless", "computer"],
      slug: "wireless-mouse",
      thumbnail: "",
      stock: 50,
      price: 24.99,
    },
    {
      title: "Mechanical Keyboard",
      body: {
        summary: "RGB backlit mechanical keyboard with blue switches",
        price: 79.99,
      },
      categories: ["electronics"],
      tag: ["keyboard", "mechanical", "rgb"],
      slug: "mechanical-keyboard",
      thumbnail: "",
      stock: 30,
      price: 79.99,
    },
    {
      title: "USB-C Hub",
      body: {
        summary: "7-in-1 USB-C hub with HDMI, USB 3.0, and card reader",
        price: 39.99,
      },
      categories: ["electronics", "accessories"],
      tag: ["usb-c", "hub", "adapter"],
      slug: "usb-c-hub",
      thumbnail: "",
      stock: 45,
      price: 39.99,
    },
    {
      title: "Wireless Headphones",
      body: {
        summary: "Noise-cancelling wireless headphones with 30-hour battery",
        price: 129.99,
      },
      categories: ["electronics"],
      tag: ["headphones", "wireless", "audio"],
      slug: "wireless-headphones",
      thumbnail: "",
      stock: 25,
      price: 129.99,
    },
    {
      title: "USB Flash Drive 64GB",
      body: {
        summary: "High-speed USB 3.0 flash drive with 64GB capacity",
        price: 12.99,
      },
      categories: ["electronics"],
      tag: ["usb", "storage", "flash-drive"],
      slug: "usb-flash-drive-64gb",
      thumbnail: "",
      stock: 100,
      price: 12.99,
    },
    {
      title: "Webcam HD 1080p",
      body: {
        summary: "Full HD 1080p webcam with built-in microphone",
        price: 49.99,
      },
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
      body: {
        summary: "Adjustable aluminum laptop stand for better ergonomics",
        price: 29.99,
      },
      categories: ["accessories"],
      tag: ["laptop", "stand", "ergonomic"],
      slug: "laptop-stand",
      thumbnail: "",
      stock: 40,
      price: 29.99,
    },
    {
      title: "Phone Case",
      body: {
        summary: "Protective phone case with shock absorption",
        price: 19.99,
      },
      categories: ["accessories"],
      tag: ["phone", "case", "protection"],
      slug: "phone-case",
      thumbnail: "",
      stock: 80,
      price: 19.99,
    },
    {
      title: "Laptop Bag",
      body: {
        summary: "Water-resistant laptop bag with padded compartment",
        price: 59.99,
      },
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
      body: {
        summary: "100% cotton comfortable t-shirt in various colors",
        price: 24.99,
      },
      categories: ["clothing"],
      tag: ["tshirt", "cotton", "apparel"],
      slug: "cotton-tshirt",
      thumbnail: "",
      stock: 150,
      price: 24.99,
    },
    {
      title: "Denim Jeans",
      body: {
        summary: "Classic fit denim jeans in multiple sizes",
        price: 49.99,
      },
      categories: ["clothing"],
      tag: ["jeans", "denim", "apparel"],
      slug: "denim-jeans",
      thumbnail: "",
      stock: 60,
      price: 49.99,
    },
    {
      title: "Running Shoes",
      body: {
        summary: "Lightweight running shoes with cushioned sole",
        price: 79.99,
      },
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
      body: {
        summary: "Comprehensive guide to modern JavaScript programming",
        price: 34.99,
      },
      categories: ["books"],
      tag: ["javascript", "programming", "education"],
      slug: "javascript-guide",
      thumbnail: "",
      stock: 25,
      price: 34.99,
    },
    {
      title: "Design Patterns Book",
      body: {
        summary: "Essential design patterns for software development",
        price: 39.99,
      },
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
      body: {
        summary: "Programmable coffee maker with 12-cup capacity",
        price: 89.99,
      },
      categories: ["home", "kitchen"],
      tag: ["coffee", "maker", "appliance"],
      slug: "coffee-maker",
      thumbnail: "",
      stock: 30,
      price: 89.99,
    },
    {
      title: "Bluetooth Speaker",
      body: {
        summary: "Portable Bluetooth speaker with 360-degree sound",
        price: 49.99,
      },
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
      body: {
        summary: "Classic vintage watch with leather strap",
        price: 149.99,
      },
      categories: ["accessories"],
      tag: ["watch", "vintage", "timepiece"],
      slug: "vintage-watch",
      thumbnail: "",
      stock: 0,
      price: 149.99,
    },
    {
      title: "Limited Edition Headphones",
      body: {
        summary: "Premium limited edition headphones with wood accents",
        price: 299.99,
      },
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
  const now = new Date();
  const data = sampleProducts().map((p) => ({
    ...p,
    userID: sellerId,
    estimatedDeliveryDays: 7, // Default delivery time
    createdAt: now,
    views: 0,
    likes: 0,
    rating: 0,
    ratings: [],
    comments: [],
    images: [], // Gallery images array
  }));
  await Product.insertMany(data);
  console.log(`Inserted ${data.length} products.`);
}

async function resetDatabase() {
  console.log("Resetting database...");
  try {
    // Drop all collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }
    console.log("Database reset completed.");
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
}

async function main() {
  const reset = process.argv.includes("--reset");

  try {
    await connect();

    if (reset) {
      await resetDatabase();
    }

    const {
      buyer,
      seller,
      admin,
      deliveryAgency,
      deliveryPerson1,
      deliveryPerson2,
    } = await seedUser();
    await seedProducts(seller._id);
    console.log("Seeding completed successfully!");
    console.log("\n=== Test Credentials ===");
    console.log("Admin: admin@example.com / password123");
    console.log("Buyer: test@example.com / password123");
    console.log("Seller: seller@example.com / password123");
    console.log("Delivery Agency: delivery@example.com / password123");
    console.log("Delivery Person 1: deliverer1@example.com / password123");
    console.log("Delivery Person 2: deliverer2@example.com / password123");
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
