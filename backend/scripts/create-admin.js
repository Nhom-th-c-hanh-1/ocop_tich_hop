require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/db');

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME || 'Quan tri vien OCOP';
  const email = process.env.ADMIN_EMAIL || null;
  if (!username || !password || password.length < 12) {
    throw new Error('Hãy đặt ADMIN_USERNAME và ADMIN_PASSWORD (ít nhất 12 ký tự) trong .env trước khi chạy.');
  }
  const [roles] = await db.execute("SELECT MaVaiTro FROM vai_tro WHERE TenVaiTro = 'admin' LIMIT 1");
  if (!roles.length) throw new Error('Không tìm thấy vai trò admin. Hãy import SQL trước.');
  const [existing] = await db.execute('SELECT MaNguoiDung FROM nguoi_dung WHERE TenDangNhap = ? LIMIT 1', [username]);
  if (existing.length) {
    const hash = await bcrypt.hash(password, 12);

    await db.execute(
        'UPDATE nguoi_dung SET MatKhau = ? WHERE MaNguoiDung = ?',
        [hash, existing[0].MaNguoiDung]
    );

    console.log('Đã cập nhật mật khẩu admin:', username);
    return;
}
  const hash = await bcrypt.hash(password, 12);
  await db.execute(
    `INSERT INTO nguoi_dung (MaVaiTro, TenDangNhap, MatKhau, HoTen, Email, TrangThai)
     VALUES (?, ?, ?, ?, ?, 'hoat_dong')`,
    [roles[0].MaVaiTro, username, hash, fullName, email]
  );
  console.log(`Đã tạo tài khoản admin: ${username}`);
  console.log('Hãy xóa các dòng ADMIN_* khỏi .env sau khi tạo tài khoản.');
}

main().catch(error => {
  console.error('Không tạo được tài khoản admin:', error.message);
  process.exitCode = 1;
}).finally(async () => {
  await db.end();
});
