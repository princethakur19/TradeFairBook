const express = require("express");
const router = express.Router();
const { 
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  createPaymentOrder,
  verifyPayment,
  requestBookingRefund
} = require("../controllers/bookingController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// USER ROUTES
router.post("/create", protect, createBooking);
router.post("/", protect, createBooking);
router.get("/user/:userId", protect, getUserBookings);
router.post("/:id/payment/order", protect, createPaymentOrder);
router.post("/:id/payment/verify", protect, verifyPayment);
router.post("/:id/refund/request", protect, requestBookingRefund);
router.delete("/:id", protect, cancelBooking);

// ADMIN ROUTES
router.get("/", protect, adminOnly, getAllBookings);
router.put("/:id", protect, adminOnly, updateBookingStatus);

module.exports = router;
