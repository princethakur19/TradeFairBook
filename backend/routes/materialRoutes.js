const express = require("express");
const router = express.Router();

const {
  createMaterial,
  getAllMaterials,
  updateMaterial,
  deleteMaterial
} = require("../controllers/materialController");
const { optionalProtect, protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", optionalProtect, getAllMaterials);
router.use(protect, adminOnly);
router.post("/", createMaterial);
router.route("/:id").put(updateMaterial).delete(deleteMaterial);

module.exports = router;
