const express = require("express");
const router = express.Router();

const {
  createDome,
  getAllDomes,
  deleteDome
} = require("../controllers/domeController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// USER
router.get("/", getAllDomes);

// ADMIN
router.post("/", protect, adminOnly, createDome);
router.delete("/:id", protect, adminOnly, deleteDome);

module.exports = router;
