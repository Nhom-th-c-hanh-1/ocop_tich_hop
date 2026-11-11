
const express = require("express");
const router = express.Router();

const loSanXuatController = require("../controllers/loSanXuatController");

router.get("/", loSanXuatController.getAll);
router.get("/:id", loSanXuatController.getById);
router.post("/", loSanXuatController.create);
router.put("/:id", loSanXuatController.update);
router.delete("/:id", loSanXuatController.remove);

// Tạo mã QR cho lô sản xuất
router.post("/:id/qr", loSanXuatController.generateQR);

module.exports = router;
