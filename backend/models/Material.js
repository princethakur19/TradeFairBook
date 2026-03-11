const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    dome: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dome",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

materialSchema.index({ dome: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Material", materialSchema);
