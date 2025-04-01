const express = require('express');
const {
  getBaoCaoThuChi,
  getBaoCaoCongNo,
  getBaoCaoDoanhThu,
  getDashboard
} = require('../controllers/baocao.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Apply authorization middleware
router.use(authorize('admin', 'ketoan', 'quanly'));

router.get('/thuchi', getBaoCaoThuChi);
router.get('/congno', getBaoCaoCongNo);
router.get('/doanhthu', getBaoCaoDoanhThu);
router.get('/dashboard', getDashboard);

module.exports = router;