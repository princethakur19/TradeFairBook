const Stall = require("../models/Stall");


// ======================================================
// Create Multiple Stalls
// ======================================================
exports.createStalls = async (req, res) => {
  try {
    const stalls = await Stall.insertMany(req.body, {
      ordered: false   // prevents full crash on duplicate
    });

    res.status(201).json({
      success: true,
      count: stalls.length,
      data: stalls
    });

  } catch (error) {

    // Duplicate key error (unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Some stalls already exist in this dome."
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ======================================================
// Get All Stalls (Manage Page)
// ======================================================
exports.getAllStalls = async (req, res) => {
  try {
    const stalls = await Stall.find()
      .populate("dome", "domeName")
      .sort({ createdAt: -1 });

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



// ======================================================
// Get Stalls By Dome
// ======================================================
exports.getStallsByDome = async (req, res) => {
  try {
    const stalls = await Stall.find({
      dome: req.params.domeId
    })
      .populate("dome", "name")
      .sort({ createdAt: 1 });

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



// ======================================================
// Update Stall (Edit Price / Status)
// ======================================================
exports.updateStall = async (req, res) => {
  try {
    const stall = await Stall.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("dome", "name");

    if (!stall) {
      return res.status(404).json({
        success: false,
        message: "Stall not found"
      });
    }

    res.status(200).json({
      success: true,
      data: stall
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ======================================================
// Delete Stall
// ======================================================
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
