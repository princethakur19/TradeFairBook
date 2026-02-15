const express = require("express");
const router = express.Router();

const {
  createStalls,
  getStallsByDome,
} = require("../controllers/stallController");

// Create multiple stalls
router.post("/", createStalls);

// Get stalls by dome
router.get("/:domeId", getStallsByDome);

module.exports = router;
