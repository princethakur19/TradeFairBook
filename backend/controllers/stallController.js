const Stall = require("../models/Stall");

// Create multiple stalls
exports.createStalls = async (req, res) => {
  try {
    const stalls = await Stall.insertMany(req.body);
    res.status(201).json({
      success: true,
      message: "Stalls created successfully",
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

// Get all stalls
exports.getAllStalls = async (req, res) => {
  try {
    const stalls = await Stall.find().populate("dome", "domeName location");

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

// Update stall
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

    res.status(200).json({
      success: true,
      message: "Stall updated successfully",
      data: stall
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete stall
exports.deleteStall = async (req, res) => {
  try {
    const stall = await Stall.findByIdAndDelete(req.params.id);

    if (!stall) {
      return res.status(404).json({
        success: false,
        message: "Stall not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Stall deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
