const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const KhachHangSchema = new mongoose.Schema(
  {
    maKhachHang: {
      type: String,
      required: [true, 'Vui lòng nhập mã khách hàng'],
      unique: true,
      trim: true
    },
    tenKhachHang: {
      type: String,
      required: [true, 'Vui lòng nhập tên khách hàng'],
      trim: true
    },
    diaChi: {
      type: String,
      trim: true
    },
    soDienThoai: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập email hợp lệ'
      ]
    },
    maSoThue: {
      type: String,
      trim: true
    },
    loaiKhachHang: {
      type: String,
      enum: ['vip', 'thuong_xuyen', 'tiem_nang', 'khong_hoat_dong'],
      default: 'tiem_nang'
    },
    nguoiLienHe: [{
      ten: {
        type: String,
        trim: true
      },
      chucVu: {
        type: String,
        trim: true
      },
      soDienThoai: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    }],
    ghiChu: {
      type: String
    },
    nguoiTao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for hoaDons
KhachHangSchema.virtual('hoaDons', {
  ref: 'HoaDon',
  localField: '_id',
  foreignField: 'khachHang',
  justOne: false
});

// Virtual for total amount spent
KhachHangSchema.virtual('tongTienMua').get(function() {
  return this.hoaDons ? this.hoaDons.reduce((total, hoaDon) => total + hoaDon.tongTien, 0) : 0;
});

// Add pagination plugin
KhachHangSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('KhachHang', KhachHangSchema);