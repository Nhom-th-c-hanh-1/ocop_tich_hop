
/* =========================================
   JAVASCRIPT TRA CỨU SẢN PHẨM VÀ QUÉT QR
   File: js/trace.js
========================================= */

/* =========================================
   1. DỮ LIỆU SẢN PHẨM
========================================= */
const products = {
    "OCOP001": {
        code: "OCOP001",
        name: "Cam sành Hà Giang",
        image: "images/cam-sanh.jpg",
        location: "Hà Giang",
        rating: "OCOP 4 sao",
        producer: "Hợp tác xã Cam sành Hà Giang",
        address: "Hà Giang, Việt Nam",
        productionDate: "01/09/2026",
        expiryDate: "01/09/2027",
        certificate: "Chứng nhận OCOP 4 sao",
        description: "Cam sành có vị ngọt thanh, mọng nước, được trồng tại Hà Giang."
    },

    "OCOP002": {
        code: "OCOP002",
        name: "Mật ong Thái Nguyên",
        image: "images/mat-ong.jpg",
        location: "Thái Nguyên",
        rating: "OCOP 4 sao",
        producer: "Cơ sở sản xuất mật ong Thái Nguyên",
        address: "Thái Nguyên, Việt Nam",
        productionDate: "01/09/2026",
        expiryDate: "01/09/2028",
        certificate: "Chứng nhận OCOP 4 sao",
        description: "Mật ong có nguồn gốc từ Thái Nguyên."
    },

    "OCOP003": {
        code: "OCOP003",
        name: "Chè xanh Hà Nội",
        image: "images/che-xanh.jpg",
        location: "Hà Nội",
        rating: "OCOP 4 sao",
        producer: "Cơ sở sản xuất chè xanh Hà Nội",
        address: "Hà Nội, Việt Nam",
        productionDate: "01/09/2026",
        expiryDate: "01/09/2027",
        certificate: "Chứng nhận OCOP 4 sao",
        description: "Sản phẩm chè xanh dùng để pha trà."
    }
};

/* =========================================
   2. TÌM SẢN PHẨM
========================================= */
function findProduct(code) {
    if (!code) return null;

    return products[code.trim().toUpperCase()] || null;
}

/* =========================================
   3. TRA CỨU VÀ CHUYỂN TRANG KẾT QUẢ
========================================= */
function goToResult(code) {
    const product = findProduct(code);

    if (!product) {
        alert("Không tìm thấy sản phẩm. Vui lòng kiểm tra lại mã!");
        return;
    }

    window.location.href =
        "trace-result.html?code=" +
        encodeURIComponent(product.code);
}

