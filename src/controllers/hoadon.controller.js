const HoaDon = require('../models/hoadon.model');
const KhachHang = require('../models/khachhang.model');
const CongNo = require('../models/congno.model');
const Thu = require('../models/thu.model');

// @desc    Get all hóa đơn
// @route   GET /api/hoadon
// @access  Private
exports.getHoaDonList = async (req, res) => {
  try {
    const { 
      tuNgay, 
      denNgay, 
      loaiHoaDon,
      trangThai,
      khachHang,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    // Filter by date range
    if (tuNgay && denNgay) {
      query.ngayLap = {
        $gte: new Date(tuNgay),
        $lte: new Date(denNgay)
      };
    } else if (tuNgay) {
      query.ngayLap = { $gte: new Date(tuNgay) };
    } else if (denNgay) {
      query.ngayLap = { $lte: new Date(denNgay) };
    }
    
    // Filter by loaiHoaDon
    if (loaiHoaDon) {
      query.loaiHoaDon = loaiHoaDon;
    }
    
    // Filter by trangThai
    if (trangThai) {
      query.trangThai = trangThai;
    }
    
    // Filter by khachHang
    if (khachHang) {
      query.khachHang = khachHang;
    }

    // Pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { ngayLap: -1 },
      populate: [
        { path: 'khachHang', select: 'tenKhachHang' },
        { path: 'congNo', select: 'maKhoanNo' },
        { path: 'nguoiTao', select: 'name' }
      ]
    };

    const result = await HoaDon.paginate(query, options);

    res.status(200).json({
      status: 'success',
      data: {
        hoaDon: result.docs,
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

// @desc    Get hóa đơn by ID
// @route   GET /api/hoadon/:id
// @access  Private
exports.getHoaDonById = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id)
      .populate('khachHang', 'tenKhachHang maKhachHang diaChi soDienThoai email maSoThue')
      .populate('congNo', 'maKhoanNo soTien soTienDaThanhToan trangThai')
      .populate('nguoiTao', 'name');

    if (!hoaDon) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hóa đơn'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        hoaDon
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new hóa đơn
// @route   POST /api/hoadon
// @access  Private
exports.createHoaDon = async (req, res) => {
  try {
    // Add current user to request body
    req.body.nguoiTao = req.user.id;
    
    // Generate maHoaDon if not provided
    if (!req.body.maHoaDon) {
      const prefix = 'HD';
      const date = new Date();
      const timestamp = date.getTime().toString().slice(-6);
      req.body.maHoaDon = `${prefix}${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${timestamp}`;
    }

    const hoaDon = await HoaDon.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        hoaDon
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Mã hóa đơn đã tồn tại'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update hóa đơn
// @route   PUT /api/hoadon/:id
// @access  Private
exports.updateHoaDon = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id);

    if (!hoaDon) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hóa đơn'
      });
    }

    // Check if invoice can be updated
    if (hoaDon.trangThai !== 'nhap') {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể cập nhật hóa đơn đã phát hành'
      });
    }

    const updatedHoaDon = await HoaDon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        hoaDon: updatedHoaDon
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete hóa đơn
// @route   DELETE /api/hoadon/:id
// @access  Private
exports.deleteHoaDon = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id);

    if (!hoaDon) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hóa đơn'
      });
    }

    // Check if invoice can be deleted
    if (hoaDon.trangThai !== 'nhap' && hoaDon.trangThai !== 'da_huy') {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa hóa đơn đã phát hành hoặc đã thanh toán'
      });
    }

    // If there's a related công nợ, delete it too
    if (hoaDon.congNo) {
      await CongNo.findByIdAndDelete(hoaDon.congNo);
    }

    await hoaDon.remove();

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

