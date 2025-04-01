const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const HoaDonSchema = new mongoose.Schema(
  {
    maHoaDon: {
      type: String,
      required: [true, 'Vui lòng nhập mã hóa đơn'],
      unique: true,
      trim: true
    },
    ngayLap: {
      type: Date,
      required: [true, 'Vui lòng nhập ngày lập'],
      default: Date.now
    },
    loaiHoaDon: {
      type: String,
      enum: ['ban_hang', 'dich_vu', 'khac'],
      default: 'ban_hang'
    },
    khachHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KhachHang',
      required: [true, 'Vui lòng chọn khách hàng']
    },
    danhSachSanPham: [{
      tenSanPham: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm']
      },
      donViTinh: {
        type: String
      },
      soLuong: {
        type: Number,
        required: [true, 'Vui lòng nhập số lượng'],
        min: [1, 'Số lượng phải lớn hơn 0']
      },
      donGia: {
        type: Number,
        required: [true, 'Vui lòng nhập đơn giá'],
        min: [0, 'Đơn giá không thể âm']
      },
      thanhTien: {
        type: Number
      }
    }],
    tongTienHang: {
      type: Number,
      default: 0
    },
    thueVAT: {
      type: Number,
      default: 0
    },
    phanTramChietKhau: {
      type: Number,
      default: 0
    },
    tienChietKhau: {
      type: Number,
      default: 0
    },
    tongTien: {
      type: Number,
      default: 0
    },
    ghiChu: {
      type: String
    },
    trangThai: {
      type: String,
      enum: ['nhap', 'da_phat_hanh', 'da_thanh_toan', 'da_huy'],
      default: 'nhap'
    },
    congNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CongNo'
    },
    nguoiTao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to calculate totals
HoaDonSchema.pre('save', function(next) {
  // Calculate item totals
  this.danhSachSanPham.forEach(item => {
    item.thanhTien = item.soLuong * item.donGia;
  });
  
  // Calculate invoice total
  this.tongTienHang = this.danhSachSanPham.reduce((total, item) => total + item.thanhTien, 0);
  
  // Calculate discount amount
  this.tienChietKhau = (this.tongTienHang * this.phanTramChietKhau) / 100;
  
  // Calculate total with tax and discount
  this.tongTien = this.tongTienHang + this.thueVAT - this.tienChietKhau;
  
  next();
});

// Add pagination plugin
HoaDonSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('HoaDon', HoaDonSchema);