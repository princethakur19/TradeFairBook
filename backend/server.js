const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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

/* Routes */
const authRoutes = require("./routes/authRoutes");
const domeRoutes = require("./routes/domeRoutes");
const stallRoutes = require("./routes/stallRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reportRoutes = require("./routes/reportRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/domes", domeRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);

/* Test Route */
app.get("/", (req, res) => {
  res.json({ message: "Trade Fair Backend Running Successfully" });
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
