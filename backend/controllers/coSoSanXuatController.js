const db = require('../config/db');

// Lấy danh sách
exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM co_so_san_xuat ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy chi tiết
exports.getById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM co_so_san_xuat WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy cơ sở" });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Thêm mới
exports.create = async (req, res) => {
    try {
        const { ten_co_so, dia_chi, so_dien_thoai, giay_chung_nhan } = req.body;
        const owner_id = req.user ? (req.user.id || req.user.userId) : null; 

        const sql = `INSERT INTO co_so_san_xuat (ten_co_so, dia_chi, so_dien_thoai, giay_chung_nhan, owner_id) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [ten_co_so, dia_chi, so_dien_thoai, giay_chung_nhan, owner_id]);

        res.status(201).json({ success: true, message: "Thêm thành công", id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật
exports.update = async (req, res) => {
    try {
        const { ten_co_so, dia_chi, so_dien_thoai, giay_chung_nhan } = req.body;
        const sql = `UPDATE co_so_san_xuat SET ten_co_so = ?, dia_chi = ?, so_dien_thoai = ?, giay_chung_nhan = ? WHERE id = ?`;
        await db.query(sql, [ten_co_so, dia_chi, so_dien_thoai, giay_chung_nhan, req.params.id]);
        res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa
exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM co_so_san_xuat WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: "Xóa thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};