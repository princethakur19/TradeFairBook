require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const { normalizeMongoUri } = require("../utils/db");

const run = async () => {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env");
  }

  if (password.length < 6) {
    throw new Error("ADMIN_PASSWORD must be at least 6 characters");
  }

  await mongoose.connect(normalizeMongoUri(process.env.MONGO_URI));

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        fullname: process.env.ADMIN_FULLNAME || "Admin",
        company: process.env.ADMIN_COMPANY || "Trade Fair",
        phone: process.env.ADMIN_PHONE || "0000000000",
        password: hashedPassword,
        role: "ADMIN"
      }
    },
    { new: true, upsert: true, runValidators: true }
  );

  console.log(`Admin account ready: ${admin.email}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seed admin failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
