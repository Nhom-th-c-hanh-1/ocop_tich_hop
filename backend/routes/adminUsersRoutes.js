const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const controller = require('../controllers/adminUsersController');

router.use(auth, requireRole('admin'));
router.get('/roles', controller.roles);
router.get('/users', controller.list);
router.post('/users', controller.create);
router.patch('/users/:id/status', controller.updateStatus);

module.exports = router;
