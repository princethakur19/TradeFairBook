const express = require("express");
const router = express.Router();
const { createStalls, getStallsByDome } = require("../controllers/stallController");

router.post("/", createStalls);
router.get("/:domeId", getStallsByDome);

module.exports = router;
