const Stall = require("../models/Stall");
const Booking = require("../models/Booking");
const defaultDomes = require("../data/defaultDomes");
const { buildDefaultStallsForDome } = require("../data/defaultStalls");
const { getAllFallbackBookings } = require("../data/fallbackBookings");
const connectDB = require("../utils/db");
const { ACTIVE_BOOKING_STATUSES } = require("../utils/bookingStatus");
const { getDatabaseErrorMessage } = require("../utils/dbError");
const { isFallbackDataEnabled } = require("../utils/fallbackMode");

const toPlainStall = (stall) => (
  typeof stall?.toObject === "function" ? stall.toObject() : { ...stall }
);

const applyBookedStatuses = (stalls, activeBookedStallIds) => stalls.map((stall) => {
  const plainStall = toPlainStall(stall);
  const stallId = String(plainStall._id || "");

  if (!activeBookedStallIds.has(stallId)) {
    return plainStall;
  }

  return {
    ...plainStall,
    status: "BOOKED"
  };
});

const getActiveFallbackBookedStallIds = (domeId = "") => new Set(
  getAllFallbackBookings()
    .filter((booking) => {
      const bookingDomeId = String(booking?.dome?._id || booking?.dome || "");
      return (
        (!domeId || bookingDomeId === String(domeId)) &&
        ACTIVE_BOOKING_STATUSES.includes(String(booking?.status || "").toUpperCase())
      );
    })
    .map((booking) => String(booking?.stall?._id || booking?.stall || ""))
    .filter(Boolean)
);

const getActiveBookedStallIds = async (stallIds) => {
  if (!stallIds.length) {
    return new Set();
  }

  const bookedStallIds = await Booking.distinct("stall", {
    stall: { $in: stallIds },
    status: { $in: ACTIVE_BOOKING_STATUSES }
  });

  return new Set(bookedStallIds.map(String));
};

exports.createStalls = async (req, res) => {
  try {
    const stalls = await Stall.insertMany(req.body, {
      ordered: false
    });

    return res.status(201).json({
      success: true,
      message: "Stalls created successfully",
      count: stalls.length,
      data: stalls
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Some stalls already exist in this dome."
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllStalls = async (_req, res) => {
  try {
    await connectDB();

    const stalls = await Stall.find().populate("dome", "domeName location");
    const bookedStallIds = await getActiveBookedStallIds(stalls.map((stall) => stall._id).filter(Boolean));
    const normalizedStalls = applyBookedStatuses(stalls, bookedStallIds);

    return res.status(200).json({
      success: true,
      count: normalizedStalls.length,
      data: normalizedStalls
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getDatabaseErrorMessage(error)
    });
  }
};

exports.getStallsByDome = async (req, res) => {
  try {
    if (isFallbackDataEnabled()) {
      const fallbackDome = defaultDomes.find((dome) => dome._id === req.params.domeId);

      if (fallbackDome) {
        const stalls = applyBookedStatuses(
          buildDefaultStallsForDome(req.params.domeId),
          getActiveFallbackBookedStallIds(req.params.domeId)
        );

        return res.status(200).json({
          success: true,
          count: stalls.length,
          data: stalls,
          fallback: true
        });
      }
    }

    await connectDB();

    const stalls = await Stall.find({
      dome: req.params.domeId
    })
      .populate("dome", "name")
      .sort({ createdAt: 1 });
    const bookedStallIds = await getActiveBookedStallIds(stalls.map((stall) => stall._id).filter(Boolean));
    const normalizedStalls = applyBookedStatuses(stalls, bookedStallIds);

    return res.status(200).json({
      success: true,
      count: normalizedStalls.length,
      data: normalizedStalls
    });
  } catch (error) {
    const fallbackDome = defaultDomes.find((dome) => dome._id === req.params.domeId);

    if (fallbackDome) {
      const stalls = applyBookedStatuses(
        buildDefaultStallsForDome(req.params.domeId),
        getActiveFallbackBookedStallIds(req.params.domeId)
      );

      return res.status(200).json({
        success: true,
        count: stalls.length,
        data: stalls,
        fallback: true
      });
    }

    return res.status(500).json({
      success: false,
      message: getDatabaseErrorMessage(error)
    });
  }
};

exports.updateStall = async (req, res) => {
  try {
    const { price, status } = req.body;
    const stall = await Stall.findByIdAndUpdate(
      req.params.id,
      { price, status },
      { new: true, runValidators: true }
    );

    if (!stall) {
      return res.status(404).json({
        success: false,
        message: "Stall not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stall updated successfully",
      data: stall
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getDatabaseErrorMessage(error)
    });
  }
};

exports.deleteStall = async (req, res) => {
  try {
    const stall = await Stall.findByIdAndDelete(req.params.id);

    if (!stall) {
      return res.status(404).json({
        success: false,
        message: "Stall not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stall deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getDatabaseErrorMessage(error)
    });
  }
};

exports.getStallById = async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id).populate("dome", "domeName location");

    if (!stall) {
      return res.status(404).json({
        success: false,
        message: "Stall not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: stall
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getDatabaseErrorMessage(error)
    });
  }
};
