
const db = require('../config/db');

// Kiểm tra ID hợp lệ
function validId(id) {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
}

// Chuẩn hóa vai trò
function normalizeRole(role) {
    return String(role || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// Lấy thông tin tài khoản và cơ sở sản xuất
async function getUserInfo(userId) {
    const sql = `
        SELECT MaNguoiDung, MaCoSo
        FROM nguoi_dung
        WHERE MaNguoiDung = ?
    `;

    const [rows] = await db.query(sql, [userId]);

    return rows.length > 0 ? rows[0] : null;
}

// Kiểm tra dữ liệu số sao OCOP
function validStars(value) {
    return value === undefined ||
        value === null ||
        value === '' ||
        (
            Number.isInteger(Number(value)) &&
            Number(value) >= 1 &&
            Number(value) <= 5
        );
}

// 1. Lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                sp.*,
                cs.TenCoSo,
                cs.DiaChi AS DiaPhuong
             FROM san_pham_ocop sp
             LEFT JOIN co_so_san_xuat cs
                ON sp.MaCoSo = cs.MaCoSo
             ORDER BY sp.MaSanPham DESC`
        );

        return res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách sản phẩm:', error);

        return res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách sản phẩm.'
        });
    }
};

// 2. Lấy chi tiết sản phẩm kèm thông tin truy xuất nguồn gốc
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Mã sản phẩm không hợp lệ.'
            });
        }

        // Bước 1: Lấy thông tin sản phẩm và cơ sở sản xuất
        const [products] = await db.query(
            `SELECT 
                sp.*,
                cs.TenCoSo,
                cs.DiaChi AS DiaPhuong
             FROM san_pham_ocop sp
             LEFT JOIN co_so_san_xuat cs
                ON sp.MaCoSo = cs.MaCoSo
             WHERE sp.MaSanPham = ?`,
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm.'
            });
        }

        const product = products[0];

        // Bước 2: Lấy lô sản xuất và vùng nguyên liệu
        const [lots] = await db.query(
            `SELECT
                l.MaLo,
                l.MaSoLo,
                l.NgayThuHoach,
                l.NgaySanXuat,
                l.HanSuDung,
                v.TenVung,
                v.DiaChi AS DiaChiVung
             FROM lo_san_xuat l
             LEFT JOIN vung_nguyen_lieu v
                ON l.MaVung = v.MaVung
             WHERE l.MaSanPham = ?
             ORDER BY l.NgaySanXuat DESC, l.MaLo DESC
             LIMIT 1`,
            [id]
        );

        const lot = lots.length > 0 ? lots[0] : null;

        // Bước 3: Lấy quy trình sản xuất của lô
        let processes = [];

        if (lot) {
            const [processRows] = await db.query(
                `SELECT
                    TenGiaiDoan,
                    MoTa,
                    NgayBatDau,
                    NgayKetThuc,
                    DiaDiem,
                    HinhAnh
                 FROM qua_trinh_san_xuat
                 WHERE MaLo = ?
                 ORDER BY MaQuaTrinh ASC`,
                [lot.MaLo]
            );

            processes = processRows;
        }

        // Bước 4: Lấy chứng nhận của sản phẩm
        const [certificates] = await db.query(
            `SELECT
                SoChungNhan,
                TenChungNhan,
                DonViCap,
                NgayCap,
                NgayHetHan,
                TrangThai,
                GhiChu,
                TepChungNhan
             FROM chung_nhan
             WHERE MaSanPham = ?
             ORDER BY MaChungNhan DESC`,
            [id]
        );

        // Bước 5: Trả dữ liệu cho Frontend
        return res.json({
            success: true,
            data: {
                ...product,
                LoSanXuat: lot,
                QuaTrinh: processes,
                ChungNhan: certificates
            }
        });

    } catch (error) {
        console.error('Lỗi lấy chi tiết sản phẩm:', error);

        return res.status(500).json({
            success: false,
            message: 'Không thể lấy chi tiết sản phẩm.',
            error: error.message
        });
    }
};


// 3. Thêm sản phẩm
exports.createProduct = async (req, res) => {
    try {
        const {
            TenSanPham,
            MaSanPhamOCOP,
            NhomSanPham,
            SoSaoOCOP,
            MoTa,
            ThanhPhan,
            HuongDanSuDung,
            BaoQuan,
            HinhAnh,
            MaCoSo
        } = req.body;

        if (
            typeof TenSanPham !== 'string' ||
            !TenSanPham.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Tên sản phẩm không được để trống.'
            });
        }

        const role = normalizeRole(req.user?.role);
        let maCoSo = MaCoSo;

        // Cơ sở sản xuất chỉ được thêm sản phẩm cho cơ sở của mình
        if (role === 'co_so_san_xuat') {
            const user = await getUserInfo(req.user.id);

            if (!user || !user.MaCoSo) {
                return res.status(403).json({
                    success: false,
                    message: 'Tài khoản chưa được liên kết với cơ sở sản xuất.'
                });
            }

            // Không lấy MaCoSo do người dùng tự gửi lên
            maCoSo = user.MaCoSo;
        }

        if (!maCoSo) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mã cơ sở sản xuất.'
            });
        }

        if (!validStars(SoSaoOCOP)) {
            return res.status(400).json({
                success: false,
                message: 'Số sao OCOP phải từ 1 đến 5 hoặc để trống.'
            });
        }

        const sql = `
            INSERT INTO san_pham_ocop (
                MaCoSo,
                TenSanPham,
                MaSanPhamOCOP,
                NhomSanPham,
                SoSaoOCOP,
                MoTa,
                ThanhPhan,
                HuongDanSuDung,
                BaoQuan,
                HinhAnh,
                TrangThai
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            maCoSo,
            TenSanPham.trim(),
            MaSanPhamOCOP || null,
            NhomSanPham || null,
            SoSaoOCOP === '' || SoSaoOCOP == null
                ? null
                : Number(SoSaoOCOP),
            MoTa || null,
            ThanhPhan || null,
            HuongDanSuDung || null,
            BaoQuan || null,
            HinhAnh || null,
            'cho_duyet'
        ];

        const [result] = await db.query(sql, values);

        return res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm thành công.',
            MaSanPham: result.insertId
        });
    } catch (error) {
        console.error('Lỗi thêm sản phẩm:', error);

        return res.status(
            error.code === 'ER_DUP_ENTRY' ? 409 : 500
        ).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'Mã sản phẩm OCOP đã tồn tại.'
                : 'Không thể thêm sản phẩm.'
        });
    }
};

