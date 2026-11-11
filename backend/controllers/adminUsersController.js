const bcrypt = require('bcrypt');
const db = require('../config/db');

const normalizeRole = (value) => String(value || '').trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

exports.roles = async (_req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT MaVaiTro AS id, TenVaiTro AS tenVaiTro, MoTa AS moTa FROM vai_tro ORDER BY MaVaiTro');
    return res.json({ roles: rows });
  } catch (error) { next(error); }
};

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const [rows] = await db.execute(
      `SELECT nd.MaNguoiDung AS id, nd.TenDangNhap AS tenDangNhap, nd.HoTen AS hoTen,
              nd.Email AS email, nd.SoDienThoai AS soDienThoai, nd.MaCoSo AS maCoSo,
              nd.TrangThai AS trangThai, nd.NgayTao AS ngayTao, vt.TenVaiTro AS vaiTro
       FROM nguoi_dung nd JOIN vai_tro vt ON vt.MaVaiTro = nd.MaVaiTro
       ORDER BY nd.MaNguoiDung DESC LIMIT ? OFFSET ?`, [limit, offset]);
    const [[countRow]] = await db.execute('SELECT COUNT(*) AS total FROM nguoi_dung');
    return res.json({ users: rows, pagination: { page, limit, total: countRow.total } });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { tenDangNhap, matKhau, hoTen, email, soDienThoai, vaiTro, maCoSo } = req.body || {};
    const username = typeof tenDangNhap === 'string' ? tenDangNhap.trim() : '';
    const fullName = typeof hoTen === 'string' ? hoTen.trim() : '';
    const cleanEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    const phone = typeof soDienThoai === 'string' && soDienThoai.trim() ? soDienThoai.trim() : null;
    const roleName = normalizeRole(vaiTro);

    if (!/^[a-zA-Z0-9_.-]{4,100}$/.test(username)) return res.status(400).json({ message: 'Tên đăng nhập phải có 4–100 ký tự; dùng chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.' });
    if (typeof matKhau !== 'string' || matKhau.length < 8) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
    if (!fullName || fullName.length > 100) return res.status(400).json({ message: 'Vui lòng nhập họ tên (không quá 100 ký tự).' });
    const managedRoles = ['co_so_san_xuat', 'can_bo_kiem_dinh', 'co_quan_quan_ly'];
    if (!managedRoles.includes(roleName)) {
      return res.status(400).json({ message: 'QTV chỉ tạo tài khoản quản lý cho cơ sở sản xuất, nhân viên kiểm định hoặc cơ quan quản lý. Người tiêu dùng tra cứu QR công khai, không cần tài khoản.' });
    }
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ message: 'Email không hợp lệ.' });

    const [roleRows] = await db.execute('SELECT MaVaiTro, TenVaiTro FROM vai_tro WHERE TenVaiTro = ? LIMIT 1', [roleName]);
    if (!roleRows.length) return res.status(400).json({ message: 'Vai trò không tồn tại trong CSDL.' });

    let facilityId = null;
    if (maCoSo !== undefined && maCoSo !== null && maCoSo !== '') {
      facilityId = Number(maCoSo);
      if (!Number.isInteger(facilityId) || facilityId <= 0) return res.status(400).json({ message: 'Mã cơ sở không hợp lệ.' });
      const [facilities] = await db.execute("SELECT MaCoSo FROM co_so_san_xuat WHERE MaCoSo = ? AND TrangThai = 'hoat_dong' LIMIT 1", [facilityId]);
      if (!facilities.length) return res.status(400).json({ message: 'Không tìm thấy cơ sở đang hoạt động với mã này.' });
    }
    if (roleName === 'co_so_san_xuat' && !facilityId) return res.status(400).json({ message: 'Tài khoản cơ sở sản xuất cần được gán một cơ sở.' });

    const [existing] = await db.execute('SELECT MaNguoiDung FROM nguoi_dung WHERE TenDangNhap = ? OR (? IS NOT NULL AND Email = ?) LIMIT 1', [username, cleanEmail, cleanEmail]);
    if (existing.length) return res.status(409).json({ message: 'Tên đăng nhập hoặc email đã được sử dụng.' });

    const hash = await bcrypt.hash(matKhau, 12);
    const [result] = await db.execute(
      `INSERT INTO nguoi_dung (MaVaiTro, MaCoSo, TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, TrangThai)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'hoat_dong')`,
      [roleRows[0].MaVaiTro, facilityId, username, hash, fullName, cleanEmail, phone]);
    return res.status(201).json({ message: 'Đã tạo tài khoản thành công.', user: { id: result.insertId, tenDangNhap: username, hoTen: fullName, email: cleanEmail, maCoSo: facilityId, vaiTro: roleRows[0].TenVaiTro, trangThai: 'hoat_dong' } });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Tên đăng nhập hoặc email đã được sử dụng.' });
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { trangThai } = req.body || {};
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'Mã tài khoản không hợp lệ.' });
    if (id === req.user.id) return res.status(400).json({ message: 'Không thể tự khóa tài khoản đang đăng nhập.' });
    if (!['hoat_dong', 'khoa'].includes(trangThai)) return res.status(400).json({ message: "Trạng thái chỉ được là 'hoat_dong' hoặc 'khoa'." });
    const [result] = await db.execute('UPDATE nguoi_dung SET TrangThai = ? WHERE MaNguoiDung = ?', [trangThai, id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    return res.json({ message: trangThai === 'khoa' ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.' });
  } catch (error) { next(error); }
};
