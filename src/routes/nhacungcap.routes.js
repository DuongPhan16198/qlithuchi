const express = require('express');
const {
  getNhaCungCapList,
  getNhaCungCapById,
  createNhaCungCap,
  updateNhaCungCap,
  deleteNhaCungCap
} = require('../controllers/nhacungcap.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

router.route('/')
  .get(getNhaCungCapList)
  .post(authorize('admin', 'ketoan', 'quanly'), createNhaCungCap);

router.route('/:id')
  .get(getNhaCungCapById)
  .put(authorize('admin', 'ketoan', 'quanly'), updateNhaCungCap)
  .delete(authorize('admin', 'quanly'), deleteNhaCungCap);

module.exports = router;