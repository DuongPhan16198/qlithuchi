const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Static folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Define routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/thu', require('./routes/thu.routes'));
app.use('/api/chi', require('./routes/chi.routes'));
app.use('/api/khachhang', require('./routes/khachhang.routes'));
app.use('/api/nhacungcap', require('./routes/nhacungcap.routes'));
app.use('/api/congno', require('./routes/congno.routes'));
app.use('/api/hoadon', require('./routes/hoadon.routes'));
app.use('/api/baocao', require('./routes/baocao.routes'));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});