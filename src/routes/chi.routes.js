const express = require('express');
const {
  getChiList,
  getChiById,
  createChi,
  updateChi,
  deleteChi,
  getChiStatistics
} = require('../controllers/chi.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

router.route('/')
  .get(getChiList)
  .post(authorize('admin', 'ketoan', 'quanly'), createChi);

router.route('/statistics')
  .get(authorize('admin', 'ketoan', 'quanly'), getChiStatistics);

router.route('/:id')
  .get(getChiById)
  .put(authorize('admin', 'ketoan', 'quanly'), updateChi)
  .delete(authorize('admin', 'ketoan', 'quanly'), deleteChi);

module.exports = router;