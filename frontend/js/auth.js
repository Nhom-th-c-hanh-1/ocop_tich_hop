const API_BASE = window.location.origin;

const loginForm = document.getElementById('loginForm');
const message = document.getElementById('loginMessage');

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.getElementById('loginButton');
    const tenDangNhap = document.getElementById('tenDangNhap').value.trim();
    const matKhau = document.getElementById('matKhau').value;
    message.textContent = 'Đang kiểm tra thông tin đăng nhập...';
    button.disabled = true;
    try {
      const response = await fetch(API_BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDangNhap, matKhau })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đăng nhập thất bại.');
      localStorage.setItem('ocopToken', data.token);
      localStorage.setItem('ocopUser', JSON.stringify(data.user));
      message.textContent = `Xin chào ${data.user.hoTen}! Vai trò: ${data.user.vaiTro}.`;
      window.location.href = data.user.vaiTro === 'admin'
  ? 'admin-users.html'
  : 'products.html';
    } catch (error) {
      message.textContent = error.message === 'Failed to fetch'
        ? 'Không kết nối được máy chủ. Hãy kiểm tra npm start.'
        : (error.message || 'Không kết nối được máy chủ.');
    } finally {
      button.disabled = false;
    }
  });
}