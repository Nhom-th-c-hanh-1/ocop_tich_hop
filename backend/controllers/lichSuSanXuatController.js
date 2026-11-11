const db = require("../config/db");
const { getScope, canAccessLot } = require("../utils/ownership");

function parseId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function validateBody(body) {
  const { TenGiaiDoan, NgayBatDau, NgayKetThuc } = body;
  if (!TenGiaiDoan || !String(TenGiaiDoan).trim()) {
    return "Cần nhập tên giai đoạn sản xuất";
  }
  if (NgayBatDau && NgayKetThuc && new Date(NgayKetThuc) < new Date(NgayBatDau)) {
    return "Ngày kết thúc không được trước ngày bắt đầu";
  }
  return null;
}

// GET /api/lich-su-san-xuat/lo/:loId
// Giữ công khai để trang truy xuất nguồn gốc vẫn đọc được
exports.getByLo = async (req, res) => {
  try {
    const loId = parseId(req.params.loId);
    if (!loId) {
      return res.status(400).json({ message: "Mã lô sản xuất không hợp lệ" });
    }

    const [rows] = await db.query(
      `SELECT MaQuaTrinh, MaLo, TenGiaiDoan, MoTa, NgayBatDau, NgayKetThuc,
              DiaDiem, HinhAnh, NguoiCapNhat, NgayTao
       FROM qua_trinh_san_xuat
       WHERE MaLo = ?
       ORDER BY NgayBatDau ASC, MaQuaTrinh ASC`,
      [loId]
    );

    return res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy quy trình sản xuất:", error);
    return res.status(500).json({ message: "Không thể lấy quy trình sản xuất" });
  }
};

// POST /api/lich-su-san-xuat
exports.create = async (req, res) => {
  try {
    const maLo = parseId(req.body.MaLo);
    if (!maLo) {
      return res.status(400).json({ message: "Cần nhập mã lô hợp lệ" });
    }

    const err = validateBody(req.body);
    if (err) return res.status(400).json({ message: err });

    const scope = await getScope(req);
    if (!(await canAccessLot(scope, maLo))) {
      return res.status(403).json({ message: "Bạn chỉ được ghi nhật ký cho lô của cơ sở mình." });
    }

    const { TenGiaiDoan, MoTa, NgayBatDau, NgayKetThuc, DiaDiem, HinhAnh } = req.body;

    const [result] = await db.query(
      `INSERT INTO qua_trinh_san_xuat
        (MaLo, TenGiaiDoan, MoTa, NgayBatDau, NgayKetThuc, DiaDiem, HinhAnh, NguoiCapNhat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        maLo,
        String(TenGiaiDoan).trim(),
        MoTa || null,
        NgayBatDau || null,
        NgayKetThuc || null,
        DiaDiem || null,
        HinhAnh || null,
        req.user.id // lấy từ token, không tin dữ liệu client gửi
      ]
    );

    return res.status(201).json({
      message: "Thêm giai đoạn sản xuất thành công",
      MaQuaTrinh: result.insertId
    });
  } catch (error) {
    console.error("Lỗi thêm quy trình sản xuất:", error);
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ message: "Lô sản xuất hoặc người cập nhật không tồn tại" });
    }
    return res.status(500).json({ message: "Không thể thêm giai đoạn sản xuất" });
  }
};

// Tìm lô của một giai đoạn để kiểm tra quyền
async function getLotOfStage(id) {
  const [rows] = await db.query(
    "SELECT MaLo FROM qua_trinh_san_xuat WHERE MaQuaTrinh = ?",
    [id]
  );
  return rows[0]?.MaLo || null;
}

// PUT /api/lich-su-san-xuat/:id
exports.update = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Mã giai đoạn không hợp lệ" });

    const err = validateBody(req.body);
    if (err) return res.status(400).json({ message: err });

    const maLo = await getLotOfStage(id);
    if (!maLo) return res.status(404).json({ message: "Không tìm thấy giai đoạn sản xuất" });

    const scope = await getScope(req);
    if (!(await canAccessLot(scope, maLo))) {
      return res.status(403).json({ message: "Bạn chỉ được sửa nhật ký của cơ sở mình." });
    }

    const { TenGiaiDoan, MoTa, NgayBatDau, NgayKetThuc, DiaDiem, HinhAnh } = req.body;

    await db.query(
      `UPDATE qua_trinh_san_xuat
       SET TenGiaiDoan = ?, MoTa = ?, NgayBatDau = ?, NgayKetThuc = ?,
           DiaDiem = ?, HinhAnh = ?, NguoiCapNhat = ?
       WHERE MaQuaTrinh = ?`,
      [
        String(TenGiaiDoan).trim(),
        MoTa || null,
        NgayBatDau || null,
        NgayKetThuc || null,
        DiaDiem || null,
        HinhAnh || null,
        req.user.id,
        id
      ]
    );

    return res.json({ message: "Cập nhật giai đoạn sản xuất thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật quy trình sản xuất:", error);
    return res.status(500).json({ message: "Không thể cập nhật giai đoạn sản xuất" });
  }
};

// DELETE /api/lich-su-san-xuat/:id
exports.remove = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Mã giai đoạn không hợp lệ" });

    const maLo = await getLotOfStage(id);
    if (!maLo) return res.status(404).json({ message: "Không tìm thấy giai đoạn sản xuất" });

    const scope = await getScope(req);
    if (!(await canAccessLot(scope, maLo))) {
      return res.status(403).json({ message: "Bạn chỉ được xóa nhật ký của cơ sở mình." });
    }

    await db.query("DELETE FROM qua_trinh_san_xuat WHERE MaQuaTrinh = ?", [id]);
    return res.json({ message: "Xóa giai đoạn sản xuất thành công" });
  } catch (error) {
    console.error("Lỗi xóa quy trình sản xuất:", error);
    return res.status(500).json({ message: "Không thể xóa giai đoạn sản xuất" });
  }
};
