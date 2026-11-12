
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const controller = require("../controllers/kiemDinhController");

// Người được phép xem kết quả kiểm định
const canView = roleMiddleware(
    "admin",
    "can_bo_kiem_dinh",
    "co_quan_quan_ly"
);

// Chỉ admin và nhân viên kiểm định được chỉnh sửa
const canManage = roleMiddleware(
    "admin",
    "can_bo_kiem_dinh"
);

// Xem danh sách
router.get("/", authMiddleware, canView, controller.getAll);

// Xem chi tiết
router.get("/:id", authMiddleware, canView, controller.getById);

// Tạo phiếu kiểm định
router.post("/", authMiddleware, canManage, controller.create);

// Sửa phiếu kiểm định
router.put("/:id", authMiddleware, canManage, controller.update);

// Xóa phiếu kiểm định
router.delete("/:id", authMiddleware, roleMiddleware("admin"), controller.remove);

module.exports = router;
