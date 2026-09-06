const Dome = require("../models/Dome");
const Stall = require("../models/Stall");
const defaultDomes = require("../data/defaultDomes");
const connectDB = require("../utils/db");
const { isFallbackDataEnabled } = require("../utils/fallbackMode");

/* =====================================================
   CREATE DOME
===================================================== */
exports.createDome = async (req, res) => {
  try {
    const { domeName, location, description, image, status } = req.body;

    if (!domeName || !location) {
      return res.status(400).json({
        success: false,
        message: "Dome name and location are required"
      });
    }

    const existingDome = await Dome.findOne({
      domeName: domeName.trim()
    });

    if (existingDome) {
      return res.status(400).json({
        success: false,
        message: "Dome with this name already exists"
      });
    }

    const newDome = await Dome.create({
      domeName: domeName.trim(),
      location: location.trim(),
      description: description || "",
      image: image || "",
      status: status || "ACTIVE"
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


/* =====================================================
   GET ALL DOMES  (FIXED HERE)
===================================================== */
exports.getAllDomes = async (req, res) => {
  try {
    if (isFallbackDataEnabled()) {
      return res.status(200).json({
        success: true,
        count: defaultDomes.length,
        data: defaultDomes,
        fallback: true
      });
    }

    await connectDB();

    const [domes, stallStats] = await Promise.all([
      Dome.find().sort({ createdAt: -1 }).lean(),
      Stall.aggregate([
        {
          $match: {
            dome: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: "$dome",
            totalStalls: { $sum: 1 },
            availableStalls: {
              $sum: {
                $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0]
              }
            },
            bookedStalls: {
              $sum: {
                $cond: [{ $eq: ["$status", "BOOKED"] }, 1, 0]
              }
            },
            startingPrice: { $min: "$price" }
          }
        }
      ])
    ]);

    const statsByDome = stallStats.reduce((acc, item) => {
      if (!item?._id) return acc;
      acc[item._id.toString()] = item;
      return acc;
    }, {});

    const domesWithStats = domes.map((dome) => {
      const stats = statsByDome[dome._id.toString()];

      return {
        ...dome,
        totalStalls: stats?.totalStalls || 0,
        availableStalls: stats?.availableStalls || 0,
        bookedStalls: stats?.bookedStalls || 0,
        startingPrice: stats?.startingPrice || 0
      };
    });

    const visibleDomes = domesWithStats.length ? domesWithStats : defaultDomes;

    res.status(200).json({
      success: true,
      count: visibleDomes.length,
      data: visibleDomes
    });

  } catch (error) {
    console.error("Get Domes Error:", error);
    res.status(200).json({
      success: true,
      count: defaultDomes.length,
      data: defaultDomes,
      fallback: true
    });
  }
};


/* =====================================================
   GET SINGLE DOME BY ID
===================================================== */
exports.getDomeById = async (req, res) => {
  try {
    if (isFallbackDataEnabled()) {
      const fallbackDome = defaultDomes.find((dome) => dome._id === req.params.id);

      if (fallbackDome) {
        return res.status(200).json({
          success: true,
          data: fallbackDome,
          fallback: true
        });
      }
    }

    await connectDB();

    const dome = await Dome.findById(req.params.id);

    if (!dome) {
      return res.status(404).json({
        success: false,
        message: "Dome not found"
      });
    }

    res.status(200).json({
      success: true,
      data: dome
    });

  } catch (error) {
    console.error("Get Dome By ID Error:", error);
    const fallbackDome = defaultDomes.find((dome) => dome._id === req.params.id);

    if (fallbackDome) {
      return res.status(200).json({
        success: true,
        data: fallbackDome,
        fallback: true
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* =====================================================
   UPDATE DOME (SAFE UPDATE FIXED)
===================================================== */
exports.updateDome = async (req, res) => {
  try {
    const { domeName, location, description, image, status } = req.body;

    const dome = await Dome.findById(req.params.id);

    if (!dome) {
      return res.status(404).json({
        success: false,
        message: "Dome not found"
      });
    }

    // Only update if provided
    if (domeName) dome.domeName = domeName.trim();
    if (location) dome.location = location.trim();
    if (description !== undefined) dome.description = description;
    if (image !== undefined && image !== "") dome.image = image;
    if (status) dome.status = status;

    await dome.save();

    res.status(200).json({
      success: true,
      message: "Dome updated successfully",
      data: dome
    });

  } catch (error) {
    console.error("Update Dome Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* =====================================================
   DELETE DOME
===================================================== */
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
