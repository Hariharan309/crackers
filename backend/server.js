const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const db = require('./config/database');
require('dotenv').config();
const path = require('path');


const app = express();

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

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Serve static files from frontend build (if exists)
const frontendBuildPath = path.join(__dirname, '../frontend/build');
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const frontendOutPath = path.join(__dirname, '../frontend/out');

// Check which frontend build directory exists and serve it
const fs = require('fs');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
} else if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
} else if (fs.existsSync(frontendOutPath)) {
  app.use(express.static(frontendOutPath));
}

// Database connection is handled in config/database.js

// Add logging middleware for API routes only
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

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});


// Home page route
app.get('/', (req, res) => {
  console.log('Home page route accessed');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cracker Shop</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <div class="max-w-4xl mx-auto px-4 py-16">
          <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">🎆 Cracker Shop</h1>
            <p class="text-xl text-gray-600 mb-8">Your one-stop shop for festival crackers</p>
            
            <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 class="text-2xl font-semibold mb-6">Welcome to Cracker Shop</h2>
              
              <div class="grid md:grid-cols-2 gap-6 mb-8">
                <div class="text-center p-4 bg-orange-50 rounded-lg">
                  <h3 class="font-semibold text-lg mb-2">🛒 Shop</h3>
                  <p class="text-gray-600">Browse our collection of high-quality crackers</p>
                </div>
                <div class="text-center p-4 bg-red-50 rounded-lg">
                  <h3 class="font-semibold text-lg mb-2">⚡ Admin</h3>
                  <p class="text-gray-600">Manage your store inventory and orders</p>
                </div>
              </div>
              
              <div class="space-y-4">
                <a href="/admin/login" 
                   class="inline-block bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors">
                  Admin Login
                </a>
                <p class="text-sm text-gray-500">For store management and POS system</p>
              </div>
            </div>
            
            <div class="text-center text-gray-500">
              <p>Backend Server Running on Port ${process.env.PORT || 5000}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Serve frontend for all non-API routes (SPA support)
app.get('*', (req, res) => {
  // If it's an API route, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Route not found' });
  }
  
  // Try to serve the frontend index.html from Next.js build directories
  const frontendIndexPaths = [
    path.join(__dirname, '../frontend/.next/server/pages/index.html'),
    path.join(__dirname, '../frontend/build/index.html'),
    path.join(__dirname, '../frontend/dist/index.html'),
    path.join(__dirname, '../frontend/out/index.html')
  ];
  
  for (const indexPath of frontendIndexPaths) {
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // If no frontend build found, redirect to frontend dev server or show message
  if (process.env.NODE_ENV === 'development') {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cracker Shop - Development</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="min-h-screen bg-gray-50 flex items-center justify-center">
          <div class="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 class="text-2xl font-bold text-gray-900 mb-4">🎆 Cracker Shop Backend</h1>
            <p class="text-gray-600 mb-6">Backend API server is running successfully!</p>
            <div class="space-y-4">
              <p class="text-sm text-gray-500">For the full admin experience:</p>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="font-mono text-sm text-gray-700">cd ../frontend</p>
                <p class="font-mono text-sm text-gray-700">npm run dev</p>
              </div>
              <p class="text-xs text-gray-400">Then visit http://localhost:3000/admin</p>
            </div>
            <div class="mt-6 pt-4 border-t border-gray-200">
              <p class="text-xs text-gray-500">API Health: ✅ Running on port ${PORT || 5000}</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cracker Shop</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div id="root">
            <h1>Cracker Shop</h1>
            <p>Backend is running on port ${PORT || 5000}</p>
            <p>Please build your frontend and place it in the build/dist/out directory</p>
          </div>
        </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});