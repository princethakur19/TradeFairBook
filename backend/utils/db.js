const mongoose = require("mongoose");

let isConnected = false;
mongoose.set("bufferCommands", false);

const normalizeMongoUri = (uri) => {
  if (!uri) {
    throw new Error("MONGO_URI is missing");
  }

  return uri
    .trim()
    .replace(/([?&])retrywrites=/gi, "$1retryWrites=")
    .replace(/([?&])retrywites=/gi, "$1retryWrites=");
};

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const connection = await mongoose.connect(normalizeMongoUri(process.env.MONGO_URI), {
      serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS || 5000)
    });

    isConnected = connection.connections[0].readyState === 1;

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

module.exports = connectDB;
module.exports.normalizeMongoUri = normalizeMongoUri;
