// backend/routes/urlRoutes.js
const express = require("express");
const router = express.Router();
const Url = require("../models/Url");

// Version Check
router.get("/version", (req, res) => {
  res.json({ version: "v2-isolated", status: "running corrected code" });
});

// Create a short URL
router.post("/", async (req, res) => {
  try {
    console.log("📥 RECEIVED POST /api/urls:", req.body);
    let { originalUrl, userId, shortCode, shortUrl } = req.body;
    if (!originalUrl || !userId || !shortCode || !shortUrl) {
      console.warn("⚠️ MISSING FIELDS in POST:", { originalUrl: !!originalUrl, userId: !!userId, shortCode: !!shortCode, shortUrl: !!shortUrl });
      return res.status(400).json({ msg: "Missing fields" });
    }

    // Normalize URL: Ensure it starts with http:// or https://
    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = "https://" + originalUrl;
    }

    const newUrl = await Url.create({ originalUrl, userId, shortCode, shortUrl });
    res.status(201).json(newUrl);
  } catch (error) {
    console.error("❌ SAVE ERROR:", error);
    res.status(500).json({ msg: error.message });
  }
});
// Get URL by shortCode (for frontend redirection)
router.get("/code/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });
    if (!url) return res.status(404).json({ msg: "URL not found" });
    res.json(url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// Get all URLs (Filtered by User)
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Enforce User Isolation
    if (!userId) {
      return res.status(400).json({ msg: "User ID is required to fetch links" });
    }

    console.log(`🔍 Fetching links for user: ${userId}`); // Debug log

    const urls = await Url.find({ userId }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update a URL
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ msg: "Original URL is required" });
    }

    // Normalize URL
    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = "https://" + originalUrl;
    }

    const updatedUrl = await Url.findByIdAndUpdate(
      id,
      { originalUrl },
      { new: true }
    );

    if (!updatedUrl) {
      return res.status(404).json({ msg: "URL not found" });
    }

    res.json(updatedUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete a URL
router.delete("/:id", async (req, res) => {
  try {
    await Url.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
