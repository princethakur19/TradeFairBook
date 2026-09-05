/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const { normalizeMongoUri } = require("../utils/db");

const Booking = require("../models/Booking");
const AadhaarVerification = require("../models/AadhaarVerification");

const LEGACY_FIELDS = [
  "aadharName",
  "aadharNumber",
  "aadharImage",
  "aadharVerified",
  "aadharSubmittedAt",
  "aadhaarName",
  "aadhaarNumber",
  "aadhaarImage",
  "aadhaarVerified",
  "aadhaarSubmittedAt"
];

const runMigration = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(normalizeMongoUri(process.env.MONGO_URI));
  console.log("Connected to MongoDB");

  const bookingsCollection = mongoose.connection.collection("bookings");
  const cursor = bookingsCollection.find({
    aadhaarVerification: { $exists: false },
    $or: [{ aadharNumber: { $exists: true } }, { aadhaarNumber: { $exists: true } }]
  });

  let migrated = 0;
  let skipped = 0;

  while (await cursor.hasNext()) {
    const legacyBooking = await cursor.next();

    const aadhaarName = (legacyBooking.aadhaarName || legacyBooking.aadharName || "").trim();
    const aadhaarNumber = String(legacyBooking.aadhaarNumber || legacyBooking.aadharNumber || "").replace(/\D/g, "");
    const aadhaarImage = legacyBooking.aadhaarImage || legacyBooking.aadharImage;

    if (!legacyBooking.user || !aadhaarName || aadhaarNumber.length !== 12 || !aadhaarImage) {
      skipped += 1;
      continue;
    }

    const verification = await AadhaarVerification.create({
      user: legacyBooking.user,
      aadhaarName,
      aadhaarNumber,
      aadhaarImage,
      verified: Boolean(legacyBooking.aadhaarVerified ?? legacyBooking.aadharVerified),
      submittedAt: legacyBooking.aadhaarSubmittedAt || legacyBooking.aadharSubmittedAt || new Date()
    });

    const unsetObject = {};
    for (const field of LEGACY_FIELDS) {
      unsetObject[field] = "";
    }

    await bookingsCollection.updateOne(
      { _id: legacyBooking._id },
      {
        $set: { aadhaarVerification: verification._id },
        $unset: unsetObject
      }
    );

    migrated += 1;
  }

  console.log(`Migration complete. Migrated: ${migrated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
};

runMigration()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Migration failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });
