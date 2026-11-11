
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 3000);

// ==================== HTTPS CERTIFICATE ====================

const frontendPath = path.join(__dirname, "..", "frontend");

const certPath = path.join(frontendPath, "192.168.1.213+2.pem");
const keyPath = path.join(frontendPath, "192.168.1.213+2-key.pem");
const traceRoutes = require("./routes/traceRoutes");
// Kiểm tra file chứng chỉ
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error("Không tìm thấy file chứng chỉ HTTPS!");
    process.exit(1);
}

// ==================== MIDDLEWARE ====================

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ==================== API ROUTES ====================

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminUsersRoutes"));
app.use("/api/co-so", require("./routes/coSoSanXuatRoutes"));
app.use("/api/products", require("./routes/productsRoutes"));

app.use("/api/vung-nguyen-lieu",
    require("./routes/vungNguyenLieuRoutes"));

app.use("/api/lo-san-xuat",
    require("./routes/loSanXuatRoutes"));

app.use("/api/lich-su-san-xuat",
    require("./routes/lichSuSanXuatRoutes"));

app.use("/api/kiem-dinh",
    require("./routes/kiemDinhRoutes"));

app.use("/api/chung-nhan",
    require("./routes/chungNhanRoutes"));
app.use("/api/trace", traceRoutes);

// ==================== FRONTEND STATIC FILES ====================

// Phục vụ trực tiếp các file trong thư mục frontend
app.use(express.static(frontendPath));

// ==================== API NOT FOUND ====================

app.use("/api", (req, res) => {
    res.status(404).json({
        message: `Không tìm thấy API: ${req.method} ${req.originalUrl}`
    });
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
    console.error("Lỗi server:", err);

    res.status(err.status || 500).json({
        message: err.message || "Lỗi máy chủ"
    });
});


// ==================== START HTTPS SERVER ====================

const server = https.createServer({
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
}, app);

server.listen(port, "0.0.0.0", () => {
    console.log(`Backend HTTPS đang chạy tại https://192.168.1.213:${port}`);
});
