const Booking = require("../models/Booking");
const Stall = require("../models/Stall");
const AadhaarVerification = require("../models/AadhaarVerification");

const BOOKING_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const ACTIVE_BOOKING_STATUSES = ["PENDING", "APPROVED", "PAID"];
const TERMINAL_BOOKING_STATUSES = ["REJECTED", "CANCELLED"];

const bookingPopulate = [
  { path: "user", select: "fullname email" },
  { path: "stall", select: "stallNumber side price" },
  { path: "dome", select: "domeName location" },
  { path: "aadhaarVerification", select: "-aadhaarNumber" }
];

const normalizeStatus = (value) => String(value || "").toUpperCase();

const syncStallStatusForBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId).select("stall");
  if (!booking?.stall) return;

  const activeCount = await Booking.countDocuments({
    stall: booking.stall,
    status: { $in: ACTIVE_BOOKING_STATUSES }
  });

  await Stall.findByIdAndUpdate(booking.stall, {
    status: activeCount > 0 ? "BOOKED" : "AVAILABLE"
  });
};

/* ===============================
   CREATE BOOKING
================================= */
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { stall, status, aadhaarVerificationId } = req.body || {};
    const normalizedStatus = normalizeStatus(status || "PENDING");

    if (!userId || !stall || !aadhaarVerificationId) {
      return res.status(400).json({
        success: false,
        message: "User, stall and aadhaarVerificationId are required"
      });
    }

    if (!BOOKING_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status"
      });
    }

    const aadhaarVerification = await AadhaarVerification.findOne({
      _id: aadhaarVerificationId,
      user: userId
    });

    if (!aadhaarVerification) {
      return res.status(404).json({
        success: false,
        message: "Aadhaar verification record not found for this user"
      });
    }

    const stallDoc = await Stall.findById(stall);
    if (!stallDoc) {
      return res.status(404).json({
        success: false,
        message: "Stall not found"
      });
    }

    const existingBooking = await Booking.findOne({
      stall,
      status: { $in: ACTIVE_BOOKING_STATUSES }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "This stall is already booked"
      });
    }

    const booking = await Booking.create({
      user: userId,
      stall,
      dome: stallDoc.dome,
      amount: stallDoc.price,
      aadhaarVerification: aadhaarVerification._id,
      status: normalizedStatus
    });

    await syncStallStatusForBooking(booking._id);

    const populatedBooking = await Booking.findById(booking._id).populate(bookingPopulate);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   GET USER BOOKINGS
================================= */
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (String(req.user?.role || "").toUpperCase() === "USER" && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these bookings"
      });
    }

    const bookings = await Booking.find({ user: userId })
      .populate(bookingPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error("Get User Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   GET ALL BOOKINGS (ADMIN - LEGACY API)
================================= */
exports.getAllBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find()
      .populate(bookingPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   UPDATE BOOKING STATUS (LEGACY API)
================================= */
exports.updateBookingStatus = async (req, res) => {
  try {
    const rawStatus = req.body?.status;
    const normalizedStatus = normalizeStatus(rawStatus === "PAID" ? "APPROVED" : rawStatus);

    if (!BOOKING_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    booking.status = normalizedStatus;
    await booking.save();
    await syncStallStatusForBooking(booking._id);

    const updatedBooking = await Booking.findById(booking._id).populate(bookingPopulate);

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   CANCEL BOOKING (USER OR ADMIN)
================================= */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const role = String(req.user?.role || "").toUpperCase();
    const canManageAll = role === "ADMIN" || role === "SUPER_ADMIN";
    if (!canManageAll && String(booking.user) !== String(req.user?.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this booking"
      });
    }

    booking.status = "CANCELLED";
    await booking.save();
    await syncStallStatusForBooking(booking._id);

    const updatedBooking = await Booking.findById(booking._id).populate(bookingPopulate);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedBooking
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.BOOKING_STATUSES = BOOKING_STATUSES;
exports.ACTIVE_BOOKING_STATUSES = ACTIVE_BOOKING_STATUSES;
exports.TERMINAL_BOOKING_STATUSES = TERMINAL_BOOKING_STATUSES;
