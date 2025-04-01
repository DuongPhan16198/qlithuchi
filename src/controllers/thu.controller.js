const Thu = require('../models/thu.model');

// @desc    Get all khoản thu
// @route   GET /api/thu
// @access  Private
exports.getThuList = async (req, res) => {
  try {
    const { 
      tuNgay, 
      denNgay, 
      loaiThu,
      khachHang,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    // Filter by date range
    if (tuNgay && denNgay) {
      query.ngayThu = {
        $gte: new Date(tuNgay),
        $lte: new Date(denNgay)
      };
    } else if (tuNgay) {
      query.ngayThu = { $gte: new Date(tuNgay) };
    } else if (denNgay) {
      query.ngayThu = { $lte: new Date(denNgay) };
    }
    
    // Filter by loaiThu
    if (loaiThu) {
      query.loaiThu = loaiThu;
    }
    
    // Filter by khachHang
    if (khachHang) {
      query.khachHang = khachHang;
    }

    // Pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { ngayThu: -1 },
      populate: [
        { path: 'khachHang', select: 'tenKhachHang' },
        { path: 'nguoiTao', select: 'name' }
      ]
    };

    const result = await Thu.paginate(query, options);

    res.status(200).json({
      status: 'success',
      data: {
        thu: result.docs,
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

// @desc    Get thu by ID
// @route   GET /api/thu/:id
// @access  Private
exports.getThuById = async (req, res) => {
  try {
    const thu = await Thu.findById(req.params.id)
      .populate('khachHang', 'tenKhachHang')
      .populate('hoaDon', 'maHoaDon')
      .populate('nguoiTao', 'name');

    if (!thu) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khoản thu'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        thu
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new thu
// @route   POST /api/thu
// @access  Private
exports.createThu = async (req, res) => {
  try {
    // Add current user to request body
    req.body.nguoiTao = req.user.id;

    const thu = await Thu.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        thu
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update thu
// @route   PUT /api/thu/:id
// @access  Private
exports.updateThu = async (req, res) => {
  try {
    const thu = await Thu.findById(req.params.id);

    if (!thu) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khoản thu'
      });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && req.user.id.toString() !== thu.nguoiTao.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền cập nhật khoản thu này'
      });
    }

    const updatedThu = await Thu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        thu: updatedThu
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete thu
// @route   DELETE /api/thu/:id
// @access  Private
exports.deleteThu = async (req, res) => {
  try {
    const thu = await Thu.findById(req.params.id);

    if (!thu) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khoản thu'
      });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && req.user.id.toString() !== thu.nguoiTao.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xóa khoản thu này'
      });
    }

    await thu.remove();

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

// @desc    Get thu statistics
// @route   GET /api/thu/statistics
// @access  Private
exports.getThuStatistics = async (req, res) => {
  try {
    const { tuNgay, denNgay } = req.query;
    
    const matchStage = {};
    
    // Filter by date range
    if (tuNgay && denNgay) {
      matchStage.ngayThu = {
        $gte: new Date(tuNgay),
        $lte: new Date(denNgay)
      };
    } else if (tuNgay) {
      matchStage.ngayThu = { $gte: new Date(tuNgay) };
    } else if (denNgay) {
      matchStage.ngayThu = { $lte: new Date(denNgay) };
    }

    // Get total by loaiThu
    const thongKeThuTheoLoai = await Thu.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: '$loaiThu',
          tongTien: { $sum: '$soTien' },
          soLuong: { $sum: 1 }
        }
      },
      { $sort: { tongTien: -1 } }
    ]);

    // Get total by month
    const thongKeThuTheoThang = await Thu.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$ngayThu' },
            month: { $month: '$ngayThu' }
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
    const tongThu = await Thu.aggregate([
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
        thongKeThuTheoLoai,
        thongKeThuTheoThang,
        tongThu: tongThu.length > 0 ? tongThu[0] : { tongTien: 0, soLuong: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};