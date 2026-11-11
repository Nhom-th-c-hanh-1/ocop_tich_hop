// Đường dẫn API của bạn
const API_URL = '/api/co-so';

// Hàm lấy token đăng nhập (Bạn cần xem lúc đăng nhập, Người 1 lưu token với tên gì: 'token', 'accessToken', 'jwt'...)
const getToken = () => localStorage.getItem('token');

// Hàm hiển thị thông báo lỗi nếu token sai
const checkAuth = (res) => {
    if (res.status === 401 || res.status === 403) {
        alert("Bạn chưa đăng nhập hoặc không có quyền truy cập!");
        window.location.href = 'login.html'; // Đẩy về trang đăng nhập
        return false;
    }
    return true;
}

// 1. Tải danh sách cơ sở
async function loadDanhSachCoSo() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!checkAuth(response)) return;

        const result = await response.json();
        if (result.success) {
            const tableBody = document.getElementById('tbody-co-so');
            if (!tableBody) return; // Nếu không tìm thấy bảng thì bỏ qua

            tableBody.innerHTML = '';
            result.data.forEach((item, index) => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.ten_co_so}</td>
                        <td>${item.dia_chi || ''}</td>
                        <td>${item.so_dien_thoai || ''}</td>
                        <td>${item.giay_chung_nhan || ''}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editCoSo(${item.id})">Sửa</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCoSo(${item.id})">Xóa</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error("Lỗi tải danh sách", error);
    }
}

// 2. Thêm mới Cơ sở
async function themCoSo(event) {
    event.preventDefault(); // Chặn form tải lại trang

    const bodyData = {
        ten_co_so: document.getElementById('ten_co_so').value,
        dia_chi: document.getElementById('dia_chi').value,
        so_dien_thoai: document.getElementById('so_dien_thoai').value,
        giay_chung_nhan: document.getElementById('giay_chung_nhan').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(bodyData)
        });

        if (!checkAuth(response)) return;

        const result = await response.json();
        if (result.success) {
            alert('Thêm cơ sở thành công!');
            document.getElementById('form-co-so').reset(); // Xóa trắng form
            loadDanhSachCoSo(); // Tải lại bảng
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error(error);
    }
}

// 3. Xóa Cơ sở
async function deleteCoSo(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa cơ sở này?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!checkAuth(response)) return;

        const result = await response.json();
        if (result.success) {
            alert('Xóa thành công!');
            loadDanhSachCoSo();
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error(error);
    }
}

// Chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Nếu đang ở trang có bảng cơ sở thì mới tải dữ liệu
    if (document.getElementById('tbody-co-so')) {
        loadDanhSachCoSo();

        // Gắn sự kiện submit cho form thêm mới (nếu có)
        const form = document.getElementById('form-co-so');
        if (form) form.addEventListener('submit', themCoSo);
    }
});