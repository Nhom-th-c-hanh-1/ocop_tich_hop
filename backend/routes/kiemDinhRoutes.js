
const express = require("express");
const router = express.Router();

const kiemDinhController = require("../controllers/kiemDinhController");

router.get("/", kiemDinhController.getAll);
router.get("/:id", kiemDinhController.getById);
router.post("/", kiemDinhController.create);
router.put("/:id", kiemDinhController.update);
router.delete("/:id", kiemDinhController.remove);

module.exports = router;
