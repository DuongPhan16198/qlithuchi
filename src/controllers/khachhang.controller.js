const KhachHang = require('../models/khachhang.model');

// @desc    Get all khách hàng
// @route   GET /api/khachhang
// @access  Private
exports.getKhachHangList = async (req, res) => {
  try {
    const { 
      search, 
      loaiKhachHang,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    // Search by name, code, phone, email
    if (search) {
      query.$or = [
        { maKhachHang: { $regex: search, $options: 'i' } },
        { tenKhachHang: { $regex: search, $options: 'i' } },
        { soDienThoai: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by loaiKhachHang
    if (loaiKhachHang) {
      query.loaiKhachHang = loaiKhachHang;
    }

    // Pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: { path: 'nguoiTao', select: 'name' }
    };

    const result = await KhachHang.paginate(query, options);

    res.status(200).json({
      status: 'success',
      data: {
        khachHang: result.docs,
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

// @desc    Get khách hàng by ID
// @route   GET /api/khachhang/:id
// @access  Private
exports.getKhachHangById = async (req, res) => {
  try {
    const khachHang = await KhachHang.findById(req.params.id)
      .populate('nguoiTao', 'name')
      .populate('hoaDons');

    if (!khachHang) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khách hàng'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        khachHang
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new khách hàng
// @route   POST /api/khachhang
// @access  Private
exports.createKhachHang = async (req, res) => {
  try {
    // Add current user to request body
    req.body.nguoiTao = req.user.id;

    const khachHang = await KhachHang.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        khachHang
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Mã khách hàng đã tồn tại'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update khách hàng
// @route   PUT /api/khachhang/:id
// @access  Private
exports.updateKhachHang = async (req, res) => {
  try {
    const khachHang = await KhachHang.findById(req.params.id);

    if (!khachHang) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khách hàng'
      });
    }

    const updatedKhachHang = await KhachHang.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        khachHang: updatedKhachHang
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Mã khách hàng đã tồn tại'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete khách hàng
// @route   DELETE /api/khachhang/:id
// @access  Private
exports.deleteKhachHang = async (req, res) => {
  try {
    const khachHang = await KhachHang.findById(req.params.id);

    if (!khachHang) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Check if customer has invoices
    const hoaDonCount = khachHang.hoaDons ? khachHang.hoaDons.length : 0;
    
    if (hoaDonCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa khách hàng này vì đã có hóa đơn liên quan'
      });
    }

    await khachHang.remove();

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

// @desc    Get customer statistics
// @route   GET /api/khachhang/statistics
// @access  Private
exports.getKhachHangStatistics = async (req, res) => {
  try {
    // Get total by customer type
    const thongKeTheoLoai = await KhachHang.aggregate([
      { 
        $group: {
          _id: '$loaiKhachHang',
          soLuong: { $sum: 1 }
        }
      },
      { $sort: { soLuong: -1 } }
    ]);

    // Get new customers by month (last 12 months)
    const date = new Date();
    date.setMonth(date.getMonth() - 11);
    
    const khachHangMoi = await KhachHang.aggregate([
      {
        $match: {
          createdAt: { $gte: date }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          soLuong: { $sum: 1 }
        }
      },
      { 
        $project: {
          _id: 0,
          nam: '$_id.year',
          thang: '$_id.month',
          soLuong: 1
        }
      },
      { $sort: { nam: 1, thang: 1 } }
    ]);

    // Get total
    const tongKhachHang = await KhachHang.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        thongKeTheoLoai,
        khachHangMoi,
        tongKhachHang
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};