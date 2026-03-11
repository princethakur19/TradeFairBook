const mongoose = require("mongoose");

const bookingMaterialSchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      default: null
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { _id: false }
);

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
  stallPrice: {
    type: Number,
    default: 0
  },
  amount: Number,
  defaultMaterials: {
    type: [bookingMaterialSchema],
    default: []
  },
  extraMaterials: {
    type: [bookingMaterialSchema],
    default: []
  },
  extraMaterialTotal: {
    type: Number,
    default: 0
  },
  extraMaterialShare: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
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
