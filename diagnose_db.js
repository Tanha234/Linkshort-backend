const mongoose = require('mongoose');
require('dotenv').config();

async function diagnose() {
  try {
    console.log("🚀 CONNECTING TO MONGODB...");
    await mongoose.connect(process.env.MONGO_URI);
    
    // Define Schema to include userId
    const urlSchema = new mongoose.Schema({
        originalUrl: String,
        userId: String,
        shortCode: String,
        createdAt: Date
    });
    const Url = mongoose.model('Url', urlSchema);

    const total = await Url.countDocuments();
    console.log(`📊 TOTAL LINKS IN DB: ${total}`);

    const latest = await Url.find().sort({ createdAt: -1 }).limit(10);
    console.log("\n🔍 LATEST 10 LINKS:");
    latest.forEach((u, i) => {
      console.log(`${i+1}. Code: ${u.shortCode} | UserID: ${u.userId || 'MISSING!'} | Date: ${u.createdAt}`);
    });

    const uniqueUsers = await Url.distinct('userId');
    console.log(`\n👥 UNIQUE USER IDs FOUND IN DB:`, uniqueUsers);

    if (uniqueUsers.length === 0) {
        console.warn("\n⚠️ WARNING: No User IDs found in ANY document. Backend is likely NOT saving User IDs.");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

diagnose();
