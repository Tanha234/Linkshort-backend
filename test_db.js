const mongoose = require('mongoose');
require('dotenv').config();

async function diagnose() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected.");

    const Url = mongoose.model('Url', new mongoose.Schema({
        originalUrl: String,
        userId: String,
        shortCode: String
    }));

    const total = await Url.countDocuments();
    console.log(`📊 Total URLs in DB: ${total}`);

    const latest = await Url.find().sort({ createdAt: -1 }).limit(5);
    console.log("\n🔍 LATEST 5 DOCUMENTS:");
    latest.forEach((u, i) => {
      console.log(`${i+1}. Code: ${u.shortCode} | UserID: ${u.userId || 'MISSING!'} | URL: ${u.originalUrl.slice(0, 30)}...`);
    });

    if (total > 0) {
        const users = await Url.distinct('userId');
        console.log(`\n👥 Unique User IDs found:`, users);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

diagnose();
