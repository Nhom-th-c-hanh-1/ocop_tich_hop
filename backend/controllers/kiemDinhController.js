
const db = require("../config/db");

// GET /api/kiem-dinh
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
          k.*,
          l.MaSoLo,
          p.TenSanPham
       FROM kiem_dinh k
       LEFT JOIN lo_san_xuat l ON k.MaLo = l.MaLo
       LEFT JOIN san_pham_ocop p ON l.MaSanPham = p.MaSanPham
       ORDER BY k.MaKiemDinh DESC`
    );

    return res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách kiểm định:", error);
    return res.status(500).json({
      message: "Không thể lấy danh sách kiểm định"
    });
  }
};

// GET /api/kiem-dinh/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT k.*, l.MaSoLo, p.TenSanPham
       FROM kiem_dinh k
       LEFT JOIN lo_san_xuat l ON k.MaLo = l.MaLo
       LEFT JOIN san_pham_ocop p ON l.MaSanPham = p.MaSanPham
       WHERE k.MaKiemDinh = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy kết quả kiểm định"
      });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi lấy chi tiết kiểm định:", error);
    return res.status(500).json({
      message: "Không thể lấy chi tiết kiểm định"
    });
  }
};

// POST /api/kiem-dinh
exports.create = async (req, res) => {
  try {
    const {
      MaLo,
      DonViKiemDinh,
      NguoiKiemDinh,
      NgayGuiMau,
      NgayKiemDinh,
      KetQua,
      ChiTieuKiemDinh,
      NoiDungKetQua,
      TepKetQua,
      GhiChu
    } = req.body;

    const ketQuaHopLe = [
      "cho_kiem_dinh",
      "dat",
      "khong_dat"
    ];

    if (
      !MaLo ||
      !DonViKiemDinh ||
      !String(DonViKiemDinh).trim()
    ) {
      return res.status(400).json({
        message: "Cần nhập mã lô và đơn vị kiểm định"
      });
    }

    const ketQua = KetQua || "cho_kiem_dinh";

    if (!ketQuaHopLe.includes(ketQua)) {
      return res.status(400).json({
        message: "Kết quả kiểm định không hợp lệ"
      });
    }

    const [result] = await db.query(
      `INSERT INTO kiem_dinh
        (MaLo, DonViKiemDinh, NguoiKiemDinh,
         NgayGuiMau, NgayKiemDinh, KetQua,
         ChiTieuKiemDinh, NoiDungKetQua, TepKetQua, GhiChu)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(MaLo),
        String(DonViKiemDinh).trim(),
        NguoiKiemDinh || null,
        NgayGuiMau || null,
        NgayKiemDinh || null,
        ketQua,
        ChiTieuKiemDinh || null,
        NoiDungKetQua || null,
        TepKetQua || null,
        GhiChu || null
      ]
    );

    return res.status(201).json({
      message: "Thêm kết quả kiểm định thành công",
      MaKiemDinh: result.insertId
    });
  } catch (error) {
    console.error("Lỗi thêm kiểm định:", error);

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message: "Lô sản xuất hoặc người kiểm định không tồn tại"
      });
    }

    return res.status(500).json({
      message: "Không thể thêm kết quả kiểm định"
    });
  }
};

// PUT /api/kiem-dinh/:id
exports.update = async (req, res) => {
  try {
    const {
      MaLo,
      DonViKiemDinh,
      NguoiKiemDinh,
      NgayGuiMau,
      NgayKiemDinh,
      KetQua,
      ChiTieuKiemDinh,
      NoiDungKetQua,
      TepKetQua,
      GhiChu
    } = req.body;

    const ketQuaHopLe = [
      "cho_kiem_dinh",
      "dat",
      "khong_dat"
    ];

    if (
      !MaLo ||
      !DonViKiemDinh ||
      !String(DonViKiemDinh).trim() ||
      !ketQuaHopLe.includes(KetQua)
    ) {
      return res.status(400).json({
        message: "Thông tin kiểm định không hợp lệ"
      });
    }

    const [result] = await db.query(
      `UPDATE kiem_dinh
       SET MaLo = ?,
           DonViKiemDinh = ?,
           NguoiKiemDinh = ?,
           NgayGuiMau = ?,
           NgayKiemDinh = ?,
           KetQua = ?,
           ChiTieuKiemDinh = ?,
           NoiDungKetQua = ?,
           TepKetQua = ?,
           GhiChu = ?
       WHERE MaKiemDinh = ?`,
      [
        Number(MaLo),
        String(DonViKiemDinh).trim(),
        NguoiKiemDinh || null,
        NgayGuiMau || null,
        NgayKiemDinh || null,
        KetQua,
        ChiTieuKiemDinh || null,
        NoiDungKetQua || null,
        TepKetQua || null,
        GhiChu || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy kết quả kiểm định"
      });
    }

    return res.json({
      message: "Cập nhật kết quả kiểm định thành công"
    });
  } catch (error) {
    console.error("Lỗi cập nhật kiểm định:", error);
    return res.status(500).json({
      message: "Không thể cập nhật kết quả kiểm định"
    });
  }
};

// DELETE /api/kiem-dinh/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM kiem_dinh WHERE MaKiemDinh = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy kết quả kiểm định"
      });
    }

    return res.json({
      message: "Xóa kết quả kiểm định thành công"
    });
  } catch (error) {
    console.error("Lỗi xóa kiểm định:", error);
    return res.status(500).json({
      message: "Không thể xóa kết quả kiểm định"
    });
  }
};
