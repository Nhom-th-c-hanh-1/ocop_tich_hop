const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");
const controller = require("../controllers/vungNguyenLieuController");

const manage = allow("admin", "co_so_san_xuat");

router.get("/", auth, manage, controller.getAll);
router.get("/:id", auth, manage, controller.getById);
router.post("/", auth, manage, controller.create);
router.put("/:id", auth, manage, controller.update);
router.delete("/:id", auth, manage, controller.remove);

module.exports = router;
