const db = require("../config/db");

// 1. Lấy danh sách vùng nguyên liệu
exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT *
            FROM vung_nguyen_lieu
            ORDER BY MaVung DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách vùng:", error);
        res.status(500).json({
            message: "Lỗi lấy vùng nguyên liệu"
        });
    }
};

// 2. Lấy chi tiết một vùng nguyên liệu
exports.getById = async (req, res) => {
    try {
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
        res.status(500).json({
            message: "Lỗi truy vấn dữ liệu"
        });
    }
};

// 3. Thêm vùng nguyên liệu
exports.create = async (req, res) => {
    try {
        const {
            MaCoSo,
            TenVung,
            DiaChi,
            DienTich,
            DonViDienTich,
            MoTa,
            TrangThai
        } = req.body;

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

        res.status(500).json({
            message: "Lỗi thêm vùng nguyên liệu"
        });
    }
};

// 4. Cập nhật vùng nguyên liệu
exports.update = async (req, res) => {
    try {
        const {
            MaCoSo,
            TenVung,
            DiaChi,
            DienTich,
            DonViDienTich,
            MoTa,
            TrangThai
        } = req.body;

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

        res.json({
            message: "Cập nhật vùng nguyên liệu thành công"
        });

    } catch (error) {
        console.error("Lỗi cập nhật vùng:", error);
        res.status(500).json({
            message: "Lỗi cập nhật vùng nguyên liệu"
        });
    }
};

// 5. Xóa vùng nguyên liệu
exports.remove = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM vung_nguyen_lieu WHERE MaVung = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Không tìm thấy vùng nguyên liệu"
            });
        }

        res.json({
            message: "Xóa vùng nguyên liệu thành công"
        });

    } catch (error) {
        console.error("Lỗi xóa vùng:", error);

        res.status(500).json({
            message: "Không thể xóa vùng nguyên liệu. Có thể vùng đang được sử dụng bởi các lô sản xuất."
        });
    }
};