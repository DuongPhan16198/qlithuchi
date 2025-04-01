const express = require('express');
const {
  getKhachHangList,
  getKhachHangById,
  createKhachHang,
  updateKhachHang,
  deleteKhachHang,
  getKhachHangStatistics
} = require('../controllers/khachhang.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

router.route('/')
  .get(getKhachHangList)
  .post(authorize('admin', 'ketoan', 'quanly', 'nhanvien'), createKhachHang);

router.route('/statistics')
  .get(authorize('admin', 'ketoan', 'quanly'), getKhachHangStatistics);

router.route('/:id')
  .get(getKhachHangById)
  .put(authorize('admin', 'ketoan', 'quanly', 'nhanvien'), updateKhachHang)
  .delete(authorize('admin', 'quanly'), deleteKhachHang);

module.exports = router;