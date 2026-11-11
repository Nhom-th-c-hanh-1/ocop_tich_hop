const API_BASE = 'https://localhost:3000';
(() => {
const API_BASE = 'https://localhost:3000';
  const token = localStorage.getItem('ocopToken');

  let roles = [];
  
  const form = document.getElementById('createUserForm');
  const roleSelect = document.getElementById('role');
  const facilityField = document.getElementById('facilityField');
  const facilityId = document.getElementById('facilityId');
  const formMessage = document.getElementById('formMessage');
  const listMessage = document.getElementById('listMessage');
  const usersBody = document.getElementById('usersBody');
  const createButton = document.getElementById('createButton');
  const refreshButton = document.getElementById('refreshButton');

  // Kiểm tra phần tử HTML cần thiết
  if (!form || !roleSelect || !formMessage || !listMessage || !usersBody) {
    console.error('Thiếu phần tử HTML. Hãy kiểm tra admin-users.html.');
    return;
  }

  // Gọi API Backend
  async function api(url, options = {}) {
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    };

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    let response;

    try {
      response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
      });
    } catch (error) {
      throw new Error(
        'Không kết nối được Backend. Hãy kiểm tra máy chủ tại cổng 3000.'
      );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('ocopToken');
        localStorage.removeItem('ocopUser');
        window.location.href = 'login.html';
      }

      if (response.status === 404) {
        throw new Error(`Không tìm thấy API: ${url}. Hãy kiểm tra backend.`);
      }

      if (response.status === 403) {
        throw new Error('Bạn không có quyền thực hiện thao tác này.');
      }

      throw new Error(
        data.message || `Yêu cầu thất bại (${response.status}).`
      );
    }

    return data;
  }

  // Hiển thị danh sách vai trò
  function renderRoles() {
    roleSelect.replaceChildren();

    const availableRoles = roles.filter(role =>
      !['admin', 'nguoi_tieu_dung'].includes(
        String(role.tenVaiTro || '').toLowerCase()
      )
    );

    if (availableRoles.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = '-- Không có vai trò khả dụng --';
      roleSelect.appendChild(option);
      roleSelect.disabled = true;
      updateFacilityVisibility();
      return;
    }

    roleSelect.disabled = false;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '-- Chọn vai trò --';
    placeholder.disabled = true;
    placeholder.selected = true;
    roleSelect.appendChild(placeholder);

    availableRoles.forEach(role => {
      const option = document.createElement('option');
      option.value = role.tenVaiTro;
      option.textContent = role.moTa
        ? `${role.tenVaiTro} — ${role.moTa}`
        : role.tenVaiTro;

      roleSelect.appendChild(option);
    });

    updateFacilityVisibility();
  }

  // Chỉ hiện mã cơ sở khi chọn cơ sở sản xuất
  function updateFacilityVisibility() {
    if (!facilityField || !facilityId) return;

    const needsFacility = roleSelect.value === 'co_so_san_xuat';

    facilityField.classList.toggle('hidden', !needsFacility);
    facilityId.required = needsFacility;

    if (!needsFacility) {
      facilityId.value = '';
    }
  }

  roleSelect.addEventListener('change', updateFacilityVisibility);

  // Lấy danh sách vai trò từ Backend
  async function loadRoles() {
    roleSelect.disabled = true;
    roleSelect.replaceChildren();

    const loadingOption = document.createElement('option');
    loadingOption.textContent = 'Đang tải vai trò...';
    roleSelect.appendChild(loadingOption);

    try {
      const data = await api('/api/admin/roles');

      roles = Array.isArray(data.roles) ? data.roles : [];
      renderRoles();

      if (roles.length === 0) {
        formMessage.textContent =
          'API hoạt động nhưng chưa có vai trò. Hãy kiểm tra dữ liệu và API Backend.';
      } else if (
        !roles.some(role =>
          !['admin', 'nguoi_tieu_dung'].includes(
            String(role.tenVaiTro || '').toLowerCase()
          )
        )
      ) {
        formMessage.textContent =
          'Đã tải vai trò nhưng không có vai trò phù hợp để tạo tài khoản.';
      }
    } catch (error) {
      roleSelect.replaceChildren();

      const option = document.createElement('option');
      option.value = '';
      option.textContent = '-- Không tải được vai trò --';
      roleSelect.appendChild(option);

      roleSelect.disabled = true;
      formMessage.textContent = error.message;
      throw error;
    }
  }

  // Lấy danh sách tài khoản
  async function loadUsers() {
    listMessage.textContent = 'Đang tải danh sách tài khoản...';

    try {
      const data = await api('/api/admin/users?limit=100');
      const users = Array.isArray(data.users) ? data.users : [];

      usersBody.replaceChildren();

      const currentUser = JSON.parse(
        localStorage.getItem('ocopUser') || '{}'
      );

      users.forEach(user => {
        const tr = document.createElement('tr');

        const values = [
          user.id,
          user.hoTen,
          user.tenDangNhap,
          user.vaiTro,
          user.email || '—',
          user.trangThai
        ];

        values.forEach(value => {
          const td = document.createElement('td');
          td.textContent = value ?? '—';
          tr.appendChild(td);
        });

        const actionCell = document.createElement('td');

        if (String(user.id) === String(currentUser.id)) {
          actionCell.textContent = 'Tài khoản của bạn';
        } else {
          const button = document.createElement('button');

          button.className = 'small-btn';
          button.type = 'button';
          button.textContent =
            user.trangThai === 'khoa' ? 'Mở khóa' : 'Khóa';

          button.addEventListener('click', async () => {
            const nextStatus =
              user.trangThai === 'khoa' ? 'hoat_dong' : 'khoa';

            if (
              !window.confirm(
                `${nextStatus === 'khoa' ? 'Khóa' : 'Mở khóa'} tài khoản ${user.tenDangNhap}?`
              )
            ) {
              return;
            }

            button.disabled = true;

            try {
              const result = await api(
                `/api/admin/users/${encodeURIComponent(user.id)}/status`,
                {
                  method: 'PATCH',
                  body: JSON.stringify({ trangThai: nextStatus })
                }
              );

              listMessage.textContent =
                result.message || 'Cập nhật trạng thái thành công.';

              await loadUsers();
            } catch (error) {
              listMessage.textContent = error.message;
              button.disabled = false;
            }
          });

          actionCell.appendChild(button);
        }

        tr.appendChild(actionCell);
        usersBody.appendChild(tr);
      });

      if (users.length === 0) {
        usersBody.innerHTML =
          '<tr><td colspan="7">Chưa có tài khoản.</td></tr>';
      }

      listMessage.textContent =
        `Tổng số tài khoản: ${data.pagination?.total ?? users.length}.`;
    } catch (error) {
      usersBody.innerHTML =
        '<tr><td colspan="7">Không tải được dữ liệu.</td></tr>';

      listMessage.textContent = error.message;
    }
  }

  // Tạo tài khoản mới
  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!roleSelect.value) {
      formMessage.textContent = 'Vui lòng chọn vai trò.';
      return;
    }

    const payload = {
      hoTen: document.getElementById('fullName')?.value.trim() || '',
      tenDangNhap:
        document.getElementById('username')?.value.trim() || '',
      matKhau: document.getElementById('password')?.value || '',
      email: document.getElementById('email')?.value.trim() || '',
      soDienThoai:
        document.getElementById('phone')?.value.trim() || '',
      vaiTro: roleSelect.value
    };

    if (payload.vaiTro === 'co_so_san_xuat') {
      if (!facilityId?.value) {
        formMessage.textContent = 'Vui lòng nhập mã cơ sở sản xuất.';
        return;
      }

      payload.maCoSo = facilityId.value;
    }

    if (createButton) createButton.disabled = true;
    formMessage.textContent = 'Đang tạo tài khoản...';

    try {
      const result = await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      form.reset();
      updateFacilityVisibility();

      formMessage.textContent =
        result.message || 'Tạo tài khoản thành công.';

      await loadUsers();
    } catch (error) {
      formMessage.textContent = error.message;
    } finally {
      if (createButton) createButton.disabled = false;
    }
  });

  if (refreshButton) {
    refreshButton.addEventListener('click', loadUsers);
  }

  // Kiểm tra đăng nhập trước khi tải dữ liệu
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Tải danh sách tài khoản và vai trò
  loadUsers();
  loadRoles().catch(error => {
    console.error('Lỗi tải vai trò:', error.message);
  });
})();
