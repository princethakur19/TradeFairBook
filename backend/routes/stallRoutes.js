const express = require("express");
const router = express.Router();

const {
  createStalls,
  getStallsByDome,
  getAllStalls,
  updateStall,
  deleteStall
} = require("../controllers/stallController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// USER ROUTES
router.get("/", getAllStalls);
router.get("/:domeId", getStallsByDome);

// ADMIN ROUTES
router.post("/", protect, adminOnly, createStalls);
router.put("/:id", protect, adminOnly, updateStall);
router.delete("/:id", protect, adminOnly, deleteStall);

module.exports = router;
