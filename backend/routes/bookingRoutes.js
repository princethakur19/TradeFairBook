const express = require("express");
const router = express.Router();
const { 
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking
} = require("../controllers/bookingController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadAadharImage } = require("../middleware/uploadMiddleware");

// USER ROUTES
router.post("/", protect, uploadAadharImage.single("aadharImage"), createBooking);
router.get("/user/:userId", protect, getUserBookings);
router.delete("/:id", protect, cancelBooking);

// ADMIN ROUTES
router.get("/", protect, adminOnly, getAllBookings);
router.put("/:id", protect, adminOnly, updateBookingStatus);

module.exports = router;
