const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  try {
    console.log("🚀 Connecting to MongoDB for Database Cleanup...");
    await mongoose.connect(process.env.MONGO_URI);
    
    const Url = mongoose.model('Url', new mongoose.Schema({
        userId: String
    }));

    // Find and delete links that don't have a userId (the 'everyone' data)
    const result = await Url.deleteMany({ userId: { $exists: false } });
    console.log(`✅ Deleted ${result.deletedCount} links that had no User ID.`);
    
    const remaining = await Url.countDocuments();
    console.log(`📊 Valid links remaining: ${remaining}`);
    
    console.log("\n🚀 CLEANUP COMPLETE.");
    console.log("NEXT STEPS:");
    console.log("1. Close your terminal.");
    console.log("2. Type 'node index.js' to start the server.");
    console.log("3. Refresh the Dashboard.");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

cleanup();
