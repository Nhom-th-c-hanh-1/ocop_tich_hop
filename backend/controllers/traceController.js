
const db = require("../config/db");

// API truy xuất nguồn gốc theo mã QR hoặc mã số lô
exports.getTrace = async (req, res) => {
    try {
        const code = decodeURIComponent(req.params.code).trim();

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp mã truy xuất"
            });
        }

        // Tìm mã QR đang hoạt động và lô sản xuất tương ứng
        const [rows] = await db.query(
            `
            SELECT
                l.MaLo,
                l.MaSoLo,
                l.NgayThuHoach,
                l.NgaySanXuat,
                l.HanSuDung,
                l.SoLuong,
                l.DonViTinh,
                l.TrangThai AS TrangThaiLo,

                p.MaSanPham,
                p.TenSanPham,
                p.MaSanPhamOCOP,
                p.NhomSanPham,
                p.SoSaoOCOP,
                p.MoTa,
                p.HinhAnh,

                v.MaVung,
                v.TenVung,

                q.NoiDungQR,
                q.NgayTao AS NgayTaoQR

            FROM lo_san_xuat l
            JOIN san_pham_ocop p
                ON l.MaSanPham = p.MaSanPham

            LEFT JOIN vung_nguyen_lieu v
                ON l.MaVung = v.MaVung

            LEFT JOIN ma_qr q
                ON l.MaLo = q.MaLo

            WHERE
                l.MaSoLo = ?
                OR (
                    q.NoiDungQR = ?
                    AND q.TrangThai = 'hoat_dong'
                )

            LIMIT 1
            `,
            [code, code]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thông tin truy xuất nguồn gốc"
            });
        }

        const lo = rows[0];

        // Lấy lịch sử truy xuất nếu có
        const [history] = await db.query(
            `
            SELECT *
            FROM lich_su_truy_xuat
            WHERE MaLo = ?
            ORDER BY ThoiGianTruyXuat DESC
            `,
            [lo.MaLo]
        );

        return res.json({
            success: true,
            message: "Truy xuất nguồn gốc thành công",
            sanPham: {
                MaSanPham: lo.MaSanPham,
                TenSanPham: lo.TenSanPham,
                MaSanPhamOCOP: lo.MaSanPhamOCOP,
                NhomSanPham: lo.NhomSanPham,
                SoSaoOCOP: lo.SoSaoOCOP,
                MoTa: lo.MoTa,
                HinhAnh: lo.HinhAnh
            },
            loSanXuat: {
                MaLo: lo.MaLo,
                MaSoLo: lo.MaSoLo,
                NgayThuHoach: lo.NgayThuHoach,
                NgaySanXuat: lo.NgaySanXuat,
                HanSuDung: lo.HanSuDung,
                SoLuong: lo.SoLuong,
                DonViTinh: lo.DonViTinh,
                TrangThai: lo.TrangThaiLo
            },
            vungNguyenLieu: {
                MaVung: lo.MaVung,
                TenVung: lo.TenVung
            },
            maQR: {
                NoiDungQR: lo.NoiDungQR,
                NgayTaoQR: lo.NgayTaoQR
            },
            lichSuTruyXuat: history
        });

    } catch (error) {
        console.error("Lỗi truy xuất nguồn gốc:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi truy xuất nguồn gốc"
        });
    }
};
