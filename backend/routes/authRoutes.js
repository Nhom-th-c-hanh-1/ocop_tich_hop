const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/authController');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', auth, controller.me);
router.post('/logout', auth, controller.logout);
router.patch('/change-password', auth, controller.changePassword);

module.exports = router;
