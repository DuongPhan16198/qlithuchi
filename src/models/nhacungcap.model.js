const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const NhaCungCapSchema = new mongoose.Schema(
  {
    maNhaCungCap: {
      type: String,
      required: [true, 'Vui lòng nhập mã nhà cung cấp'],
      unique: true,
      trim: true
    },
    tenNhaCungCap: {
      type: String,
      required: [true, 'Vui lòng nhập tên nhà cung cấp'],
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
    website: {
      type: String,
      trim: true
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
    timestamps: true
  }
);

// Add pagination plugin
NhaCungCapSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('NhaCungCap', NhaCungCapSchema);