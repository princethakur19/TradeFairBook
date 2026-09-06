require("dotenv").config();

const mongoose = require("mongoose");
const { getDatabaseErrorMessage } = require("../utils/dbError");
const { normalizeMongoUri } = require("../utils/db");

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(normalizeMongoUri(process.env.MONGO_URI), {
    serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS || 5000)
  });

  const databaseName = mongoose.connection.name;
  console.log(`Database connection OK: ${databaseName}`);
};

run()
  .catch((error) => {
    console.error(getDatabaseErrorMessage(error));
    console.error(`Original error: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
