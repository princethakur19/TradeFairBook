const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const app = express();

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

const isLocalDevOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch (_error) {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header
      // and known/local development origins.
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isLocalDevOrigin(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },

    credentials: true,
  })
);

/* =========================================================
   BODY PARSING
========================================================= */

app.use(express.json());

/* =========================================================
   STATIC UPLOADS
========================================================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================================
   ROUTES
========================================================= */

const authRoutes = require("./routes/authRoutes");
const domeRoutes = require("./routes/domeRoutes");
const stallRoutes = require("./routes/stallRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const aadhaarRoutes = require("./routes/aadhaarRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const materialRoutes = require("./routes/materialRoutes");

const Material = require("./models/Material");

app.use("/api/auth", authRoutes);
app.use("/api/domes", domeRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/aadhaar", aadhaarRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/materials", materialRoutes);

/* =========================================================
   TEST ROUTE
========================================================= */

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Trade Fair Backend Running Successfully",
  });
});

/* =========================================================
   MONGODB CONNECTION
========================================================= */

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Connection is currently being established
  if (mongoose.connection.readyState === 2) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    // Keep your existing index synchronization
    await Material.syncIndexes();

    console.log("✅ Material indexes synchronized");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

/* =========================================================
   DATABASE MIDDLEWARE
========================================================= */

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, _req, res, _next) => {
  if (!err) {
    return res.status(500).json({
      success: false,
      message: "Unknown server error",
    });
  }

  if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Aadhaar image size must be under 5MB",
    });
  }

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Server error",
  });
});

/* =========================================================
   LOCAL DEVELOPMENT SERVER
========================================================= */

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    });
}

/* =========================================================
   EXPORT FOR VERCEL
========================================================= */

module.exports = app;