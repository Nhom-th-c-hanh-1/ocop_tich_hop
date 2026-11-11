
const express = require('express');
const router = express.Router();

const productsController = require('../controllers/productsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Xem danh sách và chi tiết sản phẩm: người dùng đã đăng nhập
router.get('/', authMiddleware, productsController.getProducts);
router.get('/:id', authMiddleware, productsController.getProductById);

// Thêm sản phẩm: admin hoặc cơ sở sản xuất
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'co_so_san_xuat'),
  productsController.createProduct
);

// Sửa sản phẩm: admin hoặc cơ sở sản xuất
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'co_so_san_xuat'),
  productsController.updateProduct
);

// Xóa sản phẩm: admin hoặc cơ sở sản xuất
// Controller sẽ kiểm tra quyền sở hữu sản phẩm trước khi xóa
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'co_so_san_xuat'),
  productsController.deleteProduct
);

module.exports = router;
