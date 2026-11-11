# Hướng dẫn chạy dự án OCOP đã ghép SQL + backend xác thực

## Cấu trúc
- Các trang HTML, `css/`, `js/`, `images/`: frontend ban đầu, giữ lại.
- `sql/ocop_database_hoan_chinh.sql`: cơ sở dữ liệu MySQL.
- `backend/`: API Express, kết nối MySQL, JWT, middleware và hướng dẫn cài đặt.
- `login.html` + `js/auth.js`: giao diện thử đăng nhập.

## Chạy nhanh
1. Sao lưu database cũ nếu có.
2. Chạy `sql/ocop_database_hoan_chinh.sql` trong MySQL Workbench. Script tạo database `ocop` và xóa/re-tạo bảng cùng tên bên trong; đừng chạy nếu cần giữ dữ liệu cũ.
3. Trong VS Code mở Terminal:
   ```bash
   cd backend
   npm install
   ```
4. Copy `backend/.env.example` thành `backend/.env`; điền thông tin MySQL và `JWT_SECRET`.
5. Đặt các biến `ADMIN_*` trong `.env` và chạy `npm run create-admin` để tạo tài khoản admin đầu tiên; sau đó xóa các biến `ADMIN_*` khỏi `.env`.
6. Chạy `npm run dev` trong thư mục `backend`.
7. Mở `http://localhost:3000/` hoặc `http://localhost:3000/login.html`.

Đọc thêm `backend/README.md` trước khi chạy. Phần login/JWT đã được thêm để làm nền; các trang sản phẩm, cơ sở, kiểm định và QR vẫn cần API tương ứng trước khi dữ liệu được lấy từ database.
