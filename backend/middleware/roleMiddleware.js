const ROLE_ALIASES = {
  admin: ['admin'],
  co_so_san_xuat: ['co_so_san_xuat'],
  can_bo_kiem_dinh: ['can_bo_kiem_dinh', 'nhan_vien_kiem_dinh'],
  co_quan_quan_ly: ['co_quan_quan_ly'],
  nguoi_tieu_dung: ['nguoi_tieu_dung']
};

function normalize(value) {
  return String(value || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Bạn cần đăng nhập.' });
  const current = normalize(req.user.role);
  const allowed = allowedRoles.flatMap(role => ROLE_ALIASES[normalize(role)] || [normalize(role)]);
  if (!allowed.includes(current)) {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này.' });
  }
  return next();
};
