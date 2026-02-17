const express = require("express");
const router = express.Router();

const {
  createStalls,
  getStallsByDome,
  getAllStalls,
  updateStall,
  deleteStall
} = require("../controllers/stallController");


// ===============================
// Create multiple stalls
// ===============================
router.post("/", createStalls);


// ===============================
// Get all stalls (Manage page)
// ===============================
router.get("/", getAllStalls);


// ===============================
// Get stalls by dome
// ===============================
router.get("/dome/:domeId", getStallsByDome);


// ===============================
// Update stall
// ===============================
router.put("/:id", updateStall);


// ===============================
// Delete stall
// ===============================
router.delete("/:id", deleteStall);


module.exports = router;
