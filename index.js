const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: "*", // allow all origins or configure for production
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Root Route - Friendly landing for Render
app.get("/", (req, res) => {
    res.json({ 
        message: "LinkShort Backend API is running on Render",
        status: "operational",
        endpoints: {
            health: "/api/health",
            urls: "/api/urls"
        }
    });
});

// MongoDB Connection Strategy for Serverless
let isConnected = false;
const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState === 1) {
        isConnected = true;
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("✅ MongoDB connected (Serverless)");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Redirect logic
const redirectRoutes = require("./routes/redirect");
app.use("/api/r", redirectRoutes);

// API Routes
const urlRoutes = require("./routes/urlRoutes");
app.use("/api/urls", urlRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "Backend is running", 
        db: isConnected ? "connected" : "disconnected",
        env: process.env.NODE_ENV || "production" 
    });
});

app.get("/api", (req, res) => {
    res.json({ message: "Welcome to the LinkShort API" });
});

// Catch-all for undefined /api routes
app.use("/api", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.url}` });
});

// IMPORTANT: Do NOT define a global catch-all app.use((req,res) => ...) here.
// If a route doesn't match /api, we want Express to finish so Vercel can 
// fall back to serving the static index.html if configured.


// Export the app for Vercel
module.exports = app;
