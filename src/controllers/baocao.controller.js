const Thu = require('../models/thu.model');
const Chi = require('../models/chi.model');
const CongNo = require('../models/congno.model');
const HoaDon = require('../models/hoadon.model');
const KhachHang = require('../models/khachhang.model');
const mongoose = require('mongoose');

// @desc    Get báo cáo thu chi tổng hợp
// @route   GET /api/baocao/thuchi
// @access  Private
exports.getBaoCaoThuChi = async (req, res) => {
  try {
    const { tuNgay, denNgay } = req.query;
    
    const matchStage = {};
    
    // Filter by date range
    if (tuNgay && denNgay) {
      matchStage.createdAt = {
        $gte: new Date(tuNgay),
        $lte: new Date(denNgay)
      };
    } else if (tuNgay) {
      matchStage.createdAt = { $gte: new Date(tuNgay) };
    } else if (denNgay) {
      matchStage.createdAt = { $lte: new Date(denNgay) };
    }

    // Get thu statistics by month
    const thuTheoThang = await Thu.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$ngayThu' },
            month: { $month: '$ngayThu' }
          },
          tongTien: { $sum: '$soTien' }
        }
      },
      { 
        $project: {
          _id: 0,
          nam: '$_id.year',
          thang: '$_id.month',
          tongTien: 1,
          loai: 'thu'
        }
      },
      { $sort: { nam: 1, thang: 1 } }
    ]);

    // Get chi statistics by month
    const chiTheoThang = await Chi.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$ngayChi' },
            month: { $month: '$ngayChi' }
          },
          tongTien: { $sum: '$soTien' }
        }
      },
      { 
        $project: {
          _id: 0,
          nam: '$_id.year',
          thang: '$_id.month',
          tongTien: 1,
          loai: 'chi'
        }
      },
      { $sort: { nam: 1, thang: 1 } }
    ]);

    // Get thu by type
    const thuTheoLoai = await Thu.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: '$loaiThu',
          tongTien: { $sum: '$soTien' }
        }
      },
      { 
        $project: {
          _id: 0,
          loai: '$_id',
          tongTien: 1
        }
      },
      { $sort: { tongTien: -1 } }
    ]);

    // Get chi by type
    const chiTheoLoai = await Chi.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: '$loaiChi',
          tongTien: { $sum: '$soTien' }
        }
      },
      { 
        $project: {
          _id: 0,
          loai: '$_id',
          tongTien: 1
        }
      },
      { $sort: { tongTien: -1 } }
    ]);

    // Get total thu
    const tongThu = await Thu.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          tongTien: { $sum: '$soTien' }
        }
      }
    ]);

    // Get total chi
    const tongChi = await Chi.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          tongTien: { $sum: '$soTien' }
        }
      }
    ]);

    // Calculate balance
    const tongThuValue = tongThu.length > 0 ? tongThu[0].tongTien : 0;
    const tongChiValue = tongChi.length > 0 ? tongChi[0].tongTien : 0;
    const canDoiThuChi = tongThuValue - tongChiValue;

    res.status(200).json({
      status: 'success',
      data: {
        thuTheoThang,
        chiTheoThang,
        thuTheoLoai,
        chiTheoLoai,
        tongThu: tongThuValue,
        tongChi: tongChiValue,
        canDoiThuChi
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get báo cáo công nợ
// @route   GET /api/baocao/congno
// @access  Private
exports.getBaoCaoCongNo = async (req, res) => {
  try {
    // Get congNo statistics
    const thongKeCongNo = await CongNo.aggregate([
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
    const congNoQuaHan = await CongNo.aggregate([
      {
        $match: {
          trangThai: 'qua_han'
        }
      },
      {
        $lookup: {
          from: loaiNo === 'phai_thu' ? 'khachhangs' : 'nhacungcaps',
          localField: loaiNo === 'phai_thu' ? 'khachHang' : 'nhaCungCap',
          foreignField: '_id',
          as: 'doiTac'
        }
      },
      {
        $project: {
          maKhoanNo: 1,
          soTien: 1,
          hanThanhToan: 1,
          tenDoiTac: { $arrayElemAt: ['$doiTac.tenKhachHang', 0] }
        }
      },
      { $sort: { hanThanhToan: 1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        thongKeCongNo,
        congNoQuaHan
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get báo cáo doanh thu
// @route   GET /api/baocao/doanhthu
// @access  Private
exports.getBaoCaoDoanhThu = async (req, res) => {
  try {
    const { tuNgay, denNgay } = req.query;
    
    const matchStage = { trangThai: { $ne: 'da_huy' } };
    
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

    // Get revenue by month
    const doanhThuTheoThang = await HoaDon.aggregate([
      { $match: matchStage },
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

    // Get revenue by invoice type
    const doanhThuTheoLoai = await HoaDon.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: '$loaiHoaDon',
          tongTien: { $sum: '$tongTien' },
          soLuong: { $sum: 1 }
        }
      },
      { 
        $project: {
          _id: 0,
          loaiHoaDon: '$_id',
          tongTien: 1,
          soLuong: 1
        }
      },
      { $sort: { tongTien: -1 } }
    ]);

    // Get top customers
    const khachHangTop = await HoaDon.aggregate([
      { $match: matchStage },
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
      { $match: { tenKhachHang: { $exists: true } } },
      { $sort: { tongTien: -1 } },
      { $limit: 10 }
    ]);

    // Get total revenue
    const tongDoanhThu = await HoaDon.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          tongTien: { $sum: '$tongTien' },
          soLuong: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        doanhThuTheoThang,
        doanhThuTheoLoai,
        khachHangTop,
        tongDoanhThu: tongDoanhThu.length > 0 ? tongDoanhThu[0] : { tongTien: 0, soLuong: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get dashboard overview
// @route   GET /api/baocao/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    // Calculate date range for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get total thu in last 30 days
    const tongThu30Ngay = await Thu.aggregate([
        { 
          $match: { 
            ngayThu: { $gte: startDate, $lte: endDate } 
          } 
        },
        {
          $group: {
            _id: null,
            tongTien: { $sum: '$soTien' }
          }
        }
      ]);
  
      // Get total chi in last 30 days
      const tongChi30Ngay = await Chi.aggregate([
        { 
          $match: { 
            ngayChi: { $gte: startDate, $lte: endDate } 
          } 
        },
        {
          $group: {
            _id: null,
            tongTien: { $sum: '$soTien' }
          }
        }
      ]);
  
      // Get total invoices in last 30 days
      const tongHoaDon30Ngay = await HoaDon.aggregate([
        { 
          $match: { 
            ngayLap: { $gte: startDate, $lte: endDate },
            trangThai: { $ne: 'da_huy' }
          } 
        },
        {
          $group: {
            _id: null,
            tongTien: { $sum: '$tongTien' },
            soLuong: { $sum: 1 }
          }
        }
      ]);
  
      // Get total các khoản nợ quá hạn
      const tongNoQuaHan = await CongNo.aggregate([
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
  
      // Get total Khách hàng
      const tongKhachHang = await KhachHang.countDocuments();
  
      // Get new customers in last 30 days
      const khachHangMoi30Ngay = await KhachHang.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
  
      // Get thu chi theo ngày in last 30 days
      const thuChiTheoNgay = await Promise.all([
        Thu.aggregate([
          { 
            $match: { 
              ngayThu: { $gte: startDate, $lte: endDate } 
            } 
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$ngayThu' } },
              tongTien: { $sum: '$soTien' }
            }
          },
          { 
            $project: {
              _id: 0,
              ngay: '$_id',
              tongTien: 1,
              loai: 'thu'
            }
          },
          { $sort: { ngay: 1 } }
        ]),
        
        Chi.aggregate([
          { 
            $match: { 
              ngayChi: { $gte: startDate, $lte: endDate } 
            } 
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$ngayChi' } },
              tongTien: { $sum: '$soTien' }
            }
          },
          { 
            $project: {
              _id: 0,
              ngay: '$_id',
              tongTien: 1,
              loai: 'chi'
            }
          },
          { $sort: { ngay: 1 } }
        ])
      ]);
  
      res.status(200).json({
        status: 'success',
        data: {
          tongThu30Ngay: tongThu30Ngay.length > 0 ? tongThu30Ngay[0].tongTien : 0,
          tongChi30Ngay: tongChi30Ngay.length > 0 ? tongChi30Ngay[0].tongTien : 0,
          tongHoaDon30Ngay: tongHoaDon30Ngay.length > 0 ? {
            tongTien: tongHoaDon30Ngay[0].tongTien,
            soLuong: tongHoaDon30Ngay[0].soLuong
          } : { tongTien: 0, soLuong: 0 },
          tongNoQuaHan,
          tongKhachHang,
          khachHangMoi30Ngay,
          thuChiTheoNgay: [...thuChiTheoNgay[0], ...thuChiTheoNgay[1]]
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };