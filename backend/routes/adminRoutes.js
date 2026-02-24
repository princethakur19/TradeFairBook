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
const { getDashboardStats } = require("../controllers/adminDashboardController");

router.use(protect);
router.use(authorizeRoles("ADMIN", "SUPER_ADMIN"));

router.get("/dashboard/stats", getDashboardStats);
router.get("/bookings", getAdminBookings);
router.put("/bookings/:id/approve", approveBooking);
router.put("/bookings/:id/reject", rejectBooking);
router.put("/bookings/:id/cancel", cancelBookingByAdmin);
router.get(
  "/bookings/:id/aadhaar",
  authorizeRoles("SUPER_ADMIN"),
  getBookingAadhaarDetails
);

module.exports = router;
