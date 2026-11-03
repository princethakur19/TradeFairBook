const Stall = require("../models/Stall");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");
const { isFallbackDataEnabled } = require("../utils/fallbackMode");
const { getAllFallbackStalls } = require("../data/fallbackStalls");
const { getAllFallbackBookings } = require("../data/fallbackBookings");

const ACTIVE_BOOKING_STATUSES = ["PENDING", "APPROVED", "PAID"];
const REVENUE_BOOKING_STATUSES = ["PAID"];
const PAYMENT_PENDING_STATUSES = ["APPROVED"];
const PAYMENT_CONFIRMED_STATUSES = ["PAID"];

exports.getDomeReport = async (req, res) => {
  try {
    const domeId = req.params.domeId;
    if (isFallbackDataEnabled()) {
      const bookings = getAllFallbackBookings()
        .filter((booking) => String(booking.dome?._id || booking.dome) === String(domeId))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
      const stalls = getAllFallbackStalls().filter((stall) => String(stall.dome?._id || stall.dome) === String(domeId));
      const activeBookings = bookings.filter((booking) => ACTIVE_BOOKING_STATUSES.includes(String(booking.status).toUpperCase()));
      const bookedStallIds = new Set(activeBookings.map((booking) => String(booking.stall?._id || booking.stall)));

      return res.status(200).json({
        totalStalls: stalls.length,
        bookedStalls: bookedStallIds.size,
        availableStalls: Math.max(stalls.length - bookedStallIds.size, 0),
        paymentPendingCount: bookings.filter((booking) => PAYMENT_PENDING_STATUSES.includes(String(booking.status).toUpperCase())).length,
        paymentConfirmedCount: bookings.filter((booking) => PAYMENT_CONFIRMED_STATUSES.includes(String(booking.status).toUpperCase())).length,
        totalRevenue: bookings
          .filter((booking) => REVENUE_BOOKING_STATUSES.includes(String(booking.status).toUpperCase()))
          .reduce((sum, booking) => sum + Number(booking.grandTotal ?? booking.amount ?? 0), 0),
        bookings,
        fallback: true
      });
    }

    const domeObjectId = new mongoose.Types.ObjectId(domeId);

    const [
      totalStalls,
      bookedStallIds,
      revenue,
      paymentPendingCount,
      paymentConfirmedCount,
      bookings
    ] = await Promise.all([
      Stall.countDocuments({ dome: domeId }),
      Booking.distinct("stall", {
        dome: domeId,
        status: { $in: ACTIVE_BOOKING_STATUSES }
      }),
      Booking.aggregate([
        {
          $match: {
            dome: domeObjectId,
            status: { $in: REVENUE_BOOKING_STATUSES }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $ifNull: ["$grandTotal", "$amount"]
              }
            }
          }
        }
      ]),
      Booking.countDocuments({
        dome: domeId,
        status: { $in: PAYMENT_PENDING_STATUSES }
      }),
      Booking.countDocuments({
        dome: domeId,
        status: { $in: PAYMENT_CONFIRMED_STATUSES }
      }),
      Booking.find({ dome: domeId })
        .populate("stall", "stallNumber")
        .populate("user", "fullname email")
        .sort({ createdAt: -1 })
    ]);

    const bookedStalls = bookedStallIds.length;
    const availableStalls = Math.max(totalStalls - bookedStalls, 0);

    res.json({
      totalStalls,
      bookedStalls,
      availableStalls,
      paymentPendingCount,
      paymentConfirmedCount,
      totalRevenue: revenue[0]?.totalRevenue || 0,
      bookings
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
