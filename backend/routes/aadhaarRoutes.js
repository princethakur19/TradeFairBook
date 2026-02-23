const express = require("express");
const router = express.Router();

const { submitAadhaar } = require("../controllers/aadhaarController");
const { protect } = require("../middleware/authMiddleware");
const { uploadAadharImage } = require("../middleware/uploadMiddleware");

router.post("/submit", protect, uploadAadharImage.single("aadhaarImage"), submitAadhaar);

module.exports = router;
