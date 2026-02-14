const express = require("express");
const router = express.Router();

const {
  createDome,
  getAllDomes,
  updateDome,
  deleteDome
} = require("../controllers/domeController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// USER
router.get("/", getAllDomes);

// ADMIN
router.post("/", protect, adminOnly, createDome);
router.put("/:id", protect, adminOnly, updateDome);
router.delete("/:id", protect, adminOnly, deleteDome);

module.exports = router;
