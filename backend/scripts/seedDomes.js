require("dotenv").config();

const mongoose = require("mongoose");
const Dome = require("../models/Dome");

const domes = [
  {
    domeName: "Technology Dome",
    location: "Mumbai",
    description: "Premium exhibition zone for software, hardware, automation, and startup showcases.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    status: "ACTIVE"
  },
  {
    domeName: "Lifestyle Dome",
    location: "Mumbai",
    description: "A vibrant space for fashion, home decor, wellness, and consumer lifestyle brands.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
    status: "ACTIVE"
  },
  {
    domeName: "Food & Beverage Dome",
    location: "Mumbai",
    description: "Dedicated food court and packaged goods area for culinary brands and tastings.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
    status: "ACTIVE"
  }
];

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(process.env.MONGO_URI);

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