// @desc    Issue invoice
// @route   PUT /api/hoadon/:id/issue
// @access  Private
exports.issueHoaDon = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id);

    if (!hoaDon) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hóa đơn'
      });
    }

    // Check if invoice is in draft state
    if (hoaDon.trangThai !== 'nhap') {
      return res.status(400).json({
        status: 'error',
        message: 'Hóa đơn đã được phát hành hoặc đã hủy'
      });
    }

    // Create công nợ record
    const congNo = await CongNo.create({
      maKhoanNo: `PT${hoaDon.maHoaDon.substring(2)}`,
      loaiNo: 'phai_thu',
      soTien: hoaDon.tongTien,
      ngayTao: hoaDon.ngayLap,
      hanThanhToan: req.body.hanThanhToan || new Date(hoaDon.ngayLap.getTime() + 30 * 24 * 60 * 60 * 1000), // Default: 30 days
      moTa: `Công nợ từ hóa đơn ${hoaDon.maHoaDon}`,
      khachHang: hoaDon.khachHang,
      hoaDon: hoaDon._id,
      nguoiTao: req.user.id
    });

    // Update invoice
    hoaDon.trangThai = 'da_phat_hanh';
    hoaDon.congNo = congNo._id;
    await hoaDon.save();

    res.status(200).json({
      status: 'success',
      data: {
        hoaDon,
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

// @desc    Pay invoice
// @route   PUT /api/hoadon/:id/pay
// @access  Private
exports.payHoaDon = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id)
      .populate('congNo');

    if (!hoaDon) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hóa đơn'
      });
    }

    // Check if invoice is issued
    if (hoaDon.trangThai !== 'da_phat_hanh') {
      return res.status(400).json({
        status: 'error',
        message: 'Hóa đơn chưa được phát hành hoặc đã thanh toán/hủy'
      });
    }

    const { soTien, phuongThucThanhToan, ngayThanhToan, ghiChu } = req.body;

    // If amount not provided, use full amount
    const paymentAmount = soTien || hoaDon.tongTien;

    // Add thu record
    const thu = await Thu.create({
      ngayThu: ngayThanhToan || new Date(),
      soTien: paymentAmount,
      loaiThu: 'doanh_thu_ban_hang',
      moTa: `Thanh toán hóa đơn ${hoaDon.maHoaDon}`,
      nguoiNop: '',
      phuongThucThanhToan: phuongThucThanhToan || 'tien_mat',
      khachHang: hoaDon.khachHang,
      hoaDon: hoaDon._id,
      nguoiTao: req.user.id
    });

    // If congNo exists, add payment to it
    if (hoaDon.congNo) {
      const congNo = await CongNo.findById(hoaDon.congNo);
      
      if (congNo) {
        congNo.lichSuThanhToan.push({
          ngayThanhToan: ngayThanhToan || new Date(),
          soTien: paymentAmount,
          phuongThucThanhToan: phuongThucThanhToan || 'tien_mat',
          ghiChu: ghiChu || `Thanh toán hóa đơn ${hoaDon.maHoaDon}`,
          nguoiTao: req.user.id
        });
        
        await congNo.save();
      }
    }

    // Update invoice status
    hoaDon.trangThai = 'da_thanh_toan';
    await hoaDon.save();

    res.status(200).json({
      status: 'success',
      data: {
        hoaDon,
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

// @desc    Cancel invoice
// @route   PUT /api/hoadon/:id/cancel
// @access  Private
exports.cancelHoaDon = async (req, res) => {
  try {
    const hoaDon = await HoaDon.findById(req.params.id);

    if (!hoaDon) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy hóa đơn'
      });
    }

    // Check if invoice can be canceled
    if (hoaDon.trangThai === 'da_thanh_toan') {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể hủy hóa đơn đã thanh toán'
      });
    }

    if (hoaDon.trangThai === 'da_huy') {
      return res.status(400).json({
        status: 'error',
        message: 'Hóa đơn đã được hủy'
      });
    }

    // If there's công nợ, cancel it too
    if (hoaDon.congNo) {
      await CongNo.findByIdAndUpdate(
        hoaDon.congNo,
        { trangThai: 'da_thanh_toan' },
        { new: true }
      );
    }

    // Update invoice status
    hoaDon.trangThai = 'da_huy';
    await hoaDon.save();

    res.status(200).json({
      status: 'success',
      data: {
        hoaDon
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get hóa đơn statistics
// @route   GET /api/hoadon/statistics
// @access  Private
exports.getHoaDonStatistics = async (req, res) => {
  try {
    const { tuNgay, denNgay } = req.query;
    
    const matchStage = {};
    
    // Filter by date range
    if (tuNgay && denNgay) {
      matchStage.ngayLap = {
        $gte: new Date(tuNgay),
        $lte: new Date(denNgay)
      };
    } else if (tuNgay) {
      matchStage.ngayLap = { $gte: new Date(tuNgay) };
    } else if (denNgay) {
      matchStage.ngayLap = { $lte: new Date(denNgay) };
    }

    // Get total by trangThai
    const thongKeTheoTrangThai = await HoaDon.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: '$trangThai',
          tongTien: { $sum: '$tongTien' },
          soLuong: { $sum: 1 }
        }
      },
      { 
        $project: {
          _id: 0,
          trangThai: '$_id',
          tongTien: 1,
          soLuong: 1
        }
      },
      { $sort: { trangThai: 1 } }
    ]);

    // Get total by month
    const thongKeTheoThang = await HoaDon.aggregate([
      { $match: { ...matchStage, trangThai: { $ne: 'da_huy' } } },
      {
        $group: {
          _id: {
            year: { $year: '$ngayLap' },
            month: { $month: '$ngayLap' }
          },
          tongTien: { $sum: '$tongTien' },
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
    const tongHoaDon = await HoaDon.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          tongTien: { $sum: '$tongTien' },
          soLuong: { $sum: 1 }
        }
      }
    ]);

    // Get total by customer
    const thongKeTheoKhachHang = await HoaDon.aggregate([
      { $match: { ...matchStage, trangThai: { $ne: 'da_huy' } } },
      {
        $group: {
          _id: '$khachHang',
          tongTien: { $sum: '$tongTien' },
          soLuong: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'khachhangs',
          localField: '_id',
          foreignField: '_id',
          as: 'khachHangInfo'
        }
      },
      {
        $project: {
          _id: 0,
          khachHangId: '$_id',
          tenKhachHang: { $arrayElemAt: ['$khachHangInfo.tenKhachHang', 0] },
          tongTien: 1,
          soLuong: 1
        }
      },
      { $sort: { tongTien: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        thongKeTheoTrangThai,
        thongKeTheoThang,
        thongKeTheoKhachHang,
        tongHoaDon: tongHoaDon.length > 0 ? tongHoaDon[0] : { tongTien: 0, soLuong: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};