const mongoose = require("mongoose");

const domeSchema = new mongoose.Schema(
  {
    domeName: {
      type: String,
      required: true,
      unique: true
    },
    location: {
      type: String,
      required: true
    },
    totalStalls: {
      type: Number,
      required: true
    },
    description: {
      type: String
    },
    image: {
      type: String
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "FULL", "INACTIVE"],
      default: "AVAILABLE"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dome", domeSchema);
