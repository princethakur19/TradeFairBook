const mongoose = require("mongoose");

const stallSchema = new mongoose.Schema({
  stallNumber: {
    type: String,
    required: true,
    trim: true
  },

  dome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dome",
    required: true
  },

  side: {
    type: String,
    enum: ["LEFT", "RIGHT", "TOP", "BOTTOM", "CENTER"],
    required: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  status: {
    type: String,
    enum: ["AVAILABLE", "BOOKED", "HOLD", "BLOCKED"],
    default: "AVAILABLE"
  }

}, { timestamps: true });


// ✅ Prevent duplicate stall numbers inside samme dome
stallSchema.index({ stallNumber: 1, dome: 1 }, { unique: true });

module.exports = mongoose.model("Stall", stallSchema);
