import mongoose from "mongoose";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { resolve as resolvePath } from "path";
import { dirname } from "path";
import Product from "../models/product.js";
import User from "../models/user.js";

// Load environment variables from server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolvePath(__dirname, "../.env") });

async function connect() {
  mongoose.set("strictQuery", false);
  const uri = process.env.MONGODB;
  if (!uri) throw new Error("MONGODB env variable is not set");
  await mongoose.connect(uri);
}

// Helper function to safely create a user, handling duplicates
async function createUserSafely(userData) {
  try {
    const user = await User.create(userData);
    console.log(`Created ${userData.role}: ${userData.email} / password123`);
    return user;
  } catch (error) {
    // If user already exists (duplicate key error), fetch it
    if (error.code === 11000 || error.message?.includes("duplicate")) {
      const existingUser = await User.findOne({ email: userData.email });
      console.log(
        `${userData.role} already exists (caught duplicate): ${userData.email}`
      );
      return existingUser;
    } else {
      throw error;
    }
  }
}

export async function seedUser() {
  // Create buyer user
  const buyerEmail = "buyer@example.com";
  let buyer = await User.findOne({ email: buyerEmail });
  if (!buyer) {
    const password = await bcrypt.hash("password123", 12);
    buyer = await createUserSafely({
      email: buyerEmail,
      role: "user",
      password,
      fullName: "Test Buyer",
      phone: "+1-555-0101",
      secondaryPhone: "+1-555-0102",
      secondaryEmail: "buyer.secondary@example.com",
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
    seller = await createUserSafely({
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
    admin = await createUserSafely({
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
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  // Create delivery agency user
  const agencyEmail = "delivery@example.com";
  let deliveryAgency = await User.findOne({ email: agencyEmail });
  if (!deliveryAgency) {
    const password = await bcrypt.hash("password123", 12);
    deliveryAgency = await createUserSafely({
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
  } else {
    console.log(`Delivery agency already exists: ${agencyEmail}`);
  }

  if (!deliveryAgency) {
    throw new Error("Failed to create or find delivery agency");
  }

  // Create support user
  const supportEmail = "support@example.com";
  let support = await User.findOne({ email: supportEmail });
  if (!support) {
    const password = await bcrypt.hash("password123", 12);
    support = await createUserSafely({
      email: supportEmail,
      role: "support",
      password,
      fullName: "Support Team",
      phone: "+1-555-0501",
      primaryAddress: {
        street: "200 Support Center",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
    });
  } else {
    console.log(`Support user already exists: ${supportEmail}`);
  }

  // Create delivery person users (belonging to the delivery agency)
  const person1Email = "deliverer1@example.com";
  let deliveryPerson1 = await User.findOne({ email: person1Email });
  if (!deliveryPerson1) {
    const password = await bcrypt.hash("password123", 12);
    deliveryPerson1 = await createUserSafely({
      email: person1Email,
      role: "delivery_person",
      password,
      fullName: "John Delivery",
      phone: "+1-555-0401",
      deliveryAgencyId: deliveryAgency?._id,
      delivererType: "warehouse",
      primaryAddress: {
        street: "50 Worker Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60602",
        country: "USA",
      },
    });
  } else {
    console.log(`Delivery person 1 already exists: ${person1Email}`);
  }

  const person2Email = "deliverer2@example.com";
  let deliveryPerson2 = await User.findOne({ email: person2Email });
  if (!deliveryPerson2) {
    const password = await bcrypt.hash("password123", 12);
    deliveryPerson2 = await createUserSafely({
      email: person2Email,
      role: "delivery_person",
      password,
      fullName: "Jane Courier",
      phone: "+1-555-0402",
      deliveryAgencyId: deliveryAgency?._id,
      delivererType: "customer_delivery",
      primaryAddress: {
        street: "51 Worker Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60602",
        country: "USA",
      },
    });
  } else {
    console.log(`Delivery person 2 already exists: ${person2Email}`);
    // Update existing deliverer to customer_delivery type if needed
    if (deliveryPerson2.delivererType !== "customer_delivery") {
      deliveryPerson2.delivererType = "customer_delivery";
      await deliveryPerson2.save();
      console.log(`Updated delivery person 2 to customer_delivery type`);
    }
  }

  // Create customer return deliverer
  const person3Email = "return_deliverer2@example.com";
  let deliveryPerson3 = await User.findOne({ email: person3Email });
  if (!deliveryPerson3) {
    const password = await bcrypt.hash("password123", 12);
    deliveryPerson3 = await createUserSafely({
      email: person3Email,
      role: "delivery_person",
      password,
      fullName: "Return Courier",
      phone: "+1-555-0403",
      deliveryAgencyId: deliveryAgency?._id,
      delivererType: "customer_return",
      primaryAddress: {
        street: "52 Worker Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60602",
        country: "USA",
      },
    });
  } else {
    console.log(`Return deliverer already exists: ${person3Email}`);
    // Update existing deliverer if role is incorrect
    if (
      deliveryPerson3.role !== "delivery_person" ||
      deliveryPerson3.delivererType !== "customer_return"
    ) {
      deliveryPerson3.role = "delivery_person";
      deliveryPerson3.delivererType = "customer_return";
      if (deliveryAgency && deliveryAgency._id) {
        deliveryPerson3.deliveryAgencyId = deliveryAgency._id;
      }
      await deliveryPerson3.save();
      console.log(
        `Updated return deliverer ${person3Email} to correct role and type`
      );
    }
  }

  // Create warehouse operator user
  const warehouseOperatorEmail = "warehouse@example.com";
  let warehouseOperator = await User.findOne({ email: warehouseOperatorEmail });
  if (!warehouseOperator) {
    const password = await bcrypt.hash("password123", 12);
    warehouseOperator = await createUserSafely({
      email: warehouseOperatorEmail,
      role: "warehouse_operator",
      password,
      fullName: "Bob Warehouse",
      phone: "+1-555-0501",
      primaryAddress: {
        street: "100 Warehouse Blvd",
        city: "Chicago",
        state: "IL",
        zipCode: "60603",
        country: "USA",
      },
    });
  } else {
    console.log(`Warehouse operator already exists: ${warehouseOperatorEmail}`);
  }

  // Create support user
  const supportUserEmail = "support_user@example.com";
  let supportUser = await User.findOne({ email: supportUserEmail });
  if (!supportUser) {
    const password = await bcrypt.hash("password123", 12);
    supportUser = await createUserSafely({
      email: supportUserEmail,
      role: "support_user",
      password,
      fullName: "Support User",
      phone: "+1-555-0601",
      primaryAddress: {
        street: "200 Support St",
        city: "New York",
        state: "NY",
        zipCode: "10002",
        country: "USA",
      },
    });
  } else {
    console.log(`Support user already exists: ${supportUserEmail}`);
  }

  // Create verification team user
  const verificationTeamEmail = "verification@example.com";
  let verificationTeam = await User.findOne({ email: verificationTeamEmail });
  if (!verificationTeam) {
    const password = await bcrypt.hash("password123", 12);
    verificationTeam = await createUserSafely({
      email: verificationTeamEmail,
      role: "verification_team",
      password,
      fullName: "Verification Team",
      phone: "+1-555-0701",
      primaryAddress: {
        street: "300 Verification Ave",
        city: "New York",
        state: "NY",
        zipCode: "10003",
        country: "USA",
      },
    });
  } else {
    console.log(`Verification team already exists: ${verificationTeamEmail}`);
  }

  // Create return inspector user
  const inspectorEmail = "inspector@example.com";
  let inspector = await User.findOne({ email: inspectorEmail });
  if (!inspector) {
    const password = await bcrypt.hash("password123", 12);
    inspector = await createUserSafely({
      email: inspectorEmail,
      role: "return_inspector",
      password,
      fullName: "Return Inspector",
      phone: "+1-555-0801",
      primaryAddress: {
        street: "400 Inspection Blvd",
        city: "New York",
        state: "NY",
        zipCode: "10004",
        country: "USA",
      },
    });
  } else {
    console.log(`Return inspector already exists: ${inspectorEmail}`);
  }

  // Create return deliverer user
  const returnDelivererEmail = "return_deliverer1@example.com";
  let returnDeliverer = await User.findOne({ email: returnDelivererEmail });
  if (!returnDeliverer) {
    const password = await bcrypt.hash("password123", 12);
    returnDeliverer = await createUserSafely({
      email: returnDelivererEmail,
      role: "delivery_person",
      password,
      fullName: "Return Deliverer",
      phone: "+1-555-0901",
      deliveryAgencyId: deliveryAgency._id,
      delivererType: "customer_return",
      primaryAddress: {
        street: "500 Return St",
        city: "Chicago",
        state: "IL",
        zipCode: "60604",
        country: "USA",
      },
    });
  } else {
    console.log(`Return deliverer already exists: ${returnDelivererEmail}`);
    // Update existing deliverer if role is incorrect
    if (
      returnDeliverer.role !== "delivery_person" ||
      returnDeliverer.delivererType !== "customer_return"
    ) {
      returnDeliverer.role = "delivery_person";
      returnDeliverer.delivererType = "customer_return";
      if (deliveryAgency && deliveryAgency._id) {
        returnDeliverer.deliveryAgencyId = deliveryAgency._id;
      }
      await returnDeliverer.save();
      console.log(
        `Updated return deliverer ${returnDelivererEmail} to correct role and type`
      );
    }
  }

  // Create finance user
  const financeEmail = "finance@example.com";
  let finance = await User.findOne({ email: financeEmail });
  if (!finance) {
    const password = await bcrypt.hash("password123", 12);
    finance = await createUserSafely({
      email: financeEmail,
      role: "finance",
      password,
      fullName: "Finance Team",
      phone: "+1-555-1001",
      primaryAddress: {
        street: "600 Finance Ave",
        city: "New York",
        state: "NY",
        zipCode: "10005",
        country: "USA",
      },
    });
  } else {
    console.log(`Finance user already exists: ${financeEmail}`);
  }

  return {
    buyer,
    seller,
    admin,
    deliveryAgency,
    deliveryPerson1,
    deliveryPerson2,
    deliveryPerson3,
    warehouseOperator,
    support,
    supportUser,
    verificationTeam,
    inspector,
    returnDeliverer,
    finance,
  };
}

function sampleProducts() {
  return [
    // Electronics
    {
      title: "Wireless Mouse",
      body: {
        summary: "Ergonomic 2.4GHz wireless mouse with long battery life",
        description:
          "<p>Experience comfort and precision with our wireless mouse. Features include:</p><ul><li>2.4GHz wireless connection</li><li>Long battery life (up to 12 months)</li><li>Ergonomic design</li><li>High-precision optical sensor</li></ul>",
        price: 24.99,
      },
      categories: ["electronics"],
      tag: ["mouse", "wireless", "computer", "flash-sale"],
      slug: "wireless-mouse",
      thumbnail:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1558017487-06bf9f8266a0?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1535551951406-a19828b0a76b?w=800&h=800&fit=crop",
      ],
      stock: 50,
      price: 24.99,
      estimatedDeliveryDays: 5,
    },
    {
      title: "Mechanical Keyboard",
      body: {
        summary: "RGB backlit mechanical keyboard with blue switches",
        description:
          "<p>Premium mechanical keyboard featuring RGB backlighting, blue switches for tactile feedback, and programmable keys.</p>",
        price: 79.99,
      },
      categories: ["electronics"],
      tag: ["keyboard", "mechanical", "rgb", "flash-sale"],
      slug: "mechanical-keyboard",
      thumbnail:
        "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1587829741301-dc508b5ade48?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1618384887929-16ec33cab9ef?w=800&h=800&fit=crop",
      ],
      stock: 30,
      price: 79.99,
      estimatedDeliveryDays: 4,
    },
    {
      title: "USB-C Hub",
      body: {
        summary: "7-in-1 USB-C hub with HDMI, USB 3.0, and card reader",
        description:
          "<p>Expand your connectivity with this versatile 7-in-1 USB-C hub featuring HDMI output, multiple USB 3.0 ports, and SD card reader.</p>",
        price: 39.99,
      },
      categories: ["electronics", "accessories"],
      tag: ["usb-c", "hub", "adapter"],
      slug: "usb-c-hub",
      thumbnail:
        "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&h=800&fit=crop",
      ],
      stock: 45,
      price: 39.99,
      estimatedDeliveryDays: 3,
    },
    {
      title: "Wireless Headphones",
      body: {
        summary: "Noise-cancelling wireless headphones with 30-hour battery",
        description:
          "<p>Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality.</p>",
        price: 129.99,
      },
      categories: ["electronics"],
      tag: ["headphones", "wireless", "audio"],
      slug: "wireless-headphones",
      thumbnail:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1599669454699-248893623440?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop",
      ],
      stock: 25,
      price: 129.99,
      estimatedDeliveryDays: 5,
    },
    {
      title: "USB Flash Drive 64GB",
      body: {
        summary: "High-speed USB 3.0 flash drive with 64GB capacity",
        description:
          "<p>Compact and reliable USB 3.0 flash drive with 64GB storage capacity, perfect for transferring files quickly.</p>",
        price: 12.99,
      },
      categories: ["electronics"],
      tag: ["usb", "storage", "flash-drive", "flash-sale"],
      slug: "usb-flash-drive-64gb",
      thumbnail:
        "https://images.unsplash.com/photo-1591488320449-11f483a1c43d?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1591488320449-11f483a1c43d?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=800&fit=crop",
      ],
      stock: 100,
      price: 12.99,
      estimatedDeliveryDays: 2,
    },
    {
      title: "Webcam HD 1080p",
      body: {
        summary: "Full HD 1080p webcam with built-in microphone",
        description:
          "<p>Professional-grade 1080p webcam with built-in noise-cancelling microphone, perfect for video calls and streaming.</p>",
        price: 49.99,
      },
      categories: ["electronics"],
      tag: ["webcam", "camera", "video"],
      slug: "webcam-hd-1080p",
      thumbnail:
        "https://images.unsplash.com/photo-1587825147138-346c2290b8db?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1587825147138-346c2290b8db?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=800&fit=crop",
      ],
      stock: 35,
      price: 49.99,
      estimatedDeliveryDays: 4,
    },
    // Accessories
    {
      title: "Laptop Stand",
      body: {
        summary: "Adjustable aluminum laptop stand for better ergonomics",
        description:
          "<p>Improve your workspace ergonomics with this sturdy aluminum laptop stand. Adjustable height and angle for maximum comfort.</p>",
        price: 29.99,
      },
      categories: ["accessories"],
      tag: ["laptop", "stand", "ergonomic"],
      slug: "laptop-stand",
      thumbnail:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1522143049013-251a16e91605?w=800&h=800&fit=crop",
      ],
      stock: 40,
      price: 29.99,
      estimatedDeliveryDays: 4,
    },
    {
      title: "Phone Case",
      body: {
        summary: "Protective phone case with shock absorption",
        description:
          "<p>Keep your phone safe with this durable protective case featuring advanced shock absorption technology and raised edges for screen protection.</p>",
        price: 19.99,
      },
      categories: ["accessories"],
      tag: ["phone", "case", "protection", "flash-sale"],
      slug: "phone-case",
      thumbnail:
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop",
      ],
      stock: 80,
      price: 19.99,
      estimatedDeliveryDays: 3,
    },
    {
      title: "Laptop Bag",
      body: {
        summary: "Water-resistant laptop bag with padded compartment",
        description:
          "<p>Carry your laptop safely with this water-resistant bag featuring a padded compartment for maximum protection, multiple pockets, and comfortable shoulder straps.</p>",
        price: 59.99,
      },
      categories: ["accessories"],
      tag: ["laptop", "bag", "backpack"],
      slug: "laptop-bag",
      thumbnail:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&h=800&fit=crop",
      ],
      stock: 20,
      price: 59.99,
      estimatedDeliveryDays: 5,
    },
    // Clothing
    {
      title: "Cotton T-Shirt",
      body: {
        summary: "100% cotton comfortable t-shirt in various colors",
        description:
          "<p>Soft and comfortable 100% cotton t-shirt available in multiple colors and sizes. Pre-shrunk fabric ensures long-lasting fit.</p>",
        price: 24.99,
      },
      categories: ["clothing"],
      tag: ["tshirt", "cotton", "apparel", "flash-sale"],
      slug: "cotton-tshirt",
      thumbnail:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1594938291221-94f98832df97?w=800&h=800&fit=crop",
      ],
      stock: 150,
      price: 24.99,
      estimatedDeliveryDays: 4,
    },
    {
      title: "Denim Jeans",
      body: {
        summary: "Classic fit denim jeans in multiple sizes",
        description:
          "<p>Timeless classic fit denim jeans crafted from premium denim fabric. Available in multiple sizes and washes.</p>",
        price: 49.99,
      },
      categories: ["clothing"],
      tag: ["jeans", "denim", "apparel"],
      slug: "denim-jeans",
      thumbnail:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1582418702059-97ebaf902b0f?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&h=800&fit=crop",
      ],
      stock: 60,
      price: 49.99,
      estimatedDeliveryDays: 5,
    },
    {
      title: "Running Shoes",
      body: {
        summary: "Lightweight running shoes with cushioned sole",
        description:
          "<p>Perfect for your daily runs, these lightweight shoes feature advanced cushioning technology, breathable mesh upper, and durable rubber outsole.</p>",
        price: 79.99,
      },
      categories: ["clothing", "sports"],
      tag: ["shoes", "running", "sports"],
      slug: "running-shoes",
      thumbnail:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop",
      ],
      stock: 40,
      price: 79.99,
      estimatedDeliveryDays: 6,
    },
    // Books
    {
      title: "JavaScript Guide",
      body: {
        summary: "Comprehensive guide to modern JavaScript programming",
        description:
          "<p>A complete reference guide covering modern JavaScript features, ES6+, async/await, modules, and best practices for web development.</p>",
        price: 34.99,
      },
      categories: ["books"],
      tag: ["javascript", "programming", "education"],
      slug: "javascript-guide",
      thumbnail:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1532619675605-1ede6c7edf48?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
      ],
      stock: 25,
      price: 34.99,
      estimatedDeliveryDays: 7,
    },
    {
      title: "Design Patterns Book",
      body: {
        summary: "Essential design patterns for software development",
        description:
          "<p>Learn essential software design patterns and when to apply them in your projects. Includes creational, structural, and behavioral patterns with practical examples.</p>",
        price: 39.99,
      },
      categories: ["books"],
      tag: ["design", "patterns", "programming"],
      slug: "design-patterns-book",
      thumbnail:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1532619675605-1ede6c7edf48?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=800&fit=crop",
      ],
      stock: 15,
      price: 39.99,
      estimatedDeliveryDays: 7,
    },
    // Home & Kitchen
    {
      title: "Coffee Maker",
      body: {
        summary: "Programmable coffee maker with 12-cup capacity",
        description:
          "<p>Start your day right with this programmable coffee maker featuring a 12-cup capacity, auto-shutoff, and programmable start time.</p>",
        price: 89.99,
      },
      categories: ["home", "kitchen"],
      tag: ["coffee", "maker", "appliance"],
      slug: "coffee-maker",
      thumbnail:
        "https://images.unsplash.com/photo-1517668808823-6c8b58a1d2b7?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1517668808823-6c8b58a1d2b7?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop",
      ],
      stock: 30,
      price: 89.99,
      estimatedDeliveryDays: 5,
    },
    {
      title: "Bluetooth Speaker",
      body: {
        summary: "Portable Bluetooth speaker with 360-degree sound",
        description:
          "<p>Enjoy immersive 360-degree sound with this portable Bluetooth speaker perfect for any room. Water-resistant design and 12-hour battery life.</p>",
        price: 49.99,
      },
      categories: ["electronics", "home"],
      tag: ["speaker", "bluetooth", "audio", "flash-sale"],
      slug: "bluetooth-speaker",
      thumbnail:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
      ],
      stock: 50,
      price: 49.99,
      estimatedDeliveryDays: 4,
    },
    // Some out of stock items (for wishlist testing)
    {
      title: "Vintage Watch",
      body: {
        summary: "Classic vintage watch with leather strap",
        description:
          "<p>A timeless vintage watch featuring a genuine leather strap, classic design elements, and precise quartz movement.</p>",
        price: 149.99,
      },
      categories: ["accessories"],
      tag: ["watch", "vintage", "timepiece"],
      slug: "vintage-watch",
      thumbnail:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1462329813135-65fc917bc31c?w=800&h=800&fit=crop",
      ],
      stock: 0,
      price: 149.99,
      estimatedDeliveryDays: 7,
    },
    {
      title: "Limited Edition Headphones",
      body: {
        summary: "Premium limited edition headphones with wood accents",
        description:
          "<p>Exclusive limited edition headphones featuring premium wood accents, exceptional sound quality, and handcrafted design. Only 100 units available worldwide.</p>",
        price: 299.99,
      },
      categories: ["electronics"],
      tag: ["headphones", "premium", "limited"],
      slug: "limited-edition-headphones",
      thumbnail:
        "https://images.unsplash.com/photo-1599669454699-248893623440?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1599669454699-248893623440?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
      ],
      stock: 0,
      price: 299.99,
      estimatedDeliveryDays: 10,
    },
  ];
}

