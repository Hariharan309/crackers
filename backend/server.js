const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
require('./config/database'); // Connects to DB

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API request logger
app.use('/api', (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/pos', require('./routes/pos'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend if built
const frontendDirs = [
  '../frontend/build',
  '../frontend/dist',
  '../frontend/out'
];

for (const dir of frontendDirs) {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    app.use(express.static(fullPath));
    app.get('*', (req, res) => res.sendFile(path.join(fullPath, 'index.html')));
    break;
  }
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
