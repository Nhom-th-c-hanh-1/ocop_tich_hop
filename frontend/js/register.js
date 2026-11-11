const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.getElementById('registerButton');
    const hoTen = document.getElementById('hoTen').value.trim();
    const tenDangNhap = document.getElementById('tenDangNhap').value.trim();
    const email = document.getElementById('email').value.trim();
    const soDienThoai = document.getElementById('soDienThoai').value.trim();
    const matKhau = document.getElementById('matKhau').value;
    const xacNhanMatKhau = document.getElementById('xacNhanMatKhau').value;

    if (matKhau !== xacNhanMatKhau) {
      registerMessage.textContent = 'Mật khẩu nhập lại không khớp.';
      return;
    }
    if (matKhau.length < 8) {
      registerMessage.textContent = 'Mật khẩu phải có ít nhất 8 ký tự.';
      return;
    }

    button.disabled = true;
    registerMessage.textContent = 'Đang tạo tài khoản...';
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoTen, tenDangNhap, email, soDienThoai, matKhau })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đăng ký thất bại.');
      registerMessage.textContent = data.message || 'Đăng ký thành công.';
      registerForm.reset();
      window.setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    } catch (error) {
      registerMessage.textContent = error.message || 'Không kết nối được máy chủ.';
    } finally {
      button.disabled = false;
    }
  });
}
