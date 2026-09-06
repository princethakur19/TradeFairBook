require("dotenv").config();

const mongoose = require("mongoose");
const { normalizeMongoUri } = require("../utils/db");
const Dome = require("../models/Dome");
const Material = require("../models/Material");

const DEFAULT_MATERIALS = [
  {
    name: "Table",
    price: 200,
    description: "Wood",
    isActive: true
  },
  {
    name: "Chair",
    price: 100,
    description: "Plastic",
    isActive: true
  },
  {
    name: "Fan",
    price: 50,
    description: "Cooling",
    isActive: true
  },
  {
    name: "Light",
    price: 50,
    description: "LED",
    isActive: true
  }
];

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(normalizeMongoUri(process.env.MONGO_URI));

  const domes = await Dome.find().select("_id domeName").lean();
  let createdCount = 0;

  for (const dome of domes) {
    const existingCount = await Material.countDocuments({ dome: dome._id });

    if (existingCount > 0) {
      console.log(`Skipped ${dome.domeName}: ${existingCount} materials already exist`);
      continue;
    }

    const materials = DEFAULT_MATERIALS.map((material) => ({
      ...material,
      dome: dome._id
    }));

    await Material.insertMany(materials, { ordered: false });
    createdCount += materials.length;
    console.log(`Seeded ${materials.length} materials for ${dome.domeName}`);
  }

  const totalCount = await Material.countDocuments();
  console.log(`Seeded ${createdCount} new materials. Current material count: ${totalCount}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seed materials failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
