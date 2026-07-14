require("dotenv").config();

const mongoose = require("mongoose");
const Dome = require("../models/Dome");
const Stall = require("../models/Stall");

const DEFAULT_LAYOUT = {
  top: 5,
  left: 7,
  right: 7,
  centerRows: 4,
  centerSpacing: "with-space"
};

const buildStallsForDome = (domeId) => {
  const stalls = [];

  for (let i = 1; i <= DEFAULT_LAYOUT.top; i += 1) {
    stalls.push({
      stallNumber: `T${i}`,
      side: "TOP",
      price: 7000,
      status: "AVAILABLE",
      dome: domeId,
      centerSpacing: DEFAULT_LAYOUT.centerSpacing
    });
  }

  for (let i = 1; i <= DEFAULT_LAYOUT.left; i += 1) {
    stalls.push({
      stallNumber: `L${i}`,
      side: "LEFT",
      price: 5000,
      status: "AVAILABLE",
      dome: domeId,
      centerSpacing: DEFAULT_LAYOUT.centerSpacing
    });
  }

  for (let i = 1; i <= DEFAULT_LAYOUT.right; i += 1) {
    stalls.push({
      stallNumber: `R${i}`,
      side: "RIGHT",
      price: 5000,
      status: "AVAILABLE",
      dome: domeId,
      centerSpacing: DEFAULT_LAYOUT.centerSpacing
    });
  }

  for (let i = 1; i <= DEFAULT_LAYOUT.centerRows * 2; i += 1) {
    stalls.push({
      stallNumber: `C${i}`,
      side: "CENTER",
      price: 6000,
      status: "AVAILABLE",
      dome: domeId,
      centerSpacing: DEFAULT_LAYOUT.centerSpacing
    });
  }

  return stalls;
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const domes = await Dome.find().select("_id domeName").lean();
  let createdCount = 0;

  for (const dome of domes) {
    const existingCount = await Stall.countDocuments({ dome: dome._id });

    if (existingCount > 0) {
      console.log(`Skipped ${dome.domeName}: ${existingCount} stalls already exist`);
      continue;
    }

    const stalls = buildStallsForDome(dome._id);
    await Stall.insertMany(stalls, { ordered: false });
    createdCount += stalls.length;
    console.log(`Seeded ${stalls.length} stalls for ${dome.domeName}`);
  }

  const totalCount = await Stall.countDocuments();
  console.log(`Seeded ${createdCount} new stalls. Current stall count: ${totalCount}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seed stalls failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
