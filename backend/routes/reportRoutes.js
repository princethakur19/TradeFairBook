const express = require("express");
const router = express.Router();
const { getDomeReport } = require("../controllers/reportController");

router.get("/:domeId", getDomeReport);

module.exports = router;
