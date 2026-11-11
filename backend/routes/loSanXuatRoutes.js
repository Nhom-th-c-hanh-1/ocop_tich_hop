const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");
const controller = require("../controllers/loSanXuatController");

const manage = allow("admin", "co_so_san_xuat");

router.get("/", auth, manage, controller.getAll);
router.get("/:id", auth, manage, controller.getById);
router.post("/", auth, manage, controller.create);
router.put("/:id", auth, manage, controller.update);
router.delete("/:id", auth, manage, controller.remove);
router.post("/:id/qr", auth, manage, controller.generateQR);

module.exports = router;
