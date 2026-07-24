const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL
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

/* Middleware */
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* Routes */
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

/* Test Route */
app.get("/", (req, res) => {
  res.json({ message: "Trade Fair Backend Running Successfully" });
});

/* Error Handlerr */
app.use((err, _req, res, _next) => {
  if (!err) {
    return res.status(500).json({ success: false, message: "Unknown server error" });
  }

  if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "Aadhaar image size must be under 5MB" });
  }

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ success: false, message: err.message });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Server error"
  });
});

/* MongoDB Connection */
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await Material.syncIndexes();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
