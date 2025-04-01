const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


const ThuSchema = new mongoose.Schema(
  {
    ngayThu: {
      type: Date,
      required: [true, 'Vui lòng nhập ngày thu']
    },
    soTien: {
      type: Number,
      required: [true, 'Vui lòng nhập số tiền']
    },
    loaiThu: {
      type: String,
      enum: ['doanh_thu_ban_hang', 'doanh_thu_dich_vu', 'thu_no', 'thu_khac'],
      required: [true, 'Vui lòng chọn loại thu']
    },
    moTa: {
      type: String
    },
    nguoiNop: {
      type: String
    },
    phuongThucThanhToan: {
      type: String,
      enum: ['tien_mat', 'chuyen_khoan', 'the', 'khac'],
      default: 'tien_mat'
    },
    khachHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KhachHang'
    },
    hoaDon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HoaDon'
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
ThuSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Thu', ThuSchema);