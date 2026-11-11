const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const controller = require("../controllers/lichSuSanXuatController");

const manage = roleMiddleware("admin", "co_so_san_xuat");

// Xem nhật ký của một lô: công khai (phục vụ truy xuất nguồn gốc)
router.get("/lo/:loId", controller.getByLo);

// Thêm, sửa, xóa: admin hoặc cơ sở sản xuất (controller kiểm tra thêm quyền sở hữu lô)
router.post("/", authMiddleware, manage, controller.create);
router.put("/:id", authMiddleware, manage, controller.update);
router.delete("/:id", authMiddleware, manage, controller.remove);

module.exports = router;