// 4. Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Mã sản phẩm không hợp lệ.'
            });
        }

        const role = normalizeRole(req.user?.role);

        const [rows] = await db.query(
            `SELECT MaSanPham, MaCoSo
             FROM san_pham_ocop
             WHERE MaSanPham = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm.'
            });
        }

        // Kiểm tra quyền sở hữu của cơ sở sản xuất
        if (role === 'co_so_san_xuat') {
            const user = await getUserInfo(req.user.id);

            if (
                !user ||
                !user.MaCoSo ||
                Number(rows[0].MaCoSo) !== Number(user.MaCoSo)
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn chỉ được sửa sản phẩm thuộc cơ sở của mình.'
                });
            }
        }

        const {
            TenSanPham,
            MaSanPhamOCOP,
            NhomSanPham,
            SoSaoOCOP,
            MoTa,
            ThanhPhan,
            HuongDanSuDung,
            BaoQuan,
            HinhAnh,
            TrangThai
        } = req.body;

        if (
            TenSanPham !== undefined &&
            (
                typeof TenSanPham !== 'string' ||
                !TenSanPham.trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'Tên sản phẩm không được để trống.'
            });
        }

        if (!validStars(SoSaoOCOP)) {
            return res.status(400).json({
                success: false,
                message: 'Số sao OCOP phải từ 1 đến 5 hoặc để trống.'
            });
        }

        const fields = {
            TenSanPham,
            MaSanPhamOCOP,
            NhomSanPham,
            SoSaoOCOP,
            MoTa,
            ThanhPhan,
            HuongDanSuDung,
            BaoQuan,
            HinhAnh
        };

        const updates = [];
        const values = [];

        for (const [column, value] of Object.entries(fields)) {
            if (value === undefined) continue;

            let newValue = value;

            if (column === 'TenSanPham') {
                newValue = value.trim();
            } else if (column === 'SoSaoOCOP') {
                newValue = value === '' || value === null
                    ? null
                    : Number(value);
            } else if (value === '') {
                newValue = null;
            }

            updates.push(`${column} = ?`);
            values.push(newValue);
        }

        // Chỉ quản trị viên được thay đổi trạng thái duyệt
        const trangThaiHopLe = [
            'cho_duyet',
            'da_duyet',
            'tu_choi',
            'ngung_kinh_doanh'
        ];

        if (TrangThai !== undefined && role === 'admin') {
            if (!trangThaiHopLe.includes(TrangThai)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái sản phẩm không hợp lệ.'
                });
            }

            updates.push('TrangThai = ?');
            values.push(TrangThai);
        }

        // Không cho cơ sở sản xuất tự thay đổi trạng thái duyệt
        if (
            TrangThai !== undefined &&
            role !== 'admin' &&
            role !== 'co_so_san_xuat'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thay đổi trạng thái sản phẩm.'
            });
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Bạn chưa gửi trường nào cần cập nhật.'
            });
        }

        values.push(id);

        await db.query(
            `UPDATE san_pham_ocop
             SET ${updates.join(', ')}
             WHERE MaSanPham = ?`,
            values
        );

        return res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công.'
        });
    } catch (error) {
        console.error('Lỗi cập nhật sản phẩm:', error);

        return res.status(
            error.code === 'ER_DUP_ENTRY' ? 409 : 500
        ).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'Mã sản phẩm OCOP đã tồn tại.'
                : 'Không thể cập nhật sản phẩm.'
        });
    }
};

// 5. Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Mã sản phẩm không hợp lệ.'
            });
        }

        const role = normalizeRole(req.user?.role);

        const [rows] = await db.query(
            `SELECT MaSanPham, MaCoSo
             FROM san_pham_ocop
             WHERE MaSanPham = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm.'
            });
        }

        // Cơ sở sản xuất chỉ được xóa sản phẩm của mình
        if (role === 'co_so_san_xuat') {
            const user = await getUserInfo(req.user.id);

            if (
                !user ||
                !user.MaCoSo ||
                Number(rows[0].MaCoSo) !== Number(user.MaCoSo)
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn chỉ được xóa sản phẩm thuộc cơ sở của mình.'
                });
            }
        }

        const [result] = await db.query(
            'DELETE FROM san_pham_ocop WHERE MaSanPham = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm.'
            });
        }

        return res.json({
            success: true,
            message: 'Xóa sản phẩm thành công.'
        });
    } catch (error) {
        console.error('Lỗi xóa sản phẩm:', error);

        return res.status(500).json({
            success: false,
            message: 'Không thể xóa sản phẩm.'
        });
    }
};
