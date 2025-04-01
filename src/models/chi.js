const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ChiSchema = new mongoose.Schema(
  {
    ngayChi: {
      type: Date,
      required: [true, 'Vui lòng nhập ngày chi']
    },
    soTien: {
      type: Number,
      required: [true, 'Vui lòng nhập số tiền']
    },
    loaiChi: {
      type: String,
      enum: ['chi_phi_nvl', 'chi_phi_nhan_cong', 'chi_phi_van_hanh', 'chi_phi_khac'],
      required: [true, 'Vui lòng chọn loại chi']
    },
    moTa: {
      type: String
    },
    nguoiNhan: {
      type: String
    },
    phuongThucThanhToan: {
      type: String,
      enum: ['tien_mat', 'chuyen_khoan', 'the', 'khac'],
      default: 'tien_mat'
    },
    nhaCungCap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhaCungCap'
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

// Add pagination plugin
ChiSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Chi', ChiSchema);