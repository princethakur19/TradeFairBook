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
    enum: ["PENDING", "APPROVED", "PAID", "REJECTED", "CANCELLED", "REFUNDED"],
    default: "PENDING"
  },
  refundStatus: {
    type: String,
    enum: ["NONE", "REQUESTED", "REJECTED", "REFUNDED"],
    default: "NONE"
  },
  refundPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  refundDeductionAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundReason: {
    type: String,
    trim: true,
    default: ""
  },
  refundAdminNote: {
    type: String,
    trim: true,
    default: ""
  },
  refundRequestedAt: {
    type: Date,
    default: null
  },
  refundProcessedAt: {
    type: Date,
    default: null
  },
  refundReferenceId: {
    type: String,
    trim: true,
    default: ""
  },
  refundRequestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  refundProcessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  paymentOrderId: {
    type: String,
    trim: true,
    default: ""
  },
  paymentId: {
    type: String,
    trim: true,
    default: ""
  },
  paymentSignature: {
    type: String,
    trim: true,
    default: ""
  },
  paidAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