export async function seedProducts(sellerId) {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`Products already present: ${count}`);
    return;
  }
  const now = new Date();
  const data = sampleProducts().map((p) => ({
    ...p,
    userID: sellerId,
    // Use estimatedDeliveryDays from product data if provided, otherwise random
    estimatedDeliveryDays:
      p.estimatedDeliveryDays || Math.floor(Math.random() * 5) + 3,
    createdAt: now,
    views: Math.floor(Math.random() * 500), // Random views
    likes: Math.floor(Math.random() * 50), // Random likes
    rating: 0, // Will be calculated from ratings array
    ratings: [], // Empty initially - can be populated later
    comments: [], // Empty initially - can be populated later
    // Preserve images array from product data, or default to empty array
    images: p.images || [], // Gallery images array from sample data
    status: "published", // Default status
    name: p.title.toLowerCase().replace(/\s+/g, "-"), // Generate name from title
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
      warehouseOperator,
      support,
    } = await seedUser();

    if (!seller || !seller._id) {
      throw new Error("Failed to create seller - cannot seed products");
    }
    await seedProducts(seller._id);
    console.log("Seeding completed successfully!");
    console.log("\n=== Test Credentials ===");
    console.log("Admin: admin@example.com / password123");
    console.log("Buyer: test@example.com / password123");
    console.log("Seller: seller@example.com / password123");
    console.log("Delivery Agency: delivery@example.com / password123");
    console.log("Delivery Person 1: deliverer1@example.com / password123");
    console.log("Delivery Person 2: deliverer2@example.com / password123");
    console.log("Warehouse Operator: warehouse@example.com / password123");
    console.log("Support: support@example.com / password123");
    console.log("Support User: support_user@example.com / password123");
    console.log("Verification Team: verification@example.com / password123");
    console.log("Return Inspector: inspector@example.com / password123");
    console.log(
      "Return Deliverer: return_deliverer1@example.com / password123"
    );
    console.log(
      "Return Deliverer: return_deliverer2@example.com / password123"
    );
    console.log("Finance: finance@example.com / password123");
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

// Only run main() if this file is executed directly, not when imported as a module
// Check if this script is being run directly vs imported
const currentFile = fileURLToPath(import.meta.url);
const runFile = process.argv[1] ? resolvePath(process.argv[1]) : "";

const isMainModule = currentFile === runFile || runFile.endsWith("seed.js");

if (isMainModule) {
  main();
}
