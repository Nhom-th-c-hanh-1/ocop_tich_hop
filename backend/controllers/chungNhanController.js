
const db = require("../config/db");

const trangThaiHopLe = [
  "con_hieu_luc",
  "het_hieu_luc",
  "bi_thu_hoi",
  "cho_duyet"
];

// GET /api/chung-nhan
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
          c.*,
          p.TenSanPham
       FROM chung_nhan c
       LEFT JOIN san_pham_ocop p
         ON c.MaSanPham = p.MaSanPham
       ORDER BY c.MaChungNhan DESC`
    );

    return res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách chứng nhận:", error);
    return res.status(500).json({
      message: "Không thể lấy danh sách chứng nhận"
    });
  }
};

// GET /api/chung-nhan/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, p.TenSanPham
       FROM chung_nhan c
       LEFT JOIN san_pham_ocop p
         ON c.MaSanPham = p.MaSanPham
       WHERE c.MaChungNhan = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy chứng nhận"
      });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi lấy chi tiết chứng nhận:", error);
    return res.status(500).json({
      message: "Không thể lấy chi tiết chứng nhận"
    });
  }
};

// POST /api/chung-nhan
exports.create = async (req, res) => {
  try {
    const {
      MaSanPham,
      SoChungNhan,
      TenChungNhan,
      DonViCap,
      NgayCap,
      NgayHetHan,
      TepChungNhan,
      TrangThai,
      GhiChu
    } = req.body;

    if (
      !MaSanPham ||
      !SoChungNhan ||
      !TenChungNhan ||
      !DonViCap
    ) {
      return res.status(400).json({
        message: "Cần nhập sản phẩm, số chứng nhận, tên chứng nhận và đơn vị cấp"
      });
    }

    const trangThai = TrangThai || "cho_duyet";

    if (!trangThaiHopLe.includes(trangThai)) {
      return res.status(400).json({
        message: "Trạng thái chứng nhận không hợp lệ"
      });
    }

    if (
      NgayCap &&
      NgayHetHan &&
      new Date(NgayHetHan) < new Date(NgayCap)
    ) {
      return res.status(400).json({
        message: "Ngày hết hạn không được trước ngày cấp"
      });
    }

    const [result] = await db.query(
      `INSERT INTO chung_nhan
        (MaSanPham, SoChungNhan, TenChungNhan, DonViCap,
         NgayCap, NgayHetHan, TepChungNhan, TrangThai, GhiChu)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(MaSanPham),
        String(SoChungNhan).trim(),
        String(TenChungNhan).trim(),
        String(DonViCap).trim(),
        NgayCap || null,
        NgayHetHan || null,
        TepChungNhan || null,
        trangThai,
        GhiChu || null
      ]
    );

    return res.status(201).json({
      message: "Thêm chứng nhận thành công",
      MaChungNhan: result.insertId
    });
  } catch (error) {
    console.error("Lỗi thêm chứng nhận:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Số chứng nhận đã tồn tại"
      });
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message: "Sản phẩm không tồn tại"
      });
    }

    return res.status(500).json({
      message: "Không thể thêm chứng nhận"
    });
  }
};

// PUT /api/chung-nhan/:id
exports.update = async (req, res) => {
  try {
    const {
      MaSanPham,
      SoChungNhan,
      TenChungNhan,
      DonViCap,
      NgayCap,
      NgayHetHan,
      TepChungNhan,
      TrangThai,
      GhiChu
    } = req.body;

    if (
      !MaSanPham ||
      !SoChungNhan ||
      !TenChungNhan ||
      !DonViCap ||
      !trangThaiHopLe.includes(TrangThai)
    ) {
      return res.status(400).json({
        message: "Thông tin chứng nhận không hợp lệ"
      });
    }

    if (
      NgayCap &&
      NgayHetHan &&
      new Date(NgayHetHan) < new Date(NgayCap)
    ) {
      return res.status(400).json({
        message: "Ngày hết hạn không được trước ngày cấp"
      });
    }

    const [result] = await db.query(
      `UPDATE chung_nhan
       SET MaSanPham = ?,
           SoChungNhan = ?,
           TenChungNhan = ?,
           DonViCap = ?,
           NgayCap = ?,
           NgayHetHan = ?,
           TepChungNhan = ?,
           TrangThai = ?,
           GhiChu = ?
       WHERE MaChungNhan = ?`,
      [
        Number(MaSanPham),
        String(SoChungNhan).trim(),
        String(TenChungNhan).trim(),
        String(DonViCap).trim(),
        NgayCap || null,
        NgayHetHan || null,
        TepChungNhan || null,
        TrangThai,
        GhiChu || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy chứng nhận"
      });
    }

    return res.json({
      message: "Cập nhật chứng nhận thành công"
    });
  } catch (error) {
    console.error("Lỗi cập nhật chứng nhận:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Số chứng nhận đã tồn tại"
      });
    }

    return res.status(500).json({
      message: "Không thể cập nhật chứng nhận"
    });
  }
};

// DELETE /api/chung-nhan/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM chung_nhan WHERE MaChungNhan = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy chứng nhận"
      });
    }

    return res.json({
      message: "Xóa chứng nhận thành công"
    });
  } catch (error) {
    console.error("Lỗi xóa chứng nhận:", error);
    return res.status(500).json({
      message: "Không thể xóa chứng nhận"
    });
  }
};
