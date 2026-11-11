const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const controller = require('../controllers/coSoSanXuatController');
const { getScope } = require('../utils/ownership');

// Cơ sở sản xuất chỉ được sửa thông tin của chính cơ sở mình
async function onlyOwnCoSo(req, res, next) {
    try {
        const scope = await getScope(req);
        if (scope.restricted && String(scope.maCoSo) !== String(req.params.id)) {
            return res.status(403).json({ message: 'Bạn chỉ được sửa thông tin cơ sở của mình.' });
        }
        next();
    } catch (error) {
        console.error('Lỗi kiểm tra quyền cơ sở:', error);
        res.status(500).json({ message: 'Lỗi kiểm tra quyền' });
    }
}

// Yêu cầu đăng nhập cho tất cả API bên dưới
router.use(auth);

// Ai đăng nhập cũng xem được (regions.html cần danh sách này)
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Thêm cơ sở mới: chỉ admin
router.post('/', requireRole('admin'), controller.create);

// Sửa: admin, hoặc cơ sở sản xuất sửa đúng cơ sở của mình
router.put('/:id', requireRole('admin', 'co_so_san_xuat'), onlyOwnCoSo, controller.update);

// Xóa: chỉ admin
router.delete('/:id', requireRole('admin'), controller.delete);

module.exports = router;
