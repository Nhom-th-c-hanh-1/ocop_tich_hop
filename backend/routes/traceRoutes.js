
const express = require("express");
const router = express.Router();

const traceController = require("../controllers/traceController");

// API truy xuất nguồn gốc theo mã QR
router.get("/:code", traceController.getTrace);

module.exports = router;
