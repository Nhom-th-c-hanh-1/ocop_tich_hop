# Backend OCOP (Node.js + Express + MySQL)

Backend này được ghép thêm vào dự án frontend HTML/CSS/JavaScript hiện có. Frontend gốc được giữ nguyên; đã thêm `login.html` và `js/auth.js` để thử API đăng nhập.

## 1. Cài đặt

Yêu cầu Node.js LTS và MySQL Server/MySQL Workbench.

1. Mở MySQL Workbench.
2. Mở và chạy `../sql/ocop_database_hoan_chinh.sql`.
   **Cảnh báo:** SQL có lệnh DROP các bảng cùng tên trong database `ocop`. Sao lưu dữ liệu trước khi chạy nếu database đã có dữ liệu.
3. Mở Terminal trong VS Code, chuyển vào thư mục `backend`:

```bash
cd backend
npm install
```

4. Sao chép `backend/.env.example` thành `backend/.env` rồi sửa `DB_USER`, `DB_PASSWORD`, `DB_NAME` và `JWT_SECRET`. Dùng chuỗi bí mật dài ngẫu nhiên ít nhất 32 ký tự cho `JWT_SECRET`.
5. Tạm thời điền `ADMIN_USERNAME`, `ADMIN_PASSWORD` (ít nhất 12 ký tự), `ADMIN_NAME`, `ADMIN_EMAIL` trong `.env` để tạo tài khoản quản trị đầu tiên. Chạy:

```bash
npm run create-admin
```

Sau khi tạo thành công, xóa các dòng `ADMIN_*` khỏi `.env`.

6. Chạy server:

```bash
npm run dev
```

Mở `http://localhost:3000/` để xem website, hoặc `http://localhost:3000/login.html` để đăng nhập. API kiểm tra tại `http://localhost:3000/api/health`.

## 2. API xác thực

- `POST /api/auth/login` — body JSON `{ "tenDangNhap": "...", "matKhau": "..." }`
- `GET /api/auth/me` — header `Authorization: Bearer <token>`
- `POST /api/auth/logout` — header `Authorization: Bearer <token>`; JWT stateless nên trình duyệt cần xóa token.
- `PATCH /api/auth/change-password` — header Bearer; body `{ "matKhauCu": "...", "matKhauMoi": "..." }`

`login.html` chỉ là màn hình thử đăng nhập. Các trang sản phẩm/QR hiện có vẫn dùng dữ liệu mẫu phía frontend cho đến khi các API sản phẩm và truy xuất được triển khai.

## 3. Lưu ý bảo mật và tích hợp

- Không chia sẻ file `.env` hoặc đưa file này lên Git.
- Mật khẩu lưu trong DB là bcrypt hash, không lưu mật khẩu dạng chữ thường.
- Logout hiện tại xóa token ở frontend; JWT đã phát hành vẫn có hiệu lực tới khi hết hạn.
- Middleware phân quyền đã được tạo nhưng chưa gắn vào API cơ sở/sản phẩm/kiểm định/QR vì các API đó chưa được triển khai.


## Đăng ký người dùng và quản lý tài khoản

- Người tiêu dùng không cần tài khoản để xem sản phẩm hoặc truy xuất nguồn gốc qua QR. Tài khoản quản lý do Admin tạo và gán vai trò.
- `GET /api/admin/roles`: danh sách vai trò (chỉ admin).
- `GET /api/admin/users?page=1&limit=20`: danh sách tài khoản (chỉ admin).
- `POST /api/admin/users`: admin tạo tài khoản và gán vai trò. JSON ví dụ: `{ "tenDangNhap": "nhanvien01", "matKhau": "MatKhauAnToan123", "hoTen": "Nguyen Van A", "email": "a@example.com", "vaiTro": "can_bo_kiem_dinh" }`. Với vai trò `co_so_san_xuat`, cần thêm `maCoSo` hợp lệ.
- `PATCH /api/admin/users/:id/status`: khóa/mở khóa tài khoản, JSON `{ "trangThai": "khoa" }` hoặc `{ "trangThai": "hoat_dong" }`.

Các API `/api/admin/*` cần header `Authorization: Bearer <token>` của tài khoản admin. Người tự đăng ký chỉ nhận vai trò `nguoi_tieu_dung`.
