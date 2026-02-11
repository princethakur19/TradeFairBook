const Dome = require("../models/Dome");

// CREATE dome
exports.createDome = async (req, res) => {
  try {
    const dome = await Dome.create(req.body);
    res.status(201).json({
      success: true,
      data: dome
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET all domes
exports.getAllDomes = async (req, res) => {
  try {
    const domes = await Dome.find();
    res.status(200).json({
      success: true,
      count: domes.length,
      data: domes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE dome
exports.deleteDome = async (req, res) => {
  try {
    await Dome.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Dome deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
