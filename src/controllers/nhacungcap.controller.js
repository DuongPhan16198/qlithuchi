const NhaCungCap = require('../models/nhacungcap.model');

// @desc    Get all nhà cung cấp
// @route   GET /api/nhacungcap
// @access  Private
exports.getNhaCungCapList = async (req, res) => {
  try {
    const { 
      search, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    // Search by name, code, phone, email
    if (search) {
      query.$or = [
        { maNhaCungCap: { $regex: search, $options: 'i' } },
        { tenNhaCungCap: { $regex: search, $options: 'i' } },
        { soDienThoai: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: { path: 'nguoiTao', select: 'name' }
    };

    const result = await NhaCungCap.paginate(query, options);

    res.status(200).json({
      status: 'success',
      data: {
        nhaCungCap: result.docs,
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

// @desc    Get nhà cung cấp by ID
// @route   GET /api/nhacungcap/:id
// @access  Private
exports.getNhaCungCapById = async (req, res) => {
  try {
    const nhaCungCap = await NhaCungCap.findById(req.params.id)
      .populate('nguoiTao', 'name');

    if (!nhaCungCap) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy nhà cung cấp'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        nhaCungCap
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new nhà cung cấp
// @route   POST /api/nhacungcap
// @access  Private
exports.createNhaCungCap = async (req, res) => {
  try {
    // Add current user to request body
    req.body.nguoiTao = req.user.id;

    const nhaCungCap = await NhaCungCap.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        nhaCungCap
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Mã nhà cung cấp đã tồn tại'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update nhà cung cấp
// @route   PUT /api/nhacungcap/:id
// @access  Private
exports.updateNhaCungCap = async (req, res) => {
  try {
    const nhaCungCap = await NhaCungCap.findById(req.params.id);

    if (!nhaCungCap) {
        return res.status(404).json({
          status: 'error',
          message: 'Không tìm thấy nhà cung cấp'
        });
      }
  
      const updatedNhaCungCap = await NhaCungCap.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
  
      res.status(200).json({
        status: 'success',
        data: {
          nhaCungCap: updatedNhaCungCap
        }
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          status: 'error',
          message: 'Mã nhà cung cấp đã tồn tại'
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };
  
  // @desc    Delete nhà cung cấp
  // @route   DELETE /api/nhacungcap/:id
  // @access  Private
  exports.deleteNhaCungCap = async (req, res) => {
    try {
      const nhaCungCap = await NhaCungCap.findById(req.params.id);
  
      if (!nhaCungCap) {
        return res.status(404).json({
          status: 'error',
          message: 'Không tìm thấy nhà cung cấp'
        });
      }
  
      // Check if supplier has related chi records
      const chiCount = await Chi.countDocuments({ nhaCungCap: req.params.id });
      
      if (chiCount > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Không thể xóa nhà cung cấp này vì đã có khoản chi liên quan'
        });
      }
  
      await nhaCungCap.remove();
  
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