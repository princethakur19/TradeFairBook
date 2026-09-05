const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./utils/db");
const { getDatabaseErrorMessage } = require("./utils/dbError");

const app = express();
const isDemoAuthEnabled = () => String(process.env.DEMO_AUTH_ENABLED || "false").toLowerCase() === "true";

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ...(process.env.FRONTEND_URL || "").split(",")
].map((origin) => origin?.trim()).filter(Boolean);

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
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isLocalDevOrigin(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);

/* =========================
   BODY PARSERS
========================= */

app.use(express.json());

/* =========================
   DATABASE
========================= */

app.use(async (req, res, next) => {
  const publicFallbackRoutes = [
    req.method === "GET" && req.path === "/api/domes",
    req.method === "GET" && req.path.startsWith("/api/domes/"),
    req.method === "GET" && req.path.startsWith("/api/stalls/"),
    req.method === "GET" && req.path === "/api/materials",
    req.method === "POST" && req.path === "/api/aadhaar/submit",
    req.method === "POST" && (req.path === "/api/bookings/create" || req.path === "/api/bookings"),
    req.method === "GET" && req.path.startsWith("/api/bookings/user/"),
    isDemoAuthEnabled() && req.method === "POST" && req.path === "/api/auth/login",
    isDemoAuthEnabled() && req.method === "GET" && req.path === "/api/admin/dashboard/stats"
  ];

  if (publicFallbackRoutes.some(Boolean)) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database middleware error:", error);

    return res.status(503).json({
      success: false,
      message: getDatabaseErrorMessage(error)
    });
  }
});

/* =========================
   ROUTES
========================= */

const authRoutes = require("./routes/authRoutes");
const domeRoutes = require("./routes/domeRoutes");
const stallRoutes = require("./routes/stallRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const aadhaarRoutes = require("./routes/aadhaarRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const materialRoutes = require("./routes/materialRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/domes", domeRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/aadhaar", aadhaarRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/materials", materialRoutes);

/* =========================
   HEALTH / TEST ROUTE
========================= */

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Trade Fair Backend Running Successfully"
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, _req, res, _next) => {
  console.error("Server Error:", err);

  if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Aadhaar image size must be under 5MB"
    });
  }

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err.message?.startsWith("CORS blocked origin")) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Server error"
  });
});

/* =========================
   LOCAL DEVELOPMENT
========================= */

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

/* =========================
   EXPORT FOR VERCEL
========================= */

module.exports = app;
