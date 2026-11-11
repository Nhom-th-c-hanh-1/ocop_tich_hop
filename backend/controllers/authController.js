const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function safeUser(row) {
  return {
    id: row.MaNguoiDung,
    tenDangNhap: row.TenDangNhap,
    hoTen: row.HoTen,
    email: row.Email || null,
    maCoSo: row.MaCoSo ?? null,
    vaiTro: normalizeRole(row.TenVaiTro)
  };
}

exports.register = async (req, res, next) => {
  try {
    const { tenDangNhap, matKhau, hoTen, email, soDienThoai } = req.body || {};
    const username = typeof tenDangNhap === 'string' ? tenDangNhap.trim() : '';
    const fullName = typeof hoTen === 'string' ? hoTen.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const phone = typeof soDienThoai === 'string' && soDienThoai.trim() ? soDienThoai.trim() : null;

    if (!/^[a-zA-Z0-9_.-]{4,100}$/.test(username)) {
      return res.status(400).json({ message: 'Tên đăng nhập cần từ 4–100 ký tự, chỉ gồm chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.' });
    }
    if (typeof matKhau !== 'string' || matKhau.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
    }
    if (!fullName || fullName.length > 100) {
      return res.status(400).json({ message: 'Vui lòng nhập họ tên (không quá 100 ký tự).' });
    }
    if (!cleanEmail || cleanEmail.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ message: 'Vui lòng nhập địa chỉ email hợp lệ.' });
    }
    if (phone && phone.length > 20) {
      return res.status(400).json({ message: 'Số điện thoại không được vượt quá 20 ký tự.' });
    }

    // Vai trò được gán từ máy chủ; tuyệt đối không nhận vai trò do trình duyệt gửi lên.
    const [roleRows] = await db.execute(
      "SELECT MaVaiTro FROM vai_tro WHERE TenVaiTro = 'nguoi_tieu_dung' LIMIT 1"
    );
    if (!roleRows.length) {
      return res.status(500).json({ message: 'Chưa có vai trò nguoi_tieu_dung trong CSDL. Hãy kiểm tra bảng vai_tro.' });
    }

    const [existing] = await db.execute(
      'SELECT MaNguoiDung FROM nguoi_dung WHERE TenDangNhap = ? OR Email = ? LIMIT 1',
      [username, cleanEmail]
    );
    if (existing.length) {
      return res.status(409).json({ message: 'Tên đăng nhập hoặc email đã được sử dụng.' });
    }

    const hash = await bcrypt.hash(matKhau, 12);
    const [result] = await db.execute(
      `INSERT INTO nguoi_dung (MaVaiTro, MaCoSo, TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, TrangThai)
       VALUES (?, NULL, ?, ?, ?, ?, ?, 'hoat_dong')`,
      [roleRows[0].MaVaiTro, username, hash, fullName, cleanEmail, phone]
    );

    return res.status(201).json({
      message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.',
      user: { id: result.insertId, tenDangNhap: username, hoTen: fullName, email: cleanEmail, vaiTro: 'nguoi_tieu_dung' }
    });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Tên đăng nhập hoặc email đã được sử dụng.' });
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { tenDangNhap, matKhau } = req.body || {};
    if (typeof tenDangNhap !== 'string' || !tenDangNhap.trim() ||
        typeof matKhau !== 'string' || !matKhau) {
      return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const [rows] = await db.execute(
      `SELECT nd.MaNguoiDung, nd.TenDangNhap, nd.MatKhau, nd.HoTen,
              nd.Email, nd.MaCoSo, nd.TrangThai, vt.TenVaiTro
       FROM nguoi_dung nd
       JOIN vai_tro vt ON vt.MaVaiTro = nd.MaVaiTro
       WHERE nd.TenDangNhap = ?
       LIMIT 1`,
      [tenDangNhap.trim()]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    const user = rows[0];
    if (user.TrangThai !== 'hoat_dong') {
      return res.status(403).json({ message: 'Tài khoản đang bị khóa hoặc chưa được kích hoạt.' });
    }

    const validPassword = await bcrypt.compare(matKhau, user.MatKhau);
    if (!validPassword) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(500).json({ message: 'JWT_SECRET chưa được cấu hình an toàn trong file .env.' });
    }

    await db.execute('UPDATE nguoi_dung SET LanDangNhapCuoi = NOW() WHERE MaNguoiDung = ?', [user.MaNguoiDung]);
    const publicUser = safeUser(user);
    const token = jwt.sign(
      { role: publicUser.vaiTro },
      process.env.JWT_SECRET,
      { subject: String(publicUser.id), expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    return res.json({ message: 'Đăng nhập thành công.', token, user: publicUser });
  } catch (error) {
    next(error);
  }
};


exports.me = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT nd.MaNguoiDung, nd.TenDangNhap, nd.HoTen, nd.Email,
              nd.MaCoSo, nd.TrangThai, vt.TenVaiTro
       FROM nguoi_dung nd
       JOIN vai_tro vt ON vt.MaVaiTro = nd.MaVaiTro
       WHERE nd.MaNguoiDung = ? LIMIT 1`,
      [req.user.id]
    );
    if (!rows.length || rows[0].TrangThai !== 'hoat_dong') {
      return res.status(401).json({ message: 'Tài khoản không còn hợp lệ.' });
    }
    return res.json({ user: safeUser(rows[0]) });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { matKhauCu, matKhauMoi } = req.body || {};
    if (typeof matKhauCu !== 'string' || !matKhauCu ||
        typeof matKhauMoi !== 'string' || matKhauMoi.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
    }
    if (matKhauCu === matKhauMoi) {
      return res.status(400).json({ message: 'Mật khẩu mới phải khác mật khẩu cũ.' });
    }
    const [rows] = await db.execute(
      'SELECT MaNguoiDung, MatKhau FROM nguoi_dung WHERE MaNguoiDung = ? LIMIT 1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    if (!(await bcrypt.compare(matKhauCu, rows[0].MatKhau))) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng.' });
    }
    const hash = await bcrypt.hash(matKhauMoi, 12);
    await db.execute('UPDATE nguoi_dung SET MatKhau = ? WHERE MaNguoiDung = ?', [hash, req.user.id]);
    return res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    next(error);
  }
};

exports.logout = (_req, res) => {
  // JWT không lưu phiên ở server; phía trình duyệt cần xóa token.
  return res.json({ message: 'Đăng xuất thành công. Hãy xóa token ở phía trình duyệt.' });
};
