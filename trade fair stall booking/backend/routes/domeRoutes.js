const express = require("express");
const router = express.Router();

const {
  createDome,
  getAllDomes
} = require("../controllers/domeController");

router.post("/", createDome);     // Create dome
router.get("/", getAllDomes);      // Fetch domes

module.exports = router;
