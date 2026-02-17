const Booking = require("../models/Booking");
const Stall = require("../models/Stall");

/* ===============================
   CREATE BOOKING
================================= */
exports.createBooking = async (req, res) => {
  try {
    const { user, stall, dome, amount, status } = req.body;

    // Validation
    if (!user || !stall || !dome || !amount) {
      return res.status(400).json({
        success: false,
        message: "User, stall, dome, and amount are required"
      });
    }

    // Check if stall already booked
    const existingBooking = await Booking.findOne({ stall, status: { $in: ["PAID", "PENDING"] } });
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "This stall is already booked"
      });
    }

    // Create booking
    const booking = await Booking.create({
      user,
      stall,
      dome,
      amount,
      status: status || "PENDING"
    });

    // Update stall status to BOOKED
    await Stall.findByIdAndUpdate(stall, {
      status: "BOOKED"
    });

    // Populate references
    const populatedBooking = await booking.populate("user stall dome");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({
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

    const bookings = await Booking.find({ user: userId })
      .populate("user", "name email")
      .populate("stall", "stallNumber side price")
      .populate("dome", "domeName location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error("Get User Bookings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   GET ALL BOOKINGS (ADMIN)
================================= */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("stall", "stallNumber side price")
      .populate("dome", "domeName location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error("Get All Bookings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   UPDATE BOOKING STATUS
================================= */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    if (!status || !["PAID", "PENDING"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true, runValidators: true }
    ).populate("user stall dome");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking
    });

  } catch (error) {
    console.error("Update Booking Status Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   CANCEL BOOKING
================================= */
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Release the stall
    await Stall.findByIdAndUpdate(booking.stall, {
      status: "AVAILABLE"
    });

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully"
    });

  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
