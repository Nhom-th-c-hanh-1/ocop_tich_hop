
const express = require("express");
const router = express.Router();

const controller = require("../controllers/lichSuSanXuatController");

router.get("/lo/:loId", controller.getByLo);
router.post("/", controller.create);

module.exports = router;
