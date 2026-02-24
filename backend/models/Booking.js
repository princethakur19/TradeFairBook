const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  stall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stall"
  },
  dome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dome"
  },
  amount: Number,
  aadhaarVerification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AadhaarVerification",
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
    default: "PENDING"
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
