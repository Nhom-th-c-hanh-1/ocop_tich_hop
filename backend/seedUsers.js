// Chạy một lần: node seedUsers.js  (đặt file này trong thư mục backend)
// Tạo 2 tài khoản thử: admin và một tài khoản cơ sở sản xuất.

try {
    require('dotenv').config();
} catch (error) {
    // Nếu không có dotenv thì bỏ qua, db.js có thể đã tự nạp .env
}

const db = require('./config/db');

let bcrypt;
try {
    bcrypt = require('bcryptjs');
} catch (error) {
    bcrypt = require('bcrypt');
}

const accounts = [
    {
        tenDangNhap: process.env.ADMIN_USERNAME || 'admin',
        matKhau: process.env.ADMIN_PASSWORD || 'admin123456789',
        hoTen: process.env.ADMIN_NAME || 'Quan tri vien OCOP',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        tenVaiTro: 'admin',
        maCoSo: null
    },
    {
        tenDangNhap: 'coso1',
        matKhau: 'coso123456',
        hoTen: 'Nguyen Van A',
        email: 'coso1@example.com',
        tenVaiTro: 'co_so_san_xuat',
        maCoSo: 1
    }
];

async function main() {
    for (const acc of accounts) {
        const [exists] = await db.query(
            'SELECT MaNguoiDung FROM nguoi_dung WHERE TenDangNhap = ?',
            [acc.tenDangNhap]
        );

        if (exists.length > 0) {
            console.log('Đã có tài khoản:', acc.tenDangNhap, '(bỏ qua)');
            continue;
        }

        const [roles] = await db.query(
            'SELECT MaVaiTro FROM vai_tro WHERE TenVaiTro = ?',
            [acc.tenVaiTro]
        );

        if (roles.length === 0) {
            console.log('Không tìm thấy vai trò:', acc.tenVaiTro);
            continue;
        }

        const hash = await bcrypt.hash(acc.matKhau, 10);

        await db.query(
            `INSERT INTO nguoi_dung
             (MaVaiTro, MaCoSo, TenDangNhap, MatKhau, HoTen, Email, TrangThai)
             VALUES (?, ?, ?, ?, ?, ?, 'hoat_dong')`,
            [roles[0].MaVaiTro, acc.maCoSo, acc.tenDangNhap, hash, acc.hoTen, acc.email]
        );

        console.log('Đã tạo tài khoản:', acc.tenDangNhap, '| mật khẩu:', acc.matKhau);
    }

    process.exit(0);
}

main().catch(function (error) {
    console.error('Lỗi:', error.message);
    process.exit(1);
});