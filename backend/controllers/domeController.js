const Dome = require("../models/Dome");

/* ===============================
   CREATE DOME
================================= */
exports.createDome = async (req, res) => {
  try {
    const { domeName, location, description, image, status } = req.body;

    // Basic validation
    if (!domeName || !location) {
      return res.status(400).json({
        success: false,
        message: "Dome name and location are required"
      });
    }

    const newDome = await Dome.create({
      domeName,
      location,
      description,
      image,
      status
    });

    res.status(201).json({
      success: true,
      message: "Dome created successfully",
      data: newDome
    });

  } catch (error) {
    console.error("Create Dome Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   GET ALL DOMES
================================= */
exports.getAllDomes = async (req, res) => {
  try {
    const domes = await Dome.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: domes.length,
      data: domes
    });

  } catch (error) {
    console.error("Get Domes Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   UPDATE DOME
================================= */
exports.updateDome = async (req, res) => {
  try {
    const { domeName, location, description, image, status } = req.body;

    if (!domeName || !location) {
      return res.status(400).json({
        success: false,
        message: "Dome name and location are required"
      });
    }

    const updatedDome = await Dome.findByIdAndUpdate(
      req.params.id,
      {
        domeName,
        location,
        description,
        image,
        status
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedDome) {
      return res.status(404).json({
        success: false,
        message: "Dome not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Dome updated successfully",
      data: updatedDome
    });
  } catch (error) {
    console.error("Update Dome Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   DELETE DOME
================================= */
exports.deleteDome = async (req, res) => {
  try {
    const dome = await Dome.findById(req.params.id);

    if (!dome) {
      return res.status(404).json({
        success: false,
        message: "Dome not found"
      });
    }

    await dome.deleteOne();

    res.status(200).json({
      success: true,
      message: "Dome deleted successfully"
    });

  } catch (error) {
    console.error("Delete Dome Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
