const CongNo = require('../models/congno.model');
const Thu = require('../models/thu.model');
const Chi = require('../models/chi.model');

// @desc    Get all công nợ
// @route   GET /api/congno
// @access  Private
exports.getCongNoList = async (req, res) => {
  try {
    const { 
      loaiNo, 
      trangThai,
      khachHang,
      nhaCungCap,
      tuNgay,
      denNgay,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    // Filter by loaiNo
    if (loaiNo) {
      query.loaiNo = loaiNo;
    }
    
    // Filter by trangThai
    if (trangThai) {
      query.trangThai = trangThai;
    }
    
    // Filter by khachHang
    if (khachHang) {
      query.khachHang = khachHang;
    }
    
    // Filter by nhaCungCap
    if (nhaCungCap) {
      query.nhaCungCap = nhaCungCap;
    }
    
    // Filter by date range
    if (tuNgay && denNgay) {
      query.ngayTao = {
        $gte: new Date(tuNgay),
        $lte: new Date(denNgay)
      };
    } else if (tuNgay) {
      query.ngayTao = { $gte: new Date(tuNgay) };
    } else if (denNgay) {
      query.ngayTao = { $lte: new Date(denNgay) };
    }

    // Pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { ngayTao: -1 },
      populate: [
        { path: 'khachHang', select: 'tenKhachHang' },
        { path: 'nhaCungCap', select: 'tenNhaCungCap' },
        { path: 'hoaDon', select: 'maHoaDon' },
        { path: 'nguoiTao', select: 'name' },
        { 
          path: 'lichSuThanhToan.nguoiTao', 
          select: 'name' 
        }
      ]
    };

    const result = await CongNo.paginate(query, options);

    res.status(200).json({
      status: 'success',
      data: {
        congNo: result.docs,
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

// @desc    Get công nợ by ID
// @route   GET /api/congno/:id
// @access  Private
exports.getCongNoById = async (req, res) => {
  try {
    const congNo = await CongNo.findById(req.params.id)
      .populate('khachHang', 'tenKhachHang maKhachHang')
      .populate('nhaCungCap', 'tenNhaCungCap maNhaCungCap')
      .populate('hoaDon', 'maHoaDon')
      .populate('nguoiTao', 'name')
      .populate('lichSuThanhToan.nguoiTao', 'name');

    if (!congNo) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khoản công nợ'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        congNo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new công nợ
// @route   POST /api/congno
// @access  Private
exports.createCongNo = async (req, res) => {
  try {
    // Add current user to request body
    req.body.nguoiTao = req.user.id;
    
    // Generate maKhoanNo if not provided
    if (!req.body.maKhoanNo) {
      const prefix = req.body.loaiNo === 'phai_thu' ? 'PT' : 'PN';
      const date = new Date();
      const timestamp = date.getTime().toString().slice(-6);
      req.body.maKhoanNo = `${prefix}${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${timestamp}`;
    }

    const congNo = await CongNo.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        congNo
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Mã khoản nợ đã tồn tại'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update công nợ
// @route   PUT /api/congno/:id
// @access  Private
exports.updateCongNo = async (req, res) => {
  try {
    const congNo = await CongNo.findById(req.params.id);

    if (!congNo) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khoản công nợ'
      });
    }

    // Don't allow changing loaiNo
    if (req.body.loaiNo && req.body.loaiNo !== congNo.loaiNo) {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể thay đổi loại nợ'
      });
    }

    const updatedCongNo = await CongNo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update status based on new data
    await updatedCongNo.updateTrangThai();

    res.status(200).json({
      status: 'success',
      data: {
        congNo: updatedCongNo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete công nợ
// @route   DELETE /api/congno/:id
// @access  Private
exports.deleteCongNo = async (req, res) => {
  try {
    const congNo = await CongNo.findById(req.params.id);

    if (!congNo) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khoản công nợ'
      });
    }

    // Check if related to invoice
    if (congNo.hoaDon) {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa khoản công nợ đã liên kết với hóa đơn'
      });
    }

    await congNo.remove();

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

// @desc    Add payment to công nợ
// @route   POST /api/congno/:id/payments
// @access  Private
exports.addPayment = async (req, res) => {
  try {
    const congNo = await CongNo.findById(req.params.id);

    if (!congNo) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khoản công nợ'
      });
    }

    const { soTien, phuongThucThanhToan, ngayThanhToan, ghiChu } = req.body;

    if (!soTien || soTien <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng nhập số tiền hợp lệ'
      });
    }

    // Calculate remaining amount
    const soTienDaThanhToan = congNo.lichSuThanhToan.reduce((total, item) => total + item.soTien, 0);
    const soTienConLai = congNo.soTien - soTienDaThanhToan;

    if (soTien > soTienConLai) {
      return res.status(400).json({
        status: 'error',
        message: `Số tiền thanh toán không thể lớn hơn số tiền còn lại (${soTienConLai})`
      });
    }

    // Add payment to history
    congNo.lichSuThanhToan.push({
      ngayThanhToan: ngayThanhToan || new Date(),
      soTien,
      phuongThucThanhToan,
      ghiChu,
      nguoiTao: req.user.id
    });

    // Update công nợ status
    await congNo.save();

    // Create Thu/Chi record for the payment
    if (congNo.loaiNo === 'phai_thu') {
      await Thu.create({
        ngayThu: ngayThanhToan || new Date(),
        soTien,
        loaiThu: 'thu_no',
        moTa: `Thanh toán công nợ ${congNo.maKhoanNo}`,
        nguoiNop: congNo.khachHang ? 'Khách hàng' : '',
        phuongThucThanhToan,
        khachHang: congNo.khachHang,
        nguoiTao: req.user.id
      });
    } else {
      await Chi.create({
        ngayChi: ngayThanhToan || new Date(),
        soTien,
        loaiChi: 'chi_phi_khac',
        moTa: `Thanh toán công nợ ${congNo.maKhoanNo}`,
        nguoiNhan: congNo.nhaCungCap ? 'Nhà cung cấp' : '',
        phuongThucThanhToan,
        nhaCungCap: congNo.nhaCungCap,
        nguoiTao: req.user.id
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        congNo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get công nợ statistics
// @route   GET /api/congno/statistics
// @access  Private
exports.getCongNoStatistics = async (req, res) => {
  try {
    // Get total by loaiNo and trangThai
    const thongKeTheoLoaiVaTrangThai = await CongNo.aggregate([
      { 
        $group: {
          _id: {
            loaiNo: '$loaiNo',
            trangThai: '$trangThai'
          },
          tongTien: { $sum: '$soTien' },
          soLuong: { $sum: 1 }
        }
      },
      { 
        $project: {
          _id: 0,
          loaiNo: '$_id.loaiNo',
          trangThai: '$_id.trangThai',
          tongTien: 1,
          soLuong: 1
        }
      },
      { $sort: { loaiNo: 1, trangThai: 1 } }
    ]);

    // Get overdue debts
    const noQuaHan = await CongNo.aggregate([
      {
        $match: {
          trangThai: 'qua_han'
        }
      },
      {
        $group: {
          _id: '$loaiNo',
          tongTien: { $sum: '$soTien' },
          soLuong: { $sum: 1 }
        }
      },
      { 
        $project: {
          _id: 0,
          loaiNo: '$_id',
          tongTien: 1,
          soLuong: 1
        }
      }
    ]);

    // Get total
    const tongCongNo = await CongNo.aggregate([
      {
        $group: {
          _id: '$loaiNo',
          tongTien: { $sum: '$soTien' },
          soLuong: { $sum: 1 }
        }
      },
      { 
        $project: {
          _id: 0,
          loaiNo: '$_id',
          tongTien: 1,
          soLuong: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        thongKeTheoLoaiVaTrangThai,
        noQuaHan,
        tongCongNo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};