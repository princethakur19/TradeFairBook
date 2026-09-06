const Stall = require("../models/Stall");
const defaultDomes = require("../data/defaultDomes");
const { buildDefaultStallsForDome } = require("../data/defaultStalls");
const connectDB = require("../utils/db");
const { getDatabaseErrorMessage } = require("../utils/dbError");
const { isFallbackDataEnabled } = require("../utils/fallbackMode");

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

    return res.status(200).json({
      success: true,
      count: stalls.length,
      data: stalls
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
        const stalls = buildDefaultStallsForDome(req.params.domeId);

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

    return res.status(200).json({
      success: true,
      count: stalls.length,
      data: stalls
    });
  } catch (error) {
    const fallbackDome = defaultDomes.find((dome) => dome._id === req.params.domeId);

    if (fallbackDome) {
      const stalls = buildDefaultStallsForDome(req.params.domeId);

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
