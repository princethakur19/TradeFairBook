require("dotenv").config();

const mongoose = require("mongoose");
const Dome = require("../models/Dome");
const defaultDomes = require("../data/defaultDomes");
const { normalizeMongoUri } = require("../utils/db");

const domes = defaultDomes.map(({ _id, totalStalls, availableStalls, bookedStalls, startingPrice, ...dome }) => dome);

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(normalizeMongoUri(process.env.MONGO_URI));

  for (const dome of domes) {
    await Dome.findOneAndUpdate(
      { domeName: dome.domeName },
      { $setOnInsert: dome },
      { upsert: true, new: true }
    );
  }

  const count = await Dome.countDocuments();
  console.log(`Seeded domes. Current dome count: ${count}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seed domes failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
