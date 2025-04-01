const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CongNoSchema = new mongoose.Schema(
  {
    maKhoanNo: {
      type: String,
      required: [true, 'Vui lòng nhập mã khoản nợ'],
      unique: true,
      trim: true
    },
    loaiNo: {
      type: String,
      enum: ['phai_thu', 'phai_tra'],
      required: [true, 'Vui lòng chọn loại nợ']
    },
    soTien: {
      type: Number,
      required: [true, 'Vui lòng nhập số tiền']
    },
    ngayTao: {
      type: Date,
      required: [true, 'Vui lòng nhập ngày tạo'],
      default: Date.now
    },
    hanThanhToan: {
      type: Date,
      required: [true, 'Vui lòng nhập hạn thanh toán']
    },
    moTa: {
      type: String
    },
    trangThai: {
      type: String,
      enum: ['chua_thanh_toan', 'da_thanh_toan_mot_phan', 'da_thanh_toan', 'qua_han'],
      default: 'chua_thanh_toan'
    },
    khachHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KhachHang',
      required: function() {
        return this.loaiNo === 'phai_thu';
      }
    },
    nhaCungCap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhaCungCap',
      required: function() {
        return this.loaiNo === 'phai_tra';
      }
    },
    hoaDon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HoaDon'
    },
    lichSuThanhToan: [{
      ngayThanhToan: {
        type: Date,
        default: Date.now
      },
      soTien: {
        type: Number,
        required: true
      },
      phuongThucThanhToan: {
        type: String,
        enum: ['tien_mat', 'chuyen_khoan', 'the', 'khac'],
        default: 'tien_mat'
      },
      ghiChu: String,
      nguoiTao: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
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

// Virtual for số tiền đã thanh toán
CongNoSchema.virtual('soTienDaThanhToan').get(function() {
  return this.lichSuThanhToan.reduce((total, item) => total + item.soTien, 0);
});

// Virtual for số tiền còn lại
CongNoSchema.virtual('soTienConLai').get(function() {
  return this.soTien - this.soTienDaThanhToan;
});

// Add method to update status based on payments
CongNoSchema.methods.updateTrangThai = function() {
  const soTienDaThanhToan = this.lichSuThanhToan.reduce((total, item) => total + item.soTien, 0);
  const soTienConLai = this.soTien - soTienDaThanhToan;
  
  if (soTienConLai <= 0) {
    this.trangThai = 'da_thanh_toan';
  } else if (soTienDaThanhToan > 0) {
    this.trangThai = 'da_thanh_toan_mot_phan';
  } else if (this.hanThanhToan < new Date()) {
    this.trangThai = 'qua_han';
  } else {
    this.trangThai = 'chua_thanh_toan';
  }
  
  return this.save();
};

// Pre-save hook to update status
CongNoSchema.pre('save', function(next) {
  if (this.isModified('lichSuThanhToan') || this.isModified('hanThanhToan') || this.isNew) {
    const soTienDaThanhToan = this.lichSuThanhToan.reduce((total, item) => total + item.soTien, 0);
    const soTienConLai = this.soTien - soTienDaThanhToan;
    
    if (soTienConLai <= 0) {
      this.trangThai = 'da_thanh_toan';
    } else if (soTienDaThanhToan > 0) {
      this.trangThai = 'da_thanh_toan_mot_phan';
    } else if (this.hanThanhToan < new Date()) {
      this.trangThai = 'qua_han';
    } else {
      this.trangThai = 'chua_thanh_toan';
    }
  }
  
  next();
});

// Add pagination plugin
CongNoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CongNo', CongNoSchema);