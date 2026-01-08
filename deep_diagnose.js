const mongoose = require('mongoose');
require('dotenv').config();

async function diagnose() {
  try {
    console.log("🚀 DEEP DATABASE ANALYSIS...");
    await mongoose.connect(process.env.MONGO_URI);
    
    const Url = mongoose.model('Url', new mongoose.Schema({
        userId: String,
        shortCode: String,
        createdAt: Date
    }));

    const all = await Url.find().sort({ createdAt: -1 });
    console.log(`📊 TOTAL RECORDS: ${all.length}`);

    const counts = {};
    all.forEach(u => {
        const id = u.userId || "MISSING";
        counts[id] = (counts[id] || 0) + 1;
    });

    console.log("\n📈 RECORDS BY USER ID:");
    Object.entries(counts).forEach(([id, count]) => {
        console.log(`- ${id}: ${count} links`);
    });

    console.log("\n🕒 LATEST 5 SPECIFICALLY:");
    all.slice(0, 5).forEach((u, i) => {
        console.log(`${i+1}. [${u.shortCode}] -> Owner: ${u.userId || 'NONE'}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

diagnose();
