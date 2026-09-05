const { put } = require("@vercel/blob");
const AadhaarVerification = require("../models/AadhaarVerification");
const connectDB = require("../utils/db");
const { isFallbackDataEnabled } = require("../utils/fallbackMode");

const createFallbackVerification = ({ userId, aadhaarName }) => ({
  _id: `${String(userId).slice(0, 20)}0aad`,
  user: userId,
  aadhaarName: aadhaarName.trim(),
  aadhaarImage: "fallback/aadhaar-upload",
  verified: false,
  submittedAt: new Date().toISOString()
});

exports.submitAadhaar = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { aadhaarName, aadhaarNumber } = req.body;

    const normalizedAadhaar = String(aadhaarNumber || "").replace(/\D/g, "");

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!aadhaarName || normalizedAadhaar.length !== 12) {
      return res.status(400).json({
        success: false,
        message: "Valid aadhaarName and 12-digit aadhaarNumber are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar image upload is required"
      });
    }

    if (isFallbackDataEnabled()) {
      return res.status(201).json({
        success: true,
        message: "Aadhaar submitted successfully",
        data: createFallbackVerification({ userId, aadhaarName }),
        fallback: true
      });
    }

    await connectDB();

    const safeOriginalName = req.file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "");

    const blobPath = `aadhar/${userId}-${Date.now()}-${safeOriginalName}`;

    const blob = await put(blobPath, req.file.buffer, {
      access: "private",
      contentType: req.file.mimetype
    });

    const verification = await AadhaarVerification.create({
      user: userId,
      aadhaarName: aadhaarName.trim(),
      aadhaarNumber: normalizedAadhaar,
      aadhaarImage: blob.pathname
    });

    const responseData = await AadhaarVerification.findById(verification._id)
      .select("-aadhaarNumber")
      .populate("user", "fullname email");

    return res.status(201).json({
      success: true,
      message: "Aadhaar submitted successfully",
      data: responseData
    });
  } catch (error) {
    console.error("Submit Aadhaar Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit Aadhaar"
    });
  }
};
