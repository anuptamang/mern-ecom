import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

async function connect() {
  mongoose.set("strictQuery", false);
  const uri = process.env.MONGODB;
  if (!uri) throw new Error("MONGODB env variable is not set");
  await mongoose.connect(uri);
}

async function resetDatabase() {
  console.log("Resetting database...");
  try {
    // Get all collection names
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    // Drop each collection
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`✓ Dropped collection: ${collection.name}`);
    }
    console.log("\n✓ Database reset completed.\n");
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
}

async function runSeedScript() {
  // Import seed functions
  const { seedUser, seedProducts } = await import("./seed.js");

  // Run seeding (connection is already established from main())
  const {
    buyer,
    seller,
    admin,
    deliveryAgency,
    deliveryPerson1,
    deliveryPerson2,
    support,
  } = await seedUser();
  await seedProducts(seller._id);
  console.log("Seeding completed successfully!");
  console.log("\n=== Test Credentials ===");
  console.log("Admin: admin@example.com / password123");
  console.log("Buyer: buyer@example.com / password123");
  console.log("Seller: seller@example.com / password123");
  console.log("Delivery Agency: delivery@example.com / password123");
  console.log("Delivery Person 1: deliverer1@example.com / password123");
  console.log("Delivery Person 2: deliverer2@example.com / password123");
  console.log("Support: support@example.com / password123");
}

async function main() {
  try {
    await connect();
    await resetDatabase();

    // Run seed script functions directly (connection already established)
    console.log("Running seed script...\n");
    await runSeedScript();

    console.log("\n✓ Database reset and seeded successfully!");
  } catch (e) {
    console.error("Error:", e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
