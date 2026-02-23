const mongoose = require("mongoose");
const { encrypt, isEncryptedValue } = require("../utils/encryption");

const aadhaarVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    aadhaarName: {
      type: String,
      required: true,
      trim: true
    },
    aadhaarNumber: {
      type: String,
      required: true,
      select: false
    },
    aadhaarImage: {
      type: String,
      required: true,
      trim: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

aadhaarVerificationSchema.pre("save", function encryptAadhaarNumber() {
  if (!this.isModified("aadhaarNumber")) {
    return;
  }

  if (!isEncryptedValue(this.aadhaarNumber)) {
    this.aadhaarNumber = encrypt(this.aadhaarNumber);
  }
});

aadhaarVerificationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.aadhaarNumber;
    return ret;
  }
});

module.exports = mongoose.model("AadhaarVerification", aadhaarVerificationSchema);
