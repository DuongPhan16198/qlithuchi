const express = require('express');
const {
  getHoaDonList,
  getHoaDonById,
  createHoaDon,
  updateHoaDon,
  deleteHoaDon,
  issueHoaDon,
  payHoaDon,
  cancelHoaDon,
  getHoaDonStatistics
} = require('../controllers/hoadon.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

router.route('/')
  .get(getHoaDonList)
  .post(authorize('admin', 'ketoan', 'quanly', 'nhanvien'), createHoaDon);

router.route('/statistics')
  .get(authorize('admin', 'ketoan', 'quanly'), getHoaDonStatistics);

router.route('/:id')
  .get(getHoaDonById)
  .put(authorize('admin', 'ketoan', 'quanly', 'nhanvien'), updateHoaDon)
  .delete(authorize('admin', 'quanly'), deleteHoaDon);

router.route('/:id/issue')
  .put(authorize('admin', 'ketoan', 'quanly'), issueHoaDon);

router.route('/:id/pay')
  .put(authorize('admin', 'ketoan', 'quanly'), payHoaDon);

router.route('/:id/cancel')
  .put(authorize('admin', 'ketoan', 'quanly'), cancelHoaDon);

module.exports = router;