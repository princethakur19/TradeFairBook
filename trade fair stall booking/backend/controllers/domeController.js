const Dome = require("../models/Dome");

// Create Dome (Admin)
exports.createDome = async (req, res) => {
  try {
    const dome = await Dome.create(req.body);
    res.status(201).json({
      success: true,
      data: dome
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Domes (For Dome Selection Page)
exports.getAllDomes = async (req, res) => {
  try {
    const domes = await Dome.find();
    res.status(200).json({
      success: true,
      count: domes.length,
      data: domes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
