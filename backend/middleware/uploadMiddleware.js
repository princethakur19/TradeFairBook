const fs = require("fs");
const path = require("path");
const multer = require("multer");

const aadharUploadDir = path.join(__dirname, "..", "uploads", "aadhar");
fs.mkdirSync(aadharUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, aadharUploadDir);
  },
  filename: (req, file, cb) => {
    const safeOriginal = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
    const uniqueName = `${req.user?.id || "user"}-${Date.now()}-${safeOriginal}`;
    cb(null, uniqueName);
  }
});

const imageOnlyFilter = (_req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"), false);
    return;
  }
  cb(null, true);
};

const uploadAadharImage = multer({
  storage,
  fileFilter: imageOnlyFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = {
  uploadAadharImage
};
