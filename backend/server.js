const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

/* Middleware */
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL (change if different)
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

app.use("/api/auth", authRoutes);
app.use("/api/domes", domeRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/aadhaar", aadhaarRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

/* Test Route */
app.get("/", (req, res) => {
  res.json({ message: "Trade Fair Backend Running Successfully" });
});

/* Error Handler */
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
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
