const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getAdminBookings,
  approveBooking,
  rejectBooking,
  cancelBookingByAdmin,
  getBookingAadhaarDetails
} = require("../controllers/adminBookingController");
const {
  approveRefundRequest,
  rejectRefundRequest
} = require("../controllers/bookingController");
const { getDashboardStats } = require("../controllers/adminDashboardController");

router.use(protect);
router.use(authorizeRoles("ADMIN", "SUPER_ADMIN"));

router.get("/dashboard/stats", getDashboardStats);
router.get("/bookings", getAdminBookings);
router.put("/bookings/:id/approve", approveBooking);
router.put("/bookings/:id/reject", rejectBooking);
router.put("/bookings/:id/cancel", cancelBookingByAdmin);
router.put("/bookings/:id/refund/approve", approveRefundRequest);
router.put("/bookings/:id/refund/reject", rejectRefundRequest);
router.get(
  "/bookings/:id/aadhaar",
  authorizeRoles("SUPER_ADMIN"),
  getBookingAadhaarDetails
);

module.exports = router;
