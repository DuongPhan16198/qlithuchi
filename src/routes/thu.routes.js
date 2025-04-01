const express = require('express');
const {
  getThuList,
  getThuById,
  createThu,
  updateThu,
  deleteThu,
  getThuStatistics
} = require('../controllers/thu.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

router.route('/')
  .get(getThuList)
  .post(authorize('admin', 'ketoan', 'quanly'), createThu);

router.route('/statistics')
  .get(authorize('admin', 'ketoan', 'quanly'), getThuStatistics);

router.route('/:id')
  .get(getThuById)
  .put(authorize('admin', 'ketoan', 'quanly'), updateThu)
  .delete(authorize('admin', 'ketoan', 'quanly'), deleteThu);

module.exports = router;