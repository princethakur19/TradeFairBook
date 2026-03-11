const Material = require("../models/Material");
const Dome = require("../models/Dome");

exports.createMaterial = async (req, res) => {
  try {
    const { dome, name, price, description, isActive } = req.body;

    if (!dome) {
      return res.status(400).json({
        success: false,
        message: "Dome selection is required"
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Material name is required"
      });
    }

    if (price === undefined || price === null || Number.isNaN(Number(price))) {
      return res.status(400).json({
        success: false,
        message: "Valid material price is required"
      });
    }

    const existingDome = await Dome.findById(dome);

    if (!existingDome) {
      return res.status(404).json({
        success: false,
        message: "Selected dome not found"
      });
    }

    const normalizedName = name.trim();
    const existingMaterial = await Material.findOne({
      dome,
      name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
    });

    if (existingMaterial) {
      return res.status(400).json({
        success: false,
        message: "Material with this name already exists for the selected dome"
      });
    }

    const material = await Material.create({
      dome,
      name: normalizedName,
      price: Number(price),
      description: description?.trim() || "",
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    const populatedMaterial = await Material.findById(material._id).populate("dome", "domeName");

    return res.status(201).json({
      success: true,
      message: "Material created successfully",
      data: populatedMaterial
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Material with this name already exists for the selected dome"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllMaterials = async (_req, res) => {
  try {
    const isAdminUser = ["ADMIN", "SUPER_ADMIN"].includes(String(_req.user?.role || "").toUpperCase());
    const filters = {};

    if (!isAdminUser) {
      filters.isActive = true;
    }

    if (_req.query?.dome) {
      filters.dome = _req.query.dome;
    }

    if (_req.query?.activeOnly === "true") {
      filters.isActive = true;
    }

    const materials = await Material.find(filters)
      .populate("dome", "domeName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { dome, name, price, description, isActive } = req.body;
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found"
      });
    }

    const nextDomeId = dome || material.dome?.toString();
    const normalizedName = name !== undefined ? name.trim() : material.name;

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Material name is required"
      });
    }

    if (dome !== undefined) {
      const existingDome = await Dome.findById(dome);

      if (!existingDome) {
        return res.status(404).json({
          success: false,
          message: "Selected dome not found"
        });
      }

      material.dome = dome;
    }

    if (dome !== undefined || name !== undefined) {
      const duplicateMaterial = await Material.findOne({
        _id: { $ne: material._id },
        dome: nextDomeId,
        name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
      });

      if (duplicateMaterial) {
        return res.status(400).json({
          success: false,
          message: "Material with this name already exists for the selected dome"
        });
      }
    }

    if (name !== undefined) {
      material.name = normalizedName;
    }

    if (price !== undefined) {
      if (Number.isNaN(Number(price))) {
        return res.status(400).json({
          success: false,
          message: "Valid material price is required"
        });
      }

      material.price = Number(price);
    }

    if (description !== undefined) {
      material.description = description.trim();
    }

    if (isActive !== undefined) {
      material.isActive = Boolean(isActive);
    }

    await material.save();
    await material.populate("dome", "domeName");

    return res.status(200).json({
      success: true,
      message: "Material updated successfully",
      data: material
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Material with this name already exists for the selected dome"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Material deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
