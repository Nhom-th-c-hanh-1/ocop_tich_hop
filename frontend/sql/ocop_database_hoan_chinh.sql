-- ============================================================
-- DATABASE WEBSITE OCOP - BAN DA SUA
-- MySQL 8.0+
-- Ten database: ocop_database_hoan_chinh
-- Da sua: ten database, loi cu phap o bang lo_san_xuat,
--         them du lieu co dau va du 6 san pham
-- ============================================================

CREATE DATABASE IF NOT EXISTS ocop_database_hoan_chinh
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ocop_database_hoan_chinh;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS lich_su_truy_xuat;
DROP TABLE IF EXISTS ma_qr;
DROP TABLE IF EXISTS chung_nhan;
DROP TABLE IF EXISTS kiem_dinh;
DROP TABLE IF EXISTS qua_trinh_san_xuat;
DROP TABLE IF EXISTS lo_san_xuat;
DROP TABLE IF EXISTS san_pham_ocop;
DROP TABLE IF EXISTS vung_nguyen_lieu;
DROP TABLE IF EXISTS nguoi_dung;
DROP TABLE IF EXISTS co_so_san_xuat;
DROP TABLE IF EXISTS vai_tro;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE vai_tro (
    MaVaiTro INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenVaiTro VARCHAR(50) NOT NULL UNIQUE,
    MoTa VARCHAR(255) NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE co_so_san_xuat (
    MaCoSo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    TenCoSo VARCHAR(200) NOT NULL,
    TenChuCoSo VARCHAR(100) NOT NULL,
    DiaChi VARCHAR(255) NOT NULL,
    SoDienThoai VARCHAR(20) NULL,
    Email VARCHAR(100) NULL,
    MoTa TEXT NULL,
    TrangThai ENUM('hoat_dong', 'tam_ngung', 'ngung_hoat_dong')
        NOT NULL DEFAULT 'hoat_dong',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_co_so_email (Email),
    KEY idx_co_so_ten (TenCoSo),
    KEY idx_co_so_trang_thai (TrangThai)
) ENGINE=InnoDB;

CREATE TABLE nguoi_dung (
    MaNguoiDung INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaVaiTro INT UNSIGNED NOT NULL,
    MaCoSo INT UNSIGNED NULL,
    TenDangNhap VARCHAR(100) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    HoTen VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NULL UNIQUE,
    SoDienThoai VARCHAR(20) NULL,
    TrangThai ENUM('hoat_dong', 'khoa') NOT NULL DEFAULT 'hoat_dong',
    LanDangNhapCuoi DATETIME NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_nguoi_dung_vai_tro (MaVaiTro),
    KEY idx_nguoi_dung_co_so (MaCoSo),
    CONSTRAINT fk_nguoi_dung_vai_tro
        FOREIGN KEY (MaVaiTro) REFERENCES vai_tro(MaVaiTro)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_nguoi_dung_co_so
        FOREIGN KEY (MaCoSo) REFERENCES co_so_san_xuat(MaCoSo)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE vung_nguyen_lieu (
    MaVung INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaCoSo INT UNSIGNED NOT NULL,
    TenVung VARCHAR(200) NOT NULL,
    DiaChi VARCHAR(255) NOT NULL,
    DienTich DECIMAL(10,2) NULL,
    DonViDienTich VARCHAR(20) NOT NULL DEFAULT 'ha',
    MoTa TEXT NULL,
    TrangThai ENUM('hoat_dong', 'tam_ngung') NOT NULL DEFAULT 'hoat_dong',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_vung_co_so (MaCoSo),
    CONSTRAINT fk_vung_co_so
        FOREIGN KEY (MaCoSo) REFERENCES co_so_san_xuat(MaCoSo)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE san_pham_ocop (
    MaSanPham INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaCoSo INT UNSIGNED NOT NULL,
    TenSanPham VARCHAR(200) NOT NULL,
    MaSanPhamOCOP VARCHAR(50) NULL UNIQUE,
    NhomSanPham VARCHAR(100) NULL,
    SoSaoOCOP TINYINT UNSIGNED NULL,
    MoTa TEXT NULL,
    ThanhPhan TEXT NULL,
    HuongDanSuDung TEXT NULL,
    BaoQuan TEXT NULL,
    HinhAnh VARCHAR(255) NULL,
    TrangThai ENUM('cho_duyet', 'da_duyet', 'tu_choi', 'ngung_kinh_doanh')
        NOT NULL DEFAULT 'cho_duyet',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_san_pham_co_so (MaCoSo),
    KEY idx_san_pham_ten (TenSanPham),
    KEY idx_san_pham_trang_thai (TrangThai),
    CONSTRAINT chk_san_pham_so_sao CHECK (SoSaoOCOP IS NULL OR SoSaoOCOP BETWEEN 1 AND 5),
    CONSTRAINT fk_san_pham_co_so
        FOREIGN KEY (MaCoSo) REFERENCES co_so_san_xuat(MaCoSo)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE lo_san_xuat (
    MaLo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaSanPham INT UNSIGNED NOT NULL,
    MaVung INT UNSIGNED NOT NULL,
    MaSoLo VARCHAR(50) NOT NULL UNIQUE,
    NgayThuHoach DATE NULL,
    NgaySanXuat DATE NOT NULL,
    HanSuDung DATE NULL,
    SoLuong DECIMAL(12,2) NULL,
    DonViTinh VARCHAR(20) NULL,
    TrangThai ENUM('dang_san_xuat', 'hoan_thanh', 'tam_dung', 'thu_hoi')
        NOT NULL DEFAULT 'dang_san_xuat',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_lo_san_pham (MaSanPham),
    KEY idx_lo_vung (MaVung),
    KEY idx_lo_ngay_san_xuat (NgaySanXuat),
    CONSTRAINT chk_lo_so_luong CHECK (SoLuong IS NULL OR SoLuong >= 0),
    CONSTRAINT fk_lo_san_pham
        FOREIGN KEY (MaSanPham) REFERENCES san_pham_ocop(MaSanPham)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_lo_vung
        FOREIGN KEY (MaVung) REFERENCES vung_nguyen_lieu(MaVung)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE qua_trinh_san_xuat (
    MaQuaTrinh INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaLo INT UNSIGNED NOT NULL,
    TenGiaiDoan VARCHAR(100) NOT NULL,
    MoTa TEXT NULL,
    NgayBatDau DATE NULL,
    NgayKetThuc DATE NULL,
    DiaDiem VARCHAR(255) NULL,
    HinhAnh VARCHAR(255) NULL,
    NguoiCapNhat INT UNSIGNED NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_qua_trinh_lo (MaLo),
    KEY idx_qua_trinh_nguoi_cap_nhat (NguoiCapNhat),
    CONSTRAINT chk_qua_trinh_ngay CHECK (
        NgayBatDau IS NULL OR NgayKetThuc IS NULL OR NgayKetThuc >= NgayBatDau
    ),
    CONSTRAINT fk_qua_trinh_lo
        FOREIGN KEY (MaLo) REFERENCES lo_san_xuat(MaLo)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_qua_trinh_nguoi_dung
        FOREIGN KEY (NguoiCapNhat) REFERENCES nguoi_dung(MaNguoiDung)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE kiem_dinh (
    MaKiemDinh INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaLo INT UNSIGNED NOT NULL,
    DonViKiemDinh VARCHAR(200) NOT NULL,
    NguoiKiemDinh INT UNSIGNED NULL,
    NgayGuiMau DATE NULL,
    NgayKiemDinh DATE NULL,
    KetQua ENUM('cho_kiem_dinh', 'dat', 'khong_dat') NOT NULL DEFAULT 'cho_kiem_dinh',
    ChiTieuKiemDinh TEXT NULL,
    NoiDungKetQua TEXT NULL,
    TepKetQua VARCHAR(255) NULL,
    GhiChu TEXT NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_kiem_dinh_lo (MaLo),
    KEY idx_kiem_dinh_nguoi (NguoiKiemDinh),
    KEY idx_kiem_dinh_ket_qua (KetQua),
    CONSTRAINT fk_kiem_dinh_lo
        FOREIGN KEY (MaLo) REFERENCES lo_san_xuat(MaLo)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_kiem_dinh_nguoi_dung
        FOREIGN KEY (NguoiKiemDinh) REFERENCES nguoi_dung(MaNguoiDung)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE chung_nhan (
    MaChungNhan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaSanPham INT UNSIGNED NOT NULL,
    SoChungNhan VARCHAR(100) NOT NULL UNIQUE,
    TenChungNhan VARCHAR(200) NOT NULL,
    DonViCap VARCHAR(200) NOT NULL,
    NgayCap DATE NULL,
    NgayHetHan DATE NULL,
    TepChungNhan VARCHAR(255) NULL,
    TrangThai ENUM('con_hieu_luc', 'het_hieu_luc', 'bi_thu_hoi', 'cho_duyet')
        NOT NULL DEFAULT 'cho_duyet',
    GhiChu TEXT NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_chung_nhan_san_pham (MaSanPham),
    KEY idx_chung_nhan_trang_thai (TrangThai),
    CONSTRAINT chk_chung_nhan_ngay CHECK (
        NgayCap IS NULL OR NgayHetHan IS NULL OR NgayHetHan >= NgayCap
    ),
    CONSTRAINT fk_chung_nhan_san_pham
        FOREIGN KEY (MaSanPham) REFERENCES san_pham_ocop(MaSanPham)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE ma_qr (
    MaQR INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaLo INT UNSIGNED NOT NULL UNIQUE,
    NoiDungQR VARCHAR(500) NOT NULL UNIQUE,
    HinhAnhQR VARCHAR(255) NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TrangThai ENUM('hoat_dong', 'vo_hieu') NOT NULL DEFAULT 'hoat_dong',
    CONSTRAINT fk_qr_lo
        FOREIGN KEY (MaLo) REFERENCES lo_san_xuat(MaLo)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE lich_su_truy_xuat (
    MaLichSu BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    MaLo INT UNSIGNED NOT NULL,
    ThoiGianTruyXuat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ThietBi VARCHAR(100) NULL,
    TrinhDuyet VARCHAR(255) NULL,
    DiaChiIP VARCHAR(45) NULL,
    KEY idx_truy_xuat_lo (MaLo),
    KEY idx_truy_xuat_thoi_gian (ThoiGianTruyXuat),
    CONSTRAINT fk_truy_xuat_lo
        FOREIGN KEY (MaLo) REFERENCES lo_san_xuat(MaLo)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- DU LIEU MAU
-- ============================================================

INSERT INTO vai_tro (TenVaiTro, MoTa) VALUES
('admin', 'Quản trị toàn bộ hệ thống'),
('co_so_san_xuat', 'Quản lý cơ sở, sản phẩm và lô sản xuất của cơ sở'),
('can_bo_kiem_dinh', 'Cập nhật và xem kết quả kiểm định'),
('co_quan_quan_ly', 'Giám sát, duyệt và quản lý thông tin OCOP'),
('nguoi_tieu_dung', 'Tra cứu thông tin sản phẩm và nguồn gốc');

INSERT INTO co_so_san_xuat
(TenCoSo, TenChuCoSo, DiaChi, SoDienThoai, Email, MoTa, TrangThai)
VALUES
('HTX Chè Tân Cương', 'Nguyễn Văn A', 'Tân Cương, Thái Nguyên', '0912345678',
 'chetancuong@example.com', 'Hợp tác xã sản xuất chè đặc sản', 'hoat_dong'),
('HTX Mật ong Mèo Vạc', 'Trần Thị B', 'Mèo Vạc, Hà Giang', '0987654321',
 'matongmeovac@example.com', 'Cơ sở nuôi ong lấy mật tự nhiên', 'hoat_dong');

INSERT INTO vung_nguyen_lieu
(MaCoSo, TenVung, DiaChi, DienTich, DonViDienTich, MoTa)
VALUES
(1, 'Vùng chè Tân Cương', 'Tân Cương, Thái Nguyên', 12.50, 'ha', 'Vùng trồng chè nguyên liệu'),
(2, 'Vùng nuôi ong Mèo Vạc', 'Mèo Vạc, Hà Giang', 8.00, 'ha', 'Khu vực nuôi ong lấy mật');

-- 6 san pham (dung ten file anh trong frontend/images)
INSERT INTO san_pham_ocop
(MaCoSo, TenSanPham, MaSanPhamOCOP, NhomSanPham, SoSaoOCOP, MoTa, HinhAnh, TrangThai)
VALUES
(1, 'Chè xanh Tân Cương', 'OCOP001', 'Đồ uống', 4, 'Chè búp sao thủ công, hương cốm đặc trưng', 'images/che-xanh.jpg', 'da_duyet'),
(2, 'Mật ong bạc hà', 'OCOP002', 'Thực phẩm', 3, 'Mật ong nguyên chất từ hoa bạc hà', 'images/mat-ong.jpg', 'da_duyet'),
(1, 'Cà phê đặc sản', 'OCOP003', 'Đồ uống', 4, 'Cà phê rang xay nguyên chất, hương thơm đậm đà', 'images/ca-phe.jpg', 'da_duyet'),
(2, 'Cam sành đặc sản', 'OCOP004', 'Nông sản', 3, 'Cam sành tươi, vị ngọt thanh, mọng nước', 'images/cam-sanh.jpg', 'da_duyet'),
(1, 'Chuối sấy dẻo', 'OCOP005', 'Thực phẩm', 3, 'Chuối sấy dẻo tự nhiên, không chất bảo quản', 'images/chuoi-say.jpg', 'da_duyet'),
(2, 'Gạo ST25', 'OCOP006', 'Nông sản', 5, 'Gạo ST25 thơm dẻo, đạt chuẩn OCOP', 'images/gao-st25.jpg', 'da_duyet');

INSERT INTO lo_san_xuat
(MaSanPham, MaVung, MaSoLo, NgayThuHoach, NgaySanXuat, HanSuDung, SoLuong, DonViTinh, TrangThai)
VALUES
(1, 1, 'LO-OCOP001-2026-001', '2026-09-10', '2026-09-11', '2027-09-11', 250.00, 'kg', 'hoan_thanh'),
(2, 2, 'LO-OCOP002-2026-001', '2026-09-15', '2026-09-16', '2028-09-16', 120.00, 'lit', 'hoan_thanh');

INSERT INTO qua_trinh_san_xuat
(MaLo, TenGiaiDoan, MoTa, NgayBatDau, NgayKetThuc, DiaDiem)
VALUES
(1, 'Thu hoạch', 'Thu hoạch chè từ vùng nguyên liệu', '2026-09-10', '2026-09-10', 'Tân Cương, Thái Nguyên'),
(1, 'Chế biến và đóng gói', 'Chế biến, đóng gói và kiểm tra sản phẩm', '2026-09-11', '2026-09-11', 'Cơ sở HTX Chè Tân Cương'),
(2, 'Thu hoạch', 'Thu hoạch mật ong', '2026-09-15', '2026-09-15', 'Mèo Vạc, Hà Giang'),
(2, 'Lọc và đóng chai', 'Lọc, đóng chai và dán nhãn', '2026-09-16', '2026-09-16', 'Cơ sở HTX Mật ong Mèo Vạc');

INSERT INTO kiem_dinh
(MaLo, DonViKiemDinh, NgayGuiMau, NgayKiemDinh, KetQua, ChiTieuKiemDinh, NoiDungKetQua)
VALUES
(1, 'Đơn vị kiểm định mẫu', '2026-09-12', '2026-09-14', 'dat', 'Độ ẩm, tạp chất', 'Dữ liệu minh họa, cần thay bằng kết quả thực tế'),
(2, 'Đơn vị kiểm định mẫu', '2026-09-17', '2026-09-19', 'cho_kiem_dinh', 'Chất lượng và an toàn thực phẩm', 'Đang chờ cập nhật kết quả thực tế');

INSERT INTO chung_nhan
(MaSanPham, SoChungNhan, TenChungNhan, DonViCap, NgayCap, NgayHetHan, TrangThai, GhiChu)
VALUES
(1, 'CN-OCOP001-DEMO', 'Chứng nhận OCOP minh họa', 'Cơ quan cấp chứng nhận minh họa',
 '2026-01-01', '2027-12-31', 'con_hieu_luc', 'Dữ liệu demo, không phải chứng nhận thật'),
(2, 'CN-OCOP002-DEMO', 'Chứng nhận OCOP minh họa', 'Cơ quan cấp chứng nhận minh họa',
 '2026-01-01', '2027-12-31', 'con_hieu_luc', 'Dữ liệu demo, không phải chứng nhận thật');

INSERT INTO ma_qr (MaLo, NoiDungQR, TrangThai) VALUES
(1, 'OCOP_TRACE:LO-OCOP001-2026-001', 'hoat_dong'),
(2, 'OCOP_TRACE:LO-OCOP002-2026-001', 'hoat_dong');

INSERT INTO lich_su_truy_xuat (MaLo, ThietBi, TrinhDuyet) VALUES
(1, 'Điện thoại', 'Chrome Mobile'),
(1, 'Máy tính', 'Chrome Desktop'),
(2, 'Điện thoại', 'Safari Mobile');

-- Kiem tra nhanh
SELECT MaSanPham, TenSanPham, NhomSanPham, SoSaoOCOP, HinhAnh FROM san_pham_ocop;