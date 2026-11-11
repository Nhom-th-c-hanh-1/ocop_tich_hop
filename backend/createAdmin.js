
require('dotenv').config();

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ocop_database_hoan_chinh'
  });

  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123456789';
    const fullName = process.env.ADMIN_NAME || 'Quan tri vien OCOP';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';

    const [roles] = await db.execute(
      'SELECT MaVaiTro FROM vai_tro WHERE TenVaiTro = ? LIMIT 1',
      ['admin']
    );

    if (roles.length === 0) {
      throw new Error('Không tìm thấy vai trò admin trong bảng vai_tro.');
    }

    const [existing] = await db.execute(
      'SELECT MaNguoiDung FROM nguoi_dung WHERE TenDangNhap = ? LIMIT 1',
      [username]
    );

    if (existing.length > 0) {
      console.log('Tài khoản đã tồn tại:', username);
      return;
    }

    const hash = await bcrypt.hash(password, 12);

    await db.execute(
      `INSERT INTO nguoi_dung
      (MaVaiTro, MaCoSo, TenDangNhap, MatKhau, HoTen, Email, TrangThai)
      VALUES (?, NULL, ?, ?, ?, ?, 'hoat_dong')`,
      [roles[0].MaVaiTro, username, hash, fullName, email]
    );

    console.log('Tạo tài khoản admin thành công!');
    console.log('Tên đăng nhập:', username);
    console.log('Mật khẩu lấy từ ADMIN_PASSWORD trong file .env.');
  } finally {
    await db.end();
  }
}

createAdmin().catch(error => {
  console.error('Không tạo được tài khoản:', error.message);
  process.exitCode = 1;
});

