const Stall = require("../models/Stall");

// Create multiple stalls
exports.createStalls = async (req, res) => {
  try {
    const stalls = await Stall.insertMany(req.body);
    res.status(201).json({
      success: true,
      data: stalls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get stalls by dome
exports.getStallsByDome = async (req, res) => {
  try {
    const stalls = await Stall.find({ dome: req.params.domeId });

    res.status(200).json({
      success: true,
      count: stalls.length,
      data: stalls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
