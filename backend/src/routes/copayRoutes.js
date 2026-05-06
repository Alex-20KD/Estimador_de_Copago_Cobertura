const express = require("express");
const { estimateCopayController } = require("../controllers/copayController");

const router = express.Router();

router.post("/", estimateCopayController);

module.exports = router;
