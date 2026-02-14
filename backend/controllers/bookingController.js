const Booking = require("../models/Booking");
const Stall = require("../models/Stall");

exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

    await Stall.findByIdAndUpdate(req.body.stall, {
      status: "BOOKED"
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
