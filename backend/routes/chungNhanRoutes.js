
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const controller = require("../controllers/chungNhanController");

const canView = roleMiddleware(
    "admin",
    "can_bo_kiem_dinh",
    "co_quan_quan_ly",
    "co_so_san_xuat"
);

const canManage = roleMiddleware(
    "admin",
    "can_bo_kiem_dinh"
);

router.get("/", authMiddleware, canView, controller.getAll);

router.get("/:id", authMiddleware, canView, controller.getById);

router.post("/", authMiddleware, canManage, controller.create);

router.put("/:id", authMiddleware, canManage, controller.update);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), controller.remove);

module.exports = router;
