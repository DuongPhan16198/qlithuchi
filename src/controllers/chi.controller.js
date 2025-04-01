const Chi = require('../models/chi.model');

// @desc    Get all khoản chi
// @route   GET /api/chi
// @access  Private
exports.getChiList = async (req, res) => {
  try {
    const { 
      tuNgay, 
      denNgay, 
      loaiChi,
      nhaCungCap,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    // Filter by date range
    if (tuNgay && denNgay) {
      query.ngayChi = {
        $gte: new Date(tuNgay),
        $lte: new Date(denNgay)
      };
    } else if (tuNgay) {
      query.ngayChi = { $gte: new Date(tuNgay) };
    } else if (denNgay) {
      query.ngayChi = { $lte: new Date(denNgay) };
    }
    
    // Filter by loaiChi
    if (loaiChi) {
      query.loaiChi = loaiChi;
    }
    
    // Filter by nhaCungCap
    if (nhaCungCap) {
      query.nhaCungCap = nhaCungCap;
    }

    // Pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { ngayChi: -1 },
      populate: [
        { path: 'nhaCungCap', select: 'tenNhaCungCap' },
        { path: 'nguoiTao', select: 'name' }
      ]
    };

    const result = await Chi.paginate(query, options);

    res.status(200).json({
      status: 'success',
      data: {
        chi: result.docs,
        pagination: {
          total: result.totalDocs,
          limit: result.limit,
          page: result.page,
          pages: result.totalPages
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get chi by ID
// @route   GET /api/chi/:id
// @access  Private
exports.getChiById = async (req, res) => {
  try {
    const chi = await Chi.findById(req.params.id)
      .populate('nhaCungCap', 'tenNhaCungCap')
      .populate('nguoiTao', 'name');

    if (!chi) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khoản chi'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        chi
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new chi
// @route   POST /api/chi
// @access  Private
exports.createChi = async (req, res) => {
  try {
    // Add current user to request body
    req.body.nguoiTao = req.user.id;

    const chi = await Chi.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        chi
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update chi
// @route   PUT /api/chi/:id
// @access  Private
exports.updateChi = async (req, res) => {
  try {
    const chi = await Chi.findById(req.params.id);

    if (!chi) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khoản chi'
      });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && req.user.id.toString() !== chi.nguoiTao.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền cập nhật khoản chi này'
      });
    }

    const updatedChi = await Chi.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        chi: updatedChi
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete chi
// @route   DELETE /api/chi/:id
// @access  Private
exports.deleteChi = async (req, res) => {
  try {
    const chi = await Chi.findById(req.params.id);

    if (!chi) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khoản chi'
      });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && req.user.id.toString() !== chi.nguoiTao.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xóa khoản chi này'
      });
    }

    await chi.remove();

    res.status(200).json({
      status: 'success',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get chi statistics
// @route   GET /api/chi/statistics
// @access  Private
exports.getChiStatistics = async (req, res) => {
  try {
    const { tuNgay, denNgay } = req.query;
    
    const matchStage = {};
    
    // Filter by date range
    if (tuNgay && denNgay) {
      matchStage.ngayChi = {
        $gte: new Date(tuNgay),
        $lte: new Date(denNgay)
      };
    } else if (tuNgay) {
      matchStage.ngayChi = { $gte: new Date(tuNgay) };
    } else if (denNgay) {
      matchStage.ngayChi = { $lte: new Date(denNgay) };
    }

    // Get total by loaiChi
    const thongKeChiTheoLoai = await Chi.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: '$loaiChi',
          tongTien: { $sum: '$soTien' },
          soLuong: { $sum: 1 }
        }
      },
      { $sort: { tongTien: -1 } }
    ]);

    // Get total by month
    const thongKeChiTheoThang = await Chi.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$ngayChi' },
            month: { $month: '$ngayChi' }
          },
          tongTien: { $sum: '$soTien' },
          soLuong: { $sum: 1 }
        }
      },
      { 
        $project: {
          _id: 0,
          nam: '$_id.year',
          thang: '$_id.month',
          tongTien: 1,
          soLuong: 1
        }
      },
      { $sort: { nam: 1, thang: 1 } }
    ]);

    // Get total
    const tongChi = await Chi.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          tongTien: { $sum: '$soTien' },
          soLuong: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        thongKeChiTheoLoai,
        thongKeChiTheoThang,
        tongChi: tongChi.length > 0 ? tongChi[0] : { tongTien: 0, soLuong: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};