const db = require("../config/db");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const {
    getScope,
    canAccessLot,
    canAccessProduct,
    canAccessRegion
} = require("../utils/ownership");

// 1. Lấy danh sách lô sản xuất (cơ sở chỉ thấy lô của mình)
exports.getAll = async (req, res) => {
    try {
        const scope = await getScope(req);

        if (scope.restricted && !scope.maCoSo) {
            return res.json([]);
        }

        const [rows] = await db.query(
            `SELECT l.*,
                    p.TenSanPham,
                    v.TenVung
             FROM lo_san_xuat l
             LEFT JOIN san_pham_ocop p ON l.MaSanPham = p.MaSanPham
             LEFT JOIN vung_nguyen_lieu v ON l.MaVung = v.MaVung
             ${scope.restricted ? "WHERE p.MaCoSo = ?" : ""}
             ORDER BY l.MaLo DESC`,
            scope.restricted ? [scope.maCoSo] : []
        );

        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách lô sản xuất:", error);
        res.status(500).json({
            message: "Không thể lấy danh sách lô sản xuất"
        });
    }
};

// 2. Lấy chi tiết lô sản xuất
exports.getById = async (req, res) => {
    try {
        const scope = await getScope(req);

        if (!(await canAccessLot(scope, req.params.id))) {
            return res.status(403).json({
                message: "Bạn chỉ được xem lô của cơ sở mình."
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM lo_san_xuat WHERE MaLo = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy lô sản xuất"
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi lấy chi tiết lô sản xuất:", error);
        res.status(500).json({
            message: "Không thể lấy chi tiết lô sản xuất"
        });
    }
};

// 3. Thêm lô sản xuất
exports.create = async (req, res) => {
    try {
        const {
            MaSanPham,
            MaVung,
            MaSoLo,
            NgayThuHoach,
            NgaySanXuat,
            HanSuDung,
            SoLuong,
            DonViTinh,
            TrangThai
        } = req.body;

        if (!MaSanPham || !MaVung || !MaSoLo || !NgaySanXuat) {
            return res.status(400).json({
                message: "Vui lòng nhập sản phẩm, vùng nguyên liệu, mã số lô và ngày sản xuất"
            });
        }

        if (SoLuong != null && Number(SoLuong) <= 0) {
            return res.status(400).json({
                message: "Số lượng phải lớn hơn 0"
            });
        }

        const scope = await getScope(req);

        if (
            !(await canAccessProduct(scope, MaSanPham)) ||
            !(await canAccessRegion(scope, MaVung))
        ) {
            return res.status(403).json({
                message: "Sản phẩm hoặc vùng nguyên liệu không thuộc cơ sở của bạn."
            });
        }

        const [result] = await db.query(
            `INSERT INTO lo_san_xuat
             (MaSanPham, MaVung, MaSoLo, NgayThuHoach,
              NgaySanXuat, HanSuDung, SoLuong, DonViTinh, TrangThai)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                MaSanPham,
                MaVung,
                MaSoLo,
                NgayThuHoach || null,
                NgaySanXuat,
                HanSuDung || null,
                SoLuong ?? null,
                DonViTinh || null,
                TrangThai || "dang_san_xuat"
            ]
        );

        res.status(201).json({
            message: "Tạo lô sản xuất thành công",
            MaLo: result.insertId
        });
    } catch (error) {
        console.error("Lỗi tạo lô sản xuất:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Mã số lô đã tồn tại"
            });
        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                message: "Sản phẩm hoặc vùng nguyên liệu không tồn tại"
            });
        }

        res.status(500).json({ message: "Không thể tạo lô sản xuất" });
    }
};

// 4. Cập nhật lô sản xuất
exports.update = async (req, res) => {
    try {
        const {
            MaSanPham,
            MaVung,
            MaSoLo,
            NgayThuHoach,
            NgaySanXuat,
            HanSuDung,
            SoLuong,
            DonViTinh,
            TrangThai
        } = req.body;

        if (!MaSanPham || !MaVung || !MaSoLo || !NgaySanXuat) {
            return res.status(400).json({
                message: "Vui lòng nhập sản phẩm, vùng nguyên liệu, mã số lô và ngày sản xuất"
            });
        }

        if (SoLuong != null && Number(SoLuong) <= 0) {
            return res.status(400).json({
                message: "Số lượng phải lớn hơn 0"
            });
        }

        const scope = await getScope(req);

        if (!(await canAccessLot(scope, req.params.id))) {
            return res.status(403).json({
                message: "Bạn chỉ được sửa lô của cơ sở mình."
            });
        }

        if (
            !(await canAccessProduct(scope, MaSanPham)) ||
            !(await canAccessRegion(scope, MaVung))
        ) {
            return res.status(403).json({
                message: "Sản phẩm hoặc vùng nguyên liệu không thuộc cơ sở của bạn."
            });
        }

        const [result] = await db.query(
            `UPDATE lo_san_xuat
             SET MaSanPham = ?,
                 MaVung = ?,
                 MaSoLo = ?,
                 NgayThuHoach = ?,
                 NgaySanXuat = ?,
                 HanSuDung = ?,
                 SoLuong = ?,
                 DonViTinh = ?,
                 TrangThai = ?
             WHERE MaLo = ?`,
            [
                MaSanPham,
                MaVung,
                MaSoLo,
                NgayThuHoach || null,
                NgaySanXuat,
                HanSuDung || null,
                SoLuong ?? null,
                DonViTinh || null,
                TrangThai || "dang_san_xuat",
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Không tìm thấy lô sản xuất"
            });
        }

        res.json({ message: "Cập nhật lô sản xuất thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật lô sản xuất:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Mã số lô đã tồn tại"
            });
        }

        res.status(500).json({ message: "Không thể cập nhật lô sản xuất" });
    }
};

// 5. Xóa lô sản xuất
exports.remove = async (req, res) => {
    try {
        const scope = await getScope(req);

        if (!(await canAccessLot(scope, req.params.id))) {
            return res.status(403).json({
                message: "Bạn chỉ được xóa lô của cơ sở mình."
            });
        }

        const [result] = await db.query(
            "DELETE FROM lo_san_xuat WHERE MaLo = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Không tìm thấy lô sản xuất"
            });
        }

        res.json({ message: "Xóa lô sản xuất thành công" });
    } catch (error) {
        console.error("Lỗi xóa lô sản xuất:", error);
        res.status(500).json({
            message: "Không thể xóa lô sản xuất. Lô có thể đang có mã QR, kiểm định hoặc nhật ký sản xuất."
        });
    }
};

// 6. Tạo mã QR cho lô sản xuất
exports.generateQR = async (req, res) => {
    try {
        const maLo = Number(req.params.id);

        if (!Number.isInteger(maLo) || maLo <= 0) {
            return res.status(400).json({
                success: false,
                message: "Mã lô sản xuất không hợp lệ"
            });
        }

        const scope = await getScope(req);

        if (!(await canAccessLot(scope, maLo))) {
            return res.status(403).json({
                success: false,
                message: "Bạn chỉ được thao tác lô của cơ sở mình."
            });
        }

        const [lots] = await db.query(
            `SELECT MaLo, MaSoLo
             FROM lo_san_xuat
             WHERE MaLo = ?`,
            [maLo]
        );

        if (lots.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy lô sản xuất"
            });
        }

        const lo = lots[0];
        const noiDungQR = `OCOP_TRACE:${lo.MaSoLo}`;

        const qrDir = path.join(__dirname, "../../frontend/uploads/qr");
        await fs.promises.mkdir(qrDir, { recursive: true });

        const tenFile = `qr-${String(lo.MaSoLo).replace(/[^a-zA-Z0-9_-]/g, "_")}.png`;
        const duongDanFile = path.join(qrDir, tenFile);
        const duongDanQR = `uploads/qr/${tenFile}`;

        const [existing] = await db.query(
            "SELECT * FROM ma_qr WHERE MaLo = ?",
            [maLo]
        );

        // Chưa có ảnh hoặc file ảnh bị mất thì tạo lại
        if (existing.length === 0 || !fs.existsSync(duongDanFile)) {
            await QRCode.toFile(duongDanFile, noiDungQR, {
                type: "png",
                width: 400,
                margin: 2,
                errorCorrectionLevel: "H"
            });
        }

        // QR đã tồn tại thì trả về QR cũ
        if (existing.length > 0) {
            return res.json({
                success: true,
                message: "Lô sản xuất đã có mã QR",
                MaQR: existing[0].MaQR,
                MaLo: maLo,
                NoiDungQR: existing[0].NoiDungQR,
                HinhAnhQR: existing[0].HinhAnhQR || duongDanQR,
                TrangThai: existing[0].TrangThai
            });
        }

        const [result] = await db.query(
            `INSERT INTO ma_qr
             (MaLo, NoiDungQR, HinhAnhQR, TrangThai)
             VALUES (?, ?, ?, ?)`,
            [maLo, noiDungQR, duongDanQR, "hoat_dong"]
        );

        return res.status(201).json({
            success: true,
            message: "Tạo mã QR thành công",
            MaQR: result.insertId,
            MaLo: maLo,
            MaSoLo: lo.MaSoLo,
            NoiDungQR: noiDungQR,
            HinhAnhQR: duongDanQR,
            TrangThai: "hoat_dong"
        });
    } catch (error) {
        console.error("Lỗi tạo mã QR:", error);

        return res.status(500).json({
            success: false,
            message: "Không thể tạo mã QR"
        });
    }
};
