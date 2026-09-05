const multer = require("multer");

/* =========================
   FILE FILTER
========================= */

const imageOnlyFilter = (_req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"), false);
    return;
  }

  cb(null, true);
};

/* =========================
   MEMORY STORAGE
========================= */

/*
  We use memoryStorage() instead of diskStorage().

  The uploaded Aadhaar image will temporarily
  stay in memory and will then be uploaded to
  Vercel Blob from the controller.

  This is suitable for Vercel deployment because
  we are not relying on the server's local filesystem.
*/

const storage = multer.memoryStorage();

/* =========================
   MULTER CONFIGURATION
========================= */

const uploadAadharImage = multer({
  storage,
  fileFilter: imageOnlyFilter,

  limits: {
    // Maximum file size: 5 MB
    fileSize: 5 * 1024 * 1024
  }
});

/* =========================
   EXPORT
========================= */

module.exports = {
  uploadAadharImage
};