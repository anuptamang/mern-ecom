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
    const collections = await mongoose.connection.db.listCollections().toArray();
    
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

async function main() {
  try {
    await connect();
    await resetDatabase();
    
    // Import and run seed script
    console.log("Running seed script...\n");
    const seedModule = await import("./seed.js");
    await seedModule.default();
    
    console.log("\n✓ Database reset and seeded successfully!");
  } catch (e) {
    console.error("Error:", e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();

