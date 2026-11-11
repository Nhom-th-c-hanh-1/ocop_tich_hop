const db = require("../config/db");
const { getScope, canAccessRegion } = require("../utils/ownership");

// 1. Lấy danh sách vùng nguyên liệu (cơ sở chỉ thấy vùng của mình)
exports.getAll = async (req, res) => {
    try {
        const scope = await getScope(req);

        if (scope.restricted && !scope.maCoSo) {
            return res.json([]);
        }

        const [rows] = scope.restricted
            ? await db.query(
                `SELECT * FROM vung_nguyen_lieu
                 WHERE MaCoSo = ?
                 ORDER BY MaVung DESC`,
                [scope.maCoSo]
            )
            : await db.query(
                `SELECT * FROM vung_nguyen_lieu
                 ORDER BY MaVung DESC`
            );

        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách vùng:", error);
        res.status(500).json({ message: "Lỗi lấy vùng nguyên liệu" });
    }
};

// 2. Lấy chi tiết một vùng nguyên liệu
exports.getById = async (req, res) => {
    try {
        const scope = await getScope(req);

        if (!(await canAccessRegion(scope, req.params.id))) {
            return res.status(403).json({
                message: "Bạn chỉ được xem vùng của cơ sở mình."
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM vung_nguyen_lieu WHERE MaVung = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy vùng nguyên liệu"
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi lấy chi tiết vùng:", error);
        res.status(500).json({ message: "Lỗi truy vấn dữ liệu" });
    }
};

// 3. Thêm vùng nguyên liệu
exports.create = async (req, res) => {
    try {
        let {
            MaCoSo,
            TenVung,
            DiaChi,
            DienTich,
            DonViDienTich,
            MoTa,
            TrangThai
        } = req.body;

        const scope = await getScope(req);

        // Cơ sở sản xuất chỉ được thêm vùng cho cơ sở của mình
        if (scope.restricted) {
            if (!scope.maCoSo) {
                return res.status(403).json({
                    message: "Tài khoản chưa liên kết với cơ sở sản xuất."
                });
            }
            MaCoSo = scope.maCoSo;
        }

        if (!MaCoSo || !TenVung || !DiaChi) {
            return res.status(400).json({
                message: "Vui lòng nhập mã cơ sở, tên vùng và địa chỉ"
            });
        }

        const [result] = await db.query(
            `INSERT INTO vung_nguyen_lieu
            (MaCoSo, TenVung, DiaChi, DienTich,
             DonViDienTich, MoTa, TrangThai)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                MaCoSo,
                TenVung,
                DiaChi,
                DienTich || null,
                DonViDienTich || "ha",
                MoTa || null,
                TrangThai || "hoat_dong"
            ]
        );

        res.status(201).json({
            message: "Thêm vùng nguyên liệu thành công",
            MaVung: result.insertId
        });
    } catch (error) {
        console.error("Lỗi thêm vùng:", error);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                message: "Mã cơ sở không tồn tại"
            });
        }

        res.status(500).json({ message: "Lỗi thêm vùng nguyên liệu" });
    }
};

// 4. Cập nhật vùng nguyên liệu
exports.update = async (req, res) => {
    try {
        let {
            MaCoSo,
            TenVung,
            DiaChi,
            DienTich,
            DonViDienTich,
            MoTa,
            TrangThai
        } = req.body;

        const scope = await getScope(req);

        if (!(await canAccessRegion(scope, req.params.id))) {
            return res.status(403).json({
                message: "Bạn chỉ được sửa vùng của cơ sở mình."
            });
        }

        // Không cho cơ sở chuyển vùng sang cơ sở khác
        if (scope.restricted) {
            MaCoSo = scope.maCoSo;
        }

        if (!MaCoSo || !TenVung || !DiaChi) {
            return res.status(400).json({
                message: "Vui lòng nhập mã cơ sở, tên vùng và địa chỉ"
            });
        }

        const [result] = await db.query(
            `UPDATE vung_nguyen_lieu
             SET MaCoSo = ?,
                 TenVung = ?,
                 DiaChi = ?,
                 DienTich = ?,
                 DonViDienTich = ?,
                 MoTa = ?,
                 TrangThai = ?
             WHERE MaVung = ?`,
            [
                MaCoSo,
                TenVung,
                DiaChi,
                DienTich || null,
                DonViDienTich || "ha",
                MoTa || null,
                TrangThai || "hoat_dong",
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Không tìm thấy vùng nguyên liệu"
            });
        }

        res.json({ message: "Cập nhật vùng nguyên liệu thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật vùng:", error);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                message: "Mã cơ sở không tồn tại"
            });
        }

        res.status(500).json({ message: "Lỗi cập nhật vùng nguyên liệu" });
    }
};

// 5. Xóa vùng nguyên liệu
exports.remove = async (req, res) => {
    try {
        const scope = await getScope(req);

        if (!(await canAccessRegion(scope, req.params.id))) {
            return res.status(403).json({
                message: "Bạn chỉ được xóa vùng của cơ sở mình."
            });
        }

        const [result] = await db.query(
            "DELETE FROM vung_nguyen_lieu WHERE MaVung = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Không tìm thấy vùng nguyên liệu"
            });
        }

        res.json({ message: "Xóa vùng nguyên liệu thành công" });
    } catch (error) {
        console.error("Lỗi xóa vùng:", error);

        res.status(500).json({
            message: "Không thể xóa vùng nguyên liệu. Có thể vùng đang được sử dụng bởi các lô sản xuất."
        });
    }
};
