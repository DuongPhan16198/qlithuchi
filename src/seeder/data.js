// src/seeder/data.js
const faker = require('faker/locale/vi');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Tạo ID người dùng mẫu
const adminId = new mongoose.Types.ObjectId();
const ketoanId = new mongoose.Types.ObjectId();
const quanlyId = new mongoose.Types.ObjectId();
const nhanvienId = new mongoose.Types.ObjectId();

// Tạo dữ liệu người dùng
const users = [
  {
    _id: adminId,
    name: 'Admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ketoanId,
    name: 'Kế Toán',
    email: 'ketoan@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'ketoan',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: quanlyId,
    name: 'Quản Lý',
    email: 'quanly@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'quanly',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: nhanvienId,
    name: 'Nhân Viên',
    email: 'nhanvien@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'nhanvien',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Tạo dữ liệu khách hàng
const khachHangIds = [];
const khachHangs = [];

for (let i = 0; i < 20; i++) {
  const khachHangId = new mongoose.Types.ObjectId();
  khachHangIds.push(khachHangId);
  
  khachHangs.push({
    _id: khachHangId,
    maKhachHang: `KH${String(i + 1).padStart(3, '0')}`,
    tenKhachHang: faker.company.companyName(),
    diaChi: faker.address.streetAddress(true),
    soDienThoai: faker.phone.phoneNumber('09########'),
    email: faker.internet.email().toLowerCase(),
    maSoThue: faker.datatype.number({ min: 1000000000, max: 9999999999 }).toString(),
    loaiKhachHang: faker.random.arrayElement(['vip', 'thuong_xuyen', 'tiem_nang', 'khong_hoat_dong']),
    nguoiLienHe: [
      {
        ten: faker.name.findName(),
        chucVu: faker.name.jobTitle(),
        soDienThoai: faker.phone.phoneNumber('09########'),
        email: faker.internet.email().toLowerCase()
      }
    ],
    ghiChu: faker.lorem.sentence(),
    nguoiTao: faker.random.arrayElement([adminId, ketoanId, quanlyId, nhanvienId]),
    createdAt: faker.date.past(1),
    updatedAt: faker.date.recent()
  });
}

// Tạo dữ liệu nhà cung cấp
const nhaCungCapIds = [];
const nhaCungCaps = [];

for (let i = 0; i < 10; i++) {
  const nhaCungCapId = new mongoose.Types.ObjectId();
  nhaCungCapIds.push(nhaCungCapId);
  
  nhaCungCaps.push({
    _id: nhaCungCapId,
    maNhaCungCap: `NCC${String(i + 1).padStart(3, '0')}`,
    tenNhaCungCap: faker.company.companyName(),
    diaChi: faker.address.streetAddress(true),
    soDienThoai: faker.phone.phoneNumber('09########'),
    email: faker.internet.email().toLowerCase(),
    maSoThue: faker.datatype.number({ min: 1000000000, max: 9999999999 }).toString(),
    website: faker.internet.url(),
    nguoiLienHe: [
      {
        ten: faker.name.findName(),
        chucVu: faker.name.jobTitle(),
        soDienThoai: faker.phone.phoneNumber('09########'),
        email: faker.internet.email().toLowerCase()
      }
    ],
    ghiChu: faker.lorem.sentence(),
    nguoiTao: faker.random.arrayElement([adminId, ketoanId, quanlyId]),
    createdAt: faker.date.past(1),
    updatedAt: faker.date.recent()
  });
}

// Tạo dữ liệu khoản thu
const thuIds = [];
const thus = [];

for (let i = 0; i < 50; i++) {
  const thuId = new  mongoose.Types.ObjectId();
  thuIds.push(thuId);
  
  const ngayThu = faker.date.between(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
  
  thus.push({
    _id: thuId,
    ngayThu: ngayThu,
    soTien: faker.datatype.number({ min: 1000000, max: 50000000 }),
    loaiThu: faker.random.arrayElement(['doanh_thu_ban_hang', 'doanh_thu_dich_vu', 'thu_no', 'thu_khac']),
    moTa: faker.lorem.sentence(),
    nguoiNop: faker.name.findName(),
    phuongThucThanhToan: faker.random.arrayElement(['tien_mat', 'chuyen_khoan', 'the', 'khac']),
    khachHang: faker.random.arrayElement(khachHangIds),
    nguoiTao: faker.random.arrayElement([adminId, ketoanId, quanlyId]),
    createdAt: ngayThu,
    updatedAt: ngayThu
  });
}

// Tạo dữ liệu khoản chi
const chiIds = [];
const chis = [];

for (let i = 0; i < 30; i++) {
  const chiId = new  mongoose.Types.ObjectId();
  chiIds.push(chiId);
  
  const ngayChi = faker.date.between(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
  
  chis.push({
    _id: chiId,
    ngayChi: ngayChi,
    soTien: faker.datatype.number({ min: 500000, max: 20000000 }),
    loaiChi: faker.random.arrayElement(['chi_phi_nvl', 'chi_phi_nhan_cong', 'chi_phi_van_hanh', 'chi_phi_khac']),
    moTa: faker.lorem.sentence(),
    nguoiNhan: faker.name.findName(),
    phuongThucThanhToan: faker.random.arrayElement(['tien_mat', 'chuyen_khoan', 'the', 'khac']),
    nhaCungCap: faker.random.arrayElement(nhaCungCapIds),
    nguoiTao: faker.random.arrayElement([adminId, ketoanId, quanlyId]),
    createdAt: ngayChi,
    updatedAt: ngayChi
  });
}

// Tạo dữ liệu hóa đơn
const hoaDonIds = [];
const hoaDons = [];
const congNoIds = [];
const congNos = [];

for (let i = 0; i < 40; i++) {
  const hoaDonId = new  mongoose.Types.ObjectId();
  hoaDonIds.push(hoaDonId);
  
  const ngayLap = faker.date.between(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
  
  // Tạo danh sách sản phẩm
  const danhSachSanPham = [];
  const numberOfProducts = faker.datatype.number({ min: 1, max: 5 });
  
  for (let j = 0; j < numberOfProducts; j++) {
    const donGia = faker.datatype.number({ min: 50000, max: 1000000 });
    const soLuong = faker.datatype.number({ min: 1, max: 10 });
    
    danhSachSanPham.push({
      tenSanPham: faker.commerce.productName(),
      donViTinh: faker.random.arrayElement(['Cái', 'Hộp', 'Chai', 'Gói']),
      soLuong: soLuong,
      donGia: donGia,
      thanhTien: soLuong * donGia
    });
  }
  
  // Tính tổng tiền hàng
  const tongTienHang = danhSachSanPham.reduce((sum, item) => sum + item.thanhTien, 0);
  
  // Thuế VAT (10%)
  const thueVAT = Math.round(tongTienHang * 0.1);
  
  // Chiết khấu (0-5%)
  const phanTramChietKhau = faker.datatype.number({ min: 0, max: 5 });
  const tienChietKhau = Math.round((tongTienHang * phanTramChietKhau) / 100);
  
  // Tổng tiền
  const tongTien = tongTienHang + thueVAT - tienChietKhau;
  
  // Trạng thái hóa đơn
  const trangThai = faker.random.arrayElement(['nhap', 'da_phat_hanh', 'da_thanh_toan', 'da_huy']);
  
  // Tạo hóa đơn
  hoaDons.push({
    _id: hoaDonId,
    maHoaDon: `HD${ngayLap.getFullYear()}${String(ngayLap.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(3, '0')}`,
    ngayLap: ngayLap,
    loaiHoaDon: faker.random.arrayElement(['ban_hang', 'dich_vu', 'khac']),
    khachHang: faker.random.arrayElement(khachHangIds),
    danhSachSanPham: danhSachSanPham,
    tongTienHang: tongTienHang,
    thueVAT: thueVAT,
    phanTramChietKhau: phanTramChietKhau,
    tienChietKhau: tienChietKhau,
    tongTien: tongTien,
    ghiChu: faker.lorem.sentence(),
    trangThai: trangThai,
    nguoiTao: faker.random.arrayElement([adminId, ketoanId, quanlyId, nhanvienId]),
    createdAt: ngayLap,
    updatedAt: ngayLap
  });
  
  // Tạo công nợ nếu hóa đơn đã phát hành
  if (trangThai === 'da_phat_hanh' || trangThai === 'da_thanh_toan') {
    const congNoId = new mongoose.Types.ObjectId();
    congNoIds.push(congNoId);
    
    // Ngày tạo công nợ = ngày lập hóa đơn
    const ngayTao = ngayLap;
    
    // Hạn thanh toán = ngày lập + 30 ngày
    const hanThanhToan = new Date(ngayLap);
    hanThanhToan.setDate(hanThanhToan.getDate() + 30);
    
    // Trạng thái công nợ
    let trangThaiCongNo = 'chua_thanh_toan';
    
    if (trangThai === 'da_thanh_toan') {
      trangThaiCongNo = 'da_thanh_toan';
    } else if (hanThanhToan < new Date()) {
      trangThaiCongNo = 'qua_han';
    }
    
    // Lịch sử thanh toán
    const lichSuThanhToan = [];
    
    if (trangThai === 'da_thanh_toan') {
      // Ngày thanh toán = ngày lập + random 1-15 ngày
      const ngayThanhToan = new Date(ngayLap);
      ngayThanhToan.setDate(ngayThanhToan.getDate() + faker.datatype.number({ min: 1, max: 15 }));
      
      lichSuThanhToan.push({
        ngayThanhToan: ngayThanhToan,
        soTien: tongTien,
        phuongThucThanhToan: faker.random.arrayElement(['tien_mat', 'chuyen_khoan', 'the', 'khac']),
        ghiChu: `Thanh toán hóa đơn ${hoaDons[i].maHoaDon}`,
        nguoiTao: faker.random.arrayElement([adminId, ketoanId, quanlyId])
      });
    }
    
    // Cập nhật reference công nợ cho hóa đơn
    hoaDons[i].congNo = congNoId;
    
    // Tạo công nợ
    congNos.push({
      _id: congNoId,
      maKhoanNo: `PT${hoaDons[i].maHoaDon.substring(2)}`,
      loaiNo: 'phai_thu',
      soTien: tongTien,
      ngayTao: ngayTao,
      hanThanhToan: hanThanhToan,
      moTa: `Công nợ từ hóa đơn ${hoaDons[i].maHoaDon}`,
      trangThai: trangThaiCongNo,
      khachHang: hoaDons[i].khachHang,
      hoaDon: hoaDonId,
      lichSuThanhToan: lichSuThanhToan,
      nguoiTao: hoaDons[i].nguoiTao,
      createdAt: ngayTao,
      updatedAt: ngayTao
    });
  }
}

module.exports = {
  users,
  khachHangs,
  nhaCungCaps,
  thus,
  chis,
  hoaDons,
  congNos
};