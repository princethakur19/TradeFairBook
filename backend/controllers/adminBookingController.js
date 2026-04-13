const Booking = require("../models/Booking");
const Stall = require("../models/Stall");

const BOOKING_STATUSES = ["PENDING", "APPROVED", "PAID", "REJECTED", "CANCELLED", "REFUNDED"];
const ACTIVE_BOOKING_STATUSES = ["PENDING", "APPROVED", "PAID"];

const normalizeStatus = (value) => String(value || "").trim().toUpperCase();

const syncStallStatusForBooking = async (booking) => {
  if (!booking?.stall) return;

  const activeCount = await Booking.countDocuments({
    stall: booking.stall,
    status: { $in: ACTIVE_BOOKING_STATUSES }
  });

  await Stall.findByIdAndUpdate(booking.stall, {
    status: activeCount > 0 ? "BOOKED" : "AVAILABLE"
  });
};

const populateBookingQuery = (query) =>
  query
    .populate("user", "fullname email")
    .populate("stall", "stallNumber side price")
    .populate("dome", "domeName location")
    .populate("aadhaarVerification", "-aadhaarNumber");

exports.getAdminBookings = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const status = normalizeStatus(req.query.status);
    const dome = req.query.dome;

    const filter = {};
    if (status && status !== "ALL") {
      if (!BOOKING_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter"
        });
      }
      filter.status = status === "APPROVED" ? { $in: ["APPROVED", "PAID"] } : status;
    }

    if (dome && dome !== "ALL") {
      filter.dome = dome;
    }

    const [total, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      populateBookingQuery(
        Booking.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      )
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateBookingStatus = async (req, res, status, actionLabel) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const normalizedCurrentStatus = String(booking.status || "").toUpperCase();
    if (normalizedCurrentStatus === "PAID" || normalizedCurrentStatus === "REFUNDED") {
      return res.status(400).json({
        success: false,
        message: "Paid or refunded bookings cannot be modified from this action"
      });
    }

    booking.status = status;
    await booking.save();
    await syncStallStatusForBooking(booking);

    const updatedBooking = await populateBookingQuery(Booking.findById(booking._id));

    return res.status(200).json({
      success: true,
      message: `Booking ${actionLabel} successfully`,
      data: updatedBooking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.approveBooking = async (req, res) => updateBookingStatus(req, res, "APPROVED", "approved");
exports.rejectBooking = async (req, res) => updateBookingStatus(req, res, "REJECTED", "rejected");
exports.cancelBookingByAdmin = async (req, res) => updateBookingStatus(req, res, "CANCELLED", "cancelled");

exports.getBookingAadhaarDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .select("aadhaarVerification user stall dome status amount createdAt")
      .populate("aadhaarVerification", "+aadhaarNumber aadhaarName aadhaarImage verified submittedAt createdAt")
      .populate("user", "fullname email")
      .populate("stall", "stallNumber side price")
      .populate("dome", "domeName location");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
