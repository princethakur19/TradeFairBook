const AadhaarVerification = require("../models/AadhaarVerification");

exports.submitAadhaar = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { aadhaarName, aadhaarNumber } = req.body;
    const normalizedAadhaar = String(aadhaarNumber || "").replace(/\D/g, "");
    const aadhaarImagePath = req.file ? `/uploads/aadhar/${req.file.filename}` : "";

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

    if (!aadhaarImagePath) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar image upload is required"
      });
    }

    const verification = await AadhaarVerification.create({
      user: userId,
      aadhaarName: aadhaarName.trim(),
      aadhaarNumber: normalizedAadhaar,
      aadhaarImage: aadhaarImagePath
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
