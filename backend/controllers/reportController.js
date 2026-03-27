const Stall = require("../models/Stall");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

const ACTIVE_BOOKING_STATUSES = ["PENDING", "APPROVED", "PAID"];
const REVENUE_BOOKING_STATUSES = ["PAID"];
const PAYMENT_PENDING_STATUSES = ["APPROVED"];
const PAYMENT_CONFIRMED_STATUSES = ["PAID"];

exports.getDomeReport = async (req, res) => {
  try {
    const domeId = req.params.domeId;
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
