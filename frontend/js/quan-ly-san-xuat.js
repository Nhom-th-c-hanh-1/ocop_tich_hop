const API = "http://localhost:3000/api/thanh-vien-4";

const $ = (selector) => document.querySelector(selector);

function baoTin(message, error = false) {
  const box = $("#thongBao");
  box.textContent = message;
  box.className = "notice show" + (error ? " error" : "");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

async function requestAPI(path, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Lỗi HTTP ${response.status}`);
  }

  return data;
}

function duLieuForm(form) {
  const object = Object.fromEntries(new FormData(form).entries());

  Object.keys(object).forEach((key) => {
    if (object[key] === "") object[key] = null;
  });

  return object;
}

function hienBang(selector, rows, columns) {
  const tbody = $(selector);

  if (!rows.length) {
    tbody.innerHTML =
      `<tr><td colspan="${columns.length}">Chưa có dữ liệu</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((row) =>
    "<tr>" + columns.map((column) =>
      `<td>${escapeHTML(row[column] ?? "—")}</td>`
    ).join("") + "</tr>"
  ).join("");
}

// ============================
// Tải dữ liệu các bảng
// ============================

async function taiVung() {
  const rows = await requestAPI("/vung-nguyen-lieu");

  hienBang("#bangVung", rows, [
    "MaVung", "TenVung", "DiaChi", "DienTich", "TrangThai"
  ]);
}

async function taiLo() {
  const rows = await requestAPI("/lo-san-xuat");

  hienBang("#bangLo", rows, [
    "MaLo", "MaSoLo", "MaSanPham", "TenVung",
    "NgaySanXuat", "TrangThai"
  ]);
}

async function taiQuaTrinh(maLo) {
  const rows = await requestAPI(
    "/qua-trinh/" + encodeURIComponent(maLo)
  );

  hienBang("#bangQuaTrinh", rows, [
    "TenGiaiDoan", "MoTa", "NgayBatDau", "NgayKetThuc", "DiaDiem"
  ]);
}

async function taiKiemDinh() {
  const rows = await requestAPI("/kiem-dinh");

  hienBang("#bangKiemDinh", rows, [
    "MaKiemDinh", "MaLo", "DonViKiemDinh",
    "NgayKiemDinh", "KetQua"
  ]);
}

async function taiChungNhan() {
  const rows = await requestAPI("/chung-nhan");

  hienBang("#bangChungNhan", rows, [
    "MaChungNhan", "MaSanPham", "SoChungNhan",
    "TenChungNhan", "DonViCap", "TrangThai"
  ]);
}

// ============================
// Gửi biểu mẫu
// ============================

async function guiForm(formSelector, endpoint, taiLai, message) {
  const form = $(formSelector);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const data = duLieuForm(form);

      await requestAPI(endpoint, {
        method: "POST",
        body: JSON.stringify(data)
      });

      baoTin(message);
      form.reset();

      await taiLai();
    } catch (error) {
      console.error(error);
      baoTin(error.message, true);
    }
  });
}

guiForm(
  "#formVung",
  "/vung-nguyen-lieu",
  taiVung,
  "Đã thêm vùng nguyên liệu."
);

guiForm(
  "#formLo",
  "/lo-san-xuat",
  taiLo,
  "Đã tạo lô sản xuất."
);

guiForm(
  "#formQuaTrinh",
  "/qua-trinh",
  async () => {
    await taiLo();

    const maLo = $("#formQuaTrinh").elements.MaLo.value;
    if (maLo) await taiQuaTrinh(maLo);
  },
  "Đã thêm quá trình sản xuất."
);

guiForm(
  "#formKiemDinh",
  "/kiem-dinh",
  taiKiemDinh,
  "Đã tạo hồ sơ kiểm định."
);

guiForm(
  "#formChungNhan",
  "/chung-nhan",
  taiChungNhan,
  "Đã thêm chứng nhận."
);

// Tra cứu quá trình theo mã lô
$("#formTimQuaTrinh").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const maLo = event.currentTarget.elements.MaLo.value;
    await taiQuaTrinh(maLo);
    baoTin("Đã tải lịch sử sản xuất.");
  } catch (error) {
    baoTin(error.message, true);
  }
});

// Chuyển tab
document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".panel").forEach((panel) => {
      panel.classList.add("hidden");
    });

    document.querySelectorAll("[data-tab]").forEach((tab) => {
      tab.classList.remove("active");
    });

    $("#" + button.dataset.tab).classList.remove("hidden");
    button.classList.add("active");
  });
});

// Tải dữ liệu khi mở trang
async function khoiDong() {
  document.querySelector('[data-tab="vung"]').classList.add("active");

  try {
    await Promise.all([
      taiVung(),
      taiLo(),
      taiKiemDinh(),
      taiChungNhan()
    ]);
  } catch (error) {
    console.error(error);
    baoTin(
      "Không tải được dữ liệu. Hãy kiểm tra backend, database và đường dẫn API.",
      true
    );
  }
}

khoiDong();