
/* ===============================
   TÌM KIẾM SẢN PHẨM
================================ */
function timKiem() {
    const input = document.getElementById("searchInput");

    if (!input) {
        alert("Không tìm thấy ô tìm kiếm!");
        return;
    }

    const tuKhoa = input.value.trim().toLowerCase();

    if (tuKhoa === "") {
        alert("Vui lòng nhập tên sản phẩm để tìm kiếm!");
        return;
    }

    switch (tuKhoa) {
        case "cam sành":
        case "cam sành hà giang":
            window.location.href =
                "product-detail.html?product=cam-sanh";
            break;

        case "mật ong":
        case "mật ong thái nguyên":
            window.location.href =
                "product-detail.html?product=mat-ong";
            break;

        case "chè xanh":
        case "chè xanh hà nội":
            window.location.href =
                "product-detail.html?product=che-xanh";
            break;

        default:
            alert("Không tìm thấy sản phẩm: " + input.value.trim());
    }
}

/* ===============================
   CHUYỂN ĐẾN TRANG QUÉT QR
================================ */
function quetQR() {
    window.location.href = "scan-qr.html";
}

/* ===============================
   CHUYỂN ĐẾN TRANG TRA CỨU
================================ */
function traCuu() {
    window.location.href = "traceproduct.html";
}

/* ===============================
   XEM CHI TIẾT SẢN PHẨM
================================ */
function xemChiTiet(product) {
    window.location.href =
        "product-detail.html?product=" +
        encodeURIComponent(product);
}
