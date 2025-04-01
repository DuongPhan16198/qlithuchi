// src/seeder/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load models
const User = require('../models/user.model');
const KhachHang = require('../models/khachhang.model');
const NhaCungCap = require('../models/nhacungcap.model');
const Thu = require('../models/thu.model');
const Chi = require('../models/chi.model');
const HoaDon = require('../models/hoadon.model');
const CongNo = require('../models/congno.model');

// Load data
const {
  users,
  khachHangs,
  nhaCungCaps,
  thus,
  chis,
  hoaDons,
  congNos
} = require('./data');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Import data into DB
const importData = async () => {
  try {
    // Xóa dữ liệu cũ
    await User.deleteMany();
    await KhachHang.deleteMany();
    await NhaCungCap.deleteMany();
    await Thu.deleteMany();
    await Chi.deleteMany();
    await HoaDon.deleteMany();
    await CongNo.deleteMany();

    console.log('Data Destroyed...'.red.inverse);
    
    // Import dữ liệu mới
    await User.insertMany(users);
    await KhachHang.insertMany(khachHangs);
    await NhaCungCap.insertMany(nhaCungCaps);
    await Thu.insertMany(thus);
    await Chi.insertMany(chis);
    await HoaDon.insertMany(hoaDons);
    await CongNo.insertMany(congNos);

    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.inverse);
    process.exit(1);
  }
};

// Delete all data from DB
const destroyData = async () => {
  try {
    await User.deleteMany();
    await KhachHang.deleteMany();
    await NhaCungCap.deleteMany();
    await Thu.deleteMany();
    await Chi.deleteMany();
    await HoaDon.deleteMany();
    await CongNo.deleteMany();

    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.inverse);
    process.exit(1);
  }
};

// Thực hiện lệnh dựa vào tham số command line
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}