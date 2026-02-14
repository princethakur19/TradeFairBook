const Stall = require("../models/Stall");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

exports.getDomeReport = async (req, res) => {
  try {
    const domeId = req.params.domeId;

    const totalStalls = await Stall.countDocuments({ dome: domeId });

    const bookedStalls = await Stall.countDocuments({
      dome: domeId,
      status: "BOOKED"
    });

    const availableStalls = totalStalls - bookedStalls;

    const revenue = await Booking.aggregate([
      {
        $match: {
          dome: new mongoose.Types.ObjectId(domeId),
          status: "PAID"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    const bookings = await Booking.find({ dome: domeId })
      .populate("stall", "stallNumber")
      .populate("user", "name");

    res.json({
      totalStalls,
      bookedStalls,
      availableStalls,
      totalRevenue: revenue[0]?.totalRevenue || 0,
      bookings
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
