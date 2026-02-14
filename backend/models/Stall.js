const mongoose = require("mongoose");

const stallSchema = new mongoose.Schema({
  stallNumber: {
    type: String,
    required: true
  },
  dome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dome",
    required: true
  },
  side: {
    type: String,
    enum: ["LEFT", "RIGHT", "TOP"],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["AVAILABLE", "BOOKED"],
    default: "AVAILABLE"
  }
}, { timestamps: true });

module.exports = mongoose.model("Stall", stallSchema);
