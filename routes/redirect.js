const express = require("express");
const router = express.Router();
const Url = require("../models/Url");

// Increment clicks
// Redirection route
router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) return res.status(404).send("URL not found");

    // Increment clicks
    url.clicks += 1;

    // Optional: track click timestamp
    if (!url.clickHistory) url.clickHistory = [];
    url.clickHistory.push(new Date());

    await url.save();

    // Redirect to original URL
    let redirectUrl = url.originalUrl;
    if (!/^https?:\/\//i.test(redirectUrl)) {
      redirectUrl = "https://" + redirectUrl;
    }
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
