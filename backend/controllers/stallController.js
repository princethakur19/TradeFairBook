const Stall = require("../models/Stall");

exports.createStalls = async (req, res) => {
  try {
    const stalls = await Stall.insertMany(req.body);
    res.status(201).json(stalls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStallsByDome = async (req, res) => {
  try {
    const stalls = await Stall.find({ dome: req.params.domeId });
    res.json(stalls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
