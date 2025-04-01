const express = require('express');
const {
  getCongNoList,
  getCongNoById,
  createCongNo,
  updateCongNo,
  deleteCongNo,
  addPayment,
  getCongNoStatistics
} = require('../controllers/congno.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

router.route('/')
  .get(getCongNoList)
  .post(authorize('admin', 'ketoan', 'quanly'), createCongNo);

router.route('/statistics')
  .get(authorize('admin', 'ketoan', 'quanly'), getCongNoStatistics);

router.route('/:id')
  .get(getCongNoById)
  .put(authorize('admin', 'ketoan', 'quanly'), updateCongNo)
  .delete(authorize('admin', 'quanly'), deleteCongNo);

router.route('/:id/payments')
  .post(authorize('admin', 'ketoan', 'quanly'), addPayment);

module.exports = router;