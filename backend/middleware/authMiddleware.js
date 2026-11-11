
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Bạn cần đăng nhập để sử dụng chức năng này.'
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: 'Máy chủ chưa cấu hình JWT_SECRET.'
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = Number(payload.sub);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(401).json({
        message: 'Token không hợp lệ.'
      });
    }

    req.user = {
      id,
      role: payload.role
    };

    return next();
  } catch (error) {
    console.error('JWT ERROR:', error.name, error.message);

    return res.status(401).json({
      message: 'Token không hợp lệ hoặc đã hết hạn.'
    });
  }
};
