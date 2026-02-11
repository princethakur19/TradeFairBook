const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const domeRoutes = require("./routes/domeRoutes");

require("dotenv").config();

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Test route */
app.get("/", (req, res) => {
  res.send("Trade Fair Backend Running");
});

/* MongoDB Connection */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

/* Routes */
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

/* Start Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


/*Dome selection */

app.use("/api/domes", domeRoutes);