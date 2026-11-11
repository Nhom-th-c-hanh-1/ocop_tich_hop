const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const controller = require('../controllers/coSoSanXuatController');

// Yêu cầu đăng nhập cho tất cả API bên dưới
router.use(auth);

// Ai đăng nhập cũng xem được
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Chỉ Admin và Cơ sở sản xuất mới được Thêm/Sửa
router.post('/', requireRole('admin', 'co_so'), controller.create);
router.put('/:id', requireRole('admin', 'co_so'), controller.update);

// Chỉ Admin mới được Xóa
router.delete('/:id', requireRole('admin'), controller.delete);

module.exports = router;