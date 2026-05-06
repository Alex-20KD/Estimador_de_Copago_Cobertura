const express = require("express");
const { analyzeSymptom } = require("../controllers/analyzeController");

const router = express.Router();

router.post("/", analyzeSymptom);

module.exports = router;
