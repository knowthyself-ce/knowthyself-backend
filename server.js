const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// If behind a proxy (Render/NGINX), allow correct IPs
app.set("trust proxy", true);

// ✅ Allowed frontend origins (UPDATED)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://localhost:5000",
  "http://127.0.0.1:5500",

  // ✅ ADD YOUR REAL VERCEL URL HERE
  "https://knowthyself-frontend-eight.vercel.app",
];

// ✅ CORS setup (FIXED)
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Origin received:", origin);

      // allow requests with no origin (like mobile apps, curl, uptime robot)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbtiDB";

// Start server
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Root route
    app.get("/", (req, res) => {
      res.json({ message: "Server is running 🚀" });
    });

    // Routes
    const mbtiRoutes = require("./routes/mbtiRoutes");
    app.use("/mbti", mbtiRoutes);

    const visitorsRouter = require("./routes/visitors");
    app.use("/api/visitors", visitorsRouter);

    // Port
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Run server
startServer();
