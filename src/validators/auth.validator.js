const { check, validationResult } = require('express-validator');

exports.validateRegister = [
  check('name')
    .not().isEmpty().withMessage('Vui lòng nhập tên')
    .trim(),
  check('email')
    .isEmail().withMessage('Vui lòng nhập đúng định dạng email')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  check('role')
    .isIn(['admin', 'ketoan', 'nhanvien', 'quanly']).withMessage('Vai trò không hợp lệ'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        errors: errors.array() 
      });
    }
    next();
  }
];

exports.validateLogin = [
  check('email')
    .isEmail().withMessage('Vui lòng nhập đúng định dạng email')
    .normalizeEmail(),
  check('password')
    .exists().withMessage('Vui lòng nhập mật khẩu'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        errors: errors.array() 
      });
    }
    next();
  }
];