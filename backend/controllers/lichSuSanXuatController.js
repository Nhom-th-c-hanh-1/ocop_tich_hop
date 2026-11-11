
const db = require("../config/db");

// GET /api/lich-su-san-xuat/lo/:loId
// Lấy toàn bộ các giai đoạn của một lô sản xuất
exports.getByLo = async (req, res) => {
  try {
    const loId = Number(req.params.loId);

    if (!Number.isInteger(loId) || loId <= 0) {
      return res.status(400).json({
        message: "Mã lô sản xuất không hợp lệ"
      });
    }

    const [rows] = await db.query(
      `SELECT
          MaQuaTrinh,
          MaLo,
          TenGiaiDoan,
          MoTa,
          NgayBatDau,
          NgayKetThuc,
          DiaDiem,
          HinhAnh,
          NguoiCapNhat,
          NgayTao
       FROM qua_trinh_san_xuat
       WHERE MaLo = ?
       ORDER BY NgayBatDau ASC, MaQuaTrinh ASC`,
      [loId]
    );

    return res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy quy trình sản xuất:", error);

    return res.status(500).json({
      message: "Không thể lấy quy trình sản xuất"
    });
  }
};

// POST /api/lich-su-san-xuat
// Thêm một giai đoạn sản xuất
exports.create = async (req, res) => {
  try {
    const {
      MaLo,
      TenGiaiDoan,
      MoTa,
      NgayBatDau,
      NgayKetThuc,
      DiaDiem,
      HinhAnh,
      NguoiCapNhat
    } = req.body;

    if (
      !MaLo ||
      !Number.isInteger(Number(MaLo)) ||
      Number(MaLo) <= 0 ||
      !TenGiaiDoan ||
      !String(TenGiaiDoan).trim()
    ) {
      return res.status(400).json({
        message: "Cần nhập mã lô và tên giai đoạn sản xuất"
      });
    }

    if (
      NgayBatDau &&
      NgayKetThuc &&
      new Date(NgayKetThuc) < new Date(NgayBatDau)
    ) {
      return res.status(400).json({
        message: "Ngày kết thúc không được trước ngày bắt đầu"
      });
    }

    const [result] = await db.query(
      `INSERT INTO qua_trinh_san_xuat
        (MaLo, TenGiaiDoan, MoTa, NgayBatDau,
         NgayKetThuc, DiaDiem, HinhAnh, NguoiCapNhat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(MaLo),
        String(TenGiaiDoan).trim(),
        MoTa || null,
        NgayBatDau || null,
        NgayKetThuc || null,
        DiaDiem || null,
        HinhAnh || null,
        NguoiCapNhat || null
      ]
    );

    return res.status(201).json({
      message: "Thêm giai đoạn sản xuất thành công",
      MaQuaTrinh: result.insertId
    });
  } catch (error) {
    console.error("Lỗi thêm quy trình sản xuất:", error);

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message: "Lô sản xuất hoặc người cập nhật không tồn tại"
      });
    }

    return res.status(500).json({
      message: "Không thể thêm giai đoạn sản xuất"
    });
  }
};
