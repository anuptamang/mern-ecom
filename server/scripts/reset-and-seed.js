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
  // Import seed functions directly (since they're now exported)
  const seedModule = await import("./seed.js");
  
  // Verify functions exist
  if (!seedModule.seedUser || !seedModule.seedProducts) {
    throw new Error("seedUser or seedProducts not exported from seed.js");
  }

  // Ensure connection is still active
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database connection is not active");
  }

  // Run seeding (connection is already established from main())
  const {
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
  } = await seedModule.seedUser();
  
  // Wait a moment to ensure all user operations complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await seedModule.seedProducts(seller._id);
  
  // Wait again to ensure all product operations complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log("Seeding completed successfully!");
  console.log("\n=== Test Credentials ===");
  console.log("Admin: admin@example.com / password123");
  console.log("Buyer: buyer@example.com / password123");
  console.log("Seller: seller@example.com / password123");
  console.log("Delivery Agency: delivery@example.com / password123");
  console.log("Delivery Person 1: deliverer1@example.com / password123");
  console.log("Delivery Person 2: deliverer2@example.com / password123");
  console.log("Return Deliverer: return_deliverer2@example.com / password123");
  console.log("Warehouse Operator: warehouse@example.com / password123");
  console.log("Support: support@example.com / password123");
  console.log("Support User: support_user@example.com / password123");
  console.log("Verification Team: verification@example.com / password123");
  console.log("Return Inspector: inspector@example.com / password123");
  console.log("Return Deliverer: return_deliverer@example.com / password123");
  console.log("Finance: finance@example.com / password123");
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
    // Wait a moment to ensure all database operations complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Only disconnect if still connected
    if (mongoose.connection.readyState === 1) {
      try {
        await mongoose.disconnect();
        console.log("✓ Database connection closed");
      } catch (disconnectError) {
        // Ignore disconnect errors - connection may already be closed
        console.log("✓ Database operations completed");
      }
    }
  }
}

main();