/* =========================================
   4. HIỂN THỊ KẾT QUẢ SẢN PHẨM
   Dùng khi trang có vùng #resultContainer
========================================= */
async function displayResult() {
    const container = document.getElementById("resultContainer");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
        container.innerHTML = "<p>Không tìm thấy mã truy xuất.</p>";
        return;
    }

    container.innerHTML = "<p>Đang tải thông tin truy xuất...</p>";

    try {
        const response = await fetch(
            `${window.location.origin}/api/trace/${encodeURIComponent(code)}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Không tìm thấy thông tin truy xuất.");
        }

        const product = result.sanPham;
        const lot = result.loSanXuat;
        const region = result.vungNguyenLieu;

        container.innerHTML = `
            <div class="trace-result-card">
                <img
                    src="${product.HinhAnh || ''}"
                    alt="${product.TenSanPham || 'Sản phẩm OCOP'}"
                    onerror="this.style.display='none'"
                >

                <div class="trace-result-info">
                    <h2>${product.TenSanPham || ''}</h2>
                    <p><strong>Mã sản phẩm OCOP:</strong> ${product.MaSanPhamOCOP || ''}</p>
                    <p><strong>Nhóm sản phẩm:</strong> ${product.NhomSanPham || ''}</p>
                    <p><strong>Xếp hạng:</strong> OCOP ${product.SoSaoOCOP || ''} sao</p>
                    <p><strong>Mô tả:</strong> ${product.MoTa || ''}</p>

                    <hr>

                    <h3>Thông tin lô sản xuất</h3>
                    <p><strong>Mã số lô:</strong> ${lot.MaSoLo || ''}</p>
                    <p><strong>Số lượng:</strong> ${lot.SoLuong || ''} ${lot.DonViTinh || ''}</p>
                    <p><strong>Ngày thu hoạch:</strong> ${formatDate(lot.NgayThuHoach)}</p>
                    <p><strong>Ngày sản xuất:</strong> ${formatDate(lot.NgaySanXuat)}</p>
                    <p><strong>Hạn sử dụng:</strong> ${formatDate(lot.HanSuDung)}</p>
                    <p><strong>Trạng thái:</strong> ${lot.TrangThai || ''}</p>

                    <hr>

                    <h3>Vùng nguyên liệu</h3>
                    <p><strong>Tên vùng:</strong> ${region.TenVung || ''}</p>
                </div>
            </div>
        `;

    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="trace-error">
                <h2>Không tìm thấy thông tin truy xuất</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function formatDate(value) {
    if (!value) return "Chưa có thông tin";

    return new Date(value).toLocaleDateString("vi-VN");
}

/* =========================================
   5. XỬ LÝ Ô NHẬP MÃ
========================================= */
document.addEventListener("DOMContentLoaded", function () {
    const input =
        document.getElementById("traceCode") ||
        document.getElementById("productCode") ||
        document.getElementById("searchCode");

    const button =
        document.getElementById("traceButton") ||
        document.getElementById("searchButton");

    if (button && input) {
        button.addEventListener("click", function () {
            goToResult(input.value);
        });
    }

    if (input) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                goToResult(input.value);
            }
        });
    }

    document.querySelectorAll(".demo-btn[data-code]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            goToResult(btn.dataset.code);
        });
    });

    displayResult();
});

/* =========================================
   6. QUÉT MÃ QR BẰNG CAMERA
========================================= */
let cameraStream = null;
let scanning = false;
let animationId = null;
let qrDetector = null;

const video = document.getElementById("qrVideo");
const placeholder = document.getElementById("cameraPlaceholder");
const startCameraBtn = document.getElementById("startCameraBtn");
const stopCameraBtn = document.getElementById("stopCameraBtn");
const cameraMessage = document.getElementById("cameraMessage");

const canvas = document.createElement("canvas");
const canvasContext = canvas.getContext("2d", {
    willReadFrequently: true
});

if ("BarcodeDetector" in window) {
    try {
        qrDetector = new BarcodeDetector({
            formats: ["qr_code"]
        });
    } catch (error) {
        console.warn("Không thể khởi tạo BarcodeDetector:", error);
    }
}

if (startCameraBtn) {
    startCameraBtn.addEventListener("click", startCamera);
}

if (stopCameraBtn) {
    stopCameraBtn.addEventListener("click", stopCamera);
}

async function startCamera() {
    if (!video || !startCameraBtn) {
        showCameraMessage("Không tìm thấy phần tử camera.");
        return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        showCameraMessage("Hãy mở trang bằng Live Server hoặc HTTPS để dùng camera.");
        return;
    }

    try {
        showCameraMessage("Đang mở camera...");

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false
        });

        video.srcObject = cameraStream;
        video.style.display = "block";

        if (placeholder) placeholder.style.display = "none";
        startCameraBtn.style.display = "none";

        if (stopCameraBtn) stopCameraBtn.style.display = "inline-block";

        await video.play();

        scanning = true;
        showCameraMessage("Đưa mã QR vào trước camera để quét.");
        scanQRCode();
    } catch (error) {
        console.error("Lỗi mở camera:", error);
        stopCamera();
        showCameraMessage("Không thể mở camera. Hãy kiểm tra quyền truy cập camera.");
    }
}

function extractProductCode(qrValue) {
    if (!qrValue) return "";

    let value = qrValue.trim();

    // QR chứa mã truy xuất OCOP
    if (value.startsWith("OCOP_TRACE:")) {
        return value.replace("OCOP_TRACE:", "").trim();
    }

    // QR chứa đường dẫn có mã truy xuất
    try {
        const url = new URL(value);

        const code = url.searchParams.get("code");
        if (code) return code.trim();

        const lastPart = url.pathname.split("/").filter(Boolean).pop();
        if (lastPart) return decodeURIComponent(lastPart).trim();

    } catch (error) {
        // QR chứa trực tiếp mã sản phẩm hoặc mã lô
    }

    return value;
}
async function scanQRCode() {
    if (!scanning || !video || video.readyState < 2) {
        if (scanning) animationId = requestAnimationFrame(scanQRCode);
        return;
    }

    try {
        let qrValue = "";

        if (qrDetector) {
            const barcodes = await qrDetector.detect(video);

            if (barcodes.length > 0) {
                qrValue = barcodes[0].rawValue;
            }
        }

        if (!qrValue && typeof window.jsQR === "function") {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvasContext.getImageData(
                0, 0, canvas.width, canvas.height
            );

            const result = window.jsQR(
                imageData.data,
                imageData.width,
                imageData.height
            );

            if (result) qrValue = result.data;
        }

        if (qrValue) {
            const code = extractProductCode(qrValue);
            stopCamera();

          if (code) {
    window.location.href =
        "trace-result.html?code=" + encodeURIComponent(code);
    } else {
    showCameraMessage("Mã QR không hợp lệ.");
    }

            return;
        }
    } catch (error) {
        console.debug("Đang tìm mã QR...", error);
    }

    if (scanning) animationId = requestAnimationFrame(scanQRCode);
}

function stopCamera() {
    scanning = false;

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (cameraStream) {
        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });
        cameraStream = null;
    }

    if (video) {
        video.pause();
        video.srcObject = null;
        video.style.display = "none";
    }

    if (placeholder) placeholder.style.display = "flex";
    if (startCameraBtn) startCameraBtn.style.display = "inline-block";
    if (stopCameraBtn) stopCameraBtn.style.display = "none";
}

function showCameraMessage(message) {
    if (cameraMessage) cameraMessage.textContent = message;
}

window.addEventListener("pagehide", stopCamera);
