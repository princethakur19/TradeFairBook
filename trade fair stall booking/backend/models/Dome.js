const mongoose = require("mongoose");

const domeSchema = new mongoose.Schema(
  {
    domeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true
    },
    location: {
      type: String,
      required: true,
      maxlength: 150
    },
    totalStalls: {
      type: Number,
      required: true,
      min: 1
    },
    description: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dome", domeSchema);
