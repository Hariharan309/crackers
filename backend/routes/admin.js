const express = require('express');
const multer = require('multer');
const path = require('path');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Get stats from database
    const [orderStats, productStats, categoryStats, userStats] = await Promise.all([
      // Order stats
      db('orders').count('id as count').sum('total_amount as total').first(),
      // Product stats  
      Product.getStats(),
      // Category stats
      Category.getStats(), 
      // User stats
      User.findAll({ where: { role: 'user' }, limit: 1000 })
    ]);

    const stats = {
      total_sales: orderStats.total || 0,
      total_orders: orderStats.count || 0,
      total_customers: userStats.length,
      total_products: productStats.totalProducts,
      sales_change: '+0%',
      orders_change: '+0%', 
      customers_change: '+0%',
      products_change: '+0%'
    };
    
    console.log('Dashboard stats:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting dashboard stats'
    });
  }
});

// @desc    Get recent orders for dashboard
// @route   GET /api/admin/dashboard/recent-orders
// @access  Private/Admin
router.get('/dashboard/recent-orders', protect, authorize('admin'), async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const db = require('../config/database');
    
    // Get recent orders from database
    const orders = await db('orders')
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit));
    
    // Format orders for dashboard
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number || order.orderNumber || `ORDER-${order.id}`,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      totalAmount: order.total_amount,
      orderStatus: order.order_status || 'pending',
      paymentStatus: order.payment_status || 'pending',
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }));
    
    console.log(`Found ${formattedOrders.length} recent orders`);
    
    res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting recent orders'
    });
  }
});

// @desc    Get today's summary for dashboard
// @route   GET /api/admin/dashboard/todays-summary
// @access  Private/Admin
router.get('/dashboard/todays-summary', protect, authorize('admin'), async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Get today's stats
    const [todaysOrders, pendingOrders] = await Promise.all([
      db('orders')
        .whereBetween('created_at', [startOfDay, endOfDay])
        .count('id as count')
        .sum('total_amount as revenue')
        .first(),
      db('orders')
        .where('order_status', 'pending')
        .count('id as count')
        .first()
    ]);
    
    const summary = {
      new_orders: todaysOrders.count || 0,
      revenue: todaysOrders.revenue || 0,
      new_customers: 0, // Can be implemented later
      pending_orders: pendingOrders.count || 0
    };
    
    console.log('Today summary:', summary);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get todays summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting todays summary'
    });
  }
});

// ===============================
// PRODUCTS MANAGEMENT
// ===============================

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
router.get('/products', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, status } = req.query;
    
    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };
    
    // Filter by category
    if (category && category !== 'all') {
      options.category_id = category;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      options.is_active = status === 'active';
    }
    
    // Search functionality
    if (search) {
      options.search = search;
    }

    const products = await Product.findAll(options);

    res.status(200).json({
      success: true,
      count: products.length,
      total: products.length, // For now, just use length
      totalPages: Math.ceil(products.length / parseInt(limit)),
      currentPage: parseInt(page),
      data: products
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting products'
    });
  }
});

// @desc    Get single product for admin
// @route   GET /api/admin/products/:id
// @access  Private/Admin
router.get('/products/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting product'
    });
  }
});

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
router.post('/products', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => ({
        public_id: file.filename,
        url: `/uploads/${file.filename}`
      }));
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.message && error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: 'Product SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating product'
    });
  }
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
router.put('/products/:id', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = { ...req.body };
    
    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        public_id: file.filename,
        url: `/uploads/${file.filename}`
      }));
      
      // If keepExistingImages is true, append new images
      if (req.body.keepExistingImages === 'true') {
        updateData.images = [...(product.images || []), ...newImages];
      } else {
        updateData.images = newImages;
      }
    }

    product = await Product.updateById(req.params.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.message && error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: 'Product SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating product'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
router.delete('/products/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.deleteById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting product'
    });
  }
});

// ===============================
// CATEGORIES MANAGEMENT
// ===============================

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
router.get('/categories', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    
    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      includeProductCount: true
    };
    
    // Filter by status
    if (status && status !== 'all') {
      options.is_active = status === 'active';
    }
    
    // Search functionality
    if (search) {
      options.search = search;
    }

    const categories = await Category.findAll(options);

    res.status(200).json({
      success: true,
      count: categories.length,
      total: categories.length, // For now, just use length
      totalPages: Math.ceil(categories.length / parseInt(limit)),
      currentPage: parseInt(page),
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting categories'
    });
  }
});

// @desc    Get single category
// @route   GET /api/admin/categories/:id
// @access  Private/Admin
router.get('/categories/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting category'
    });
  }
});

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private/Admin
router.post('/categories', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const categoryData = { ...req.body };
    
    // Handle uploaded image
    if (req.file) {
      categoryData.image = {
        public_id: req.file.filename,
        url: `/uploads/${req.file.filename}`
      };
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating category'
    });
  }
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
router.put('/categories/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updateData = { ...req.body };
    
    // Handle new uploaded image
    if (req.file) {
      updateData.image = {
        public_id: req.file.filename,
        url: `/uploads/${req.file.filename}`
      };
    }

    category = await Category.updateById(req.params.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.message && error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating category'
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
router.delete('/categories/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products using Knex.js Product model
    const products = await Product.findAll({ category_id: req.params.id, limit: 1 });
    if (products && products.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has products assigned to it.`
      });
    }

    await Category.deleteById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('Cannot delete category') ? error.message : 'Server error deleting category'
    });
  }
});

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', protect, authorize('admin'), async (req, res) => {
  try {
    console.log('Getting admin orders...');
    const { page = 1, limit = 20, status } = req.query;
    
    // Use direct database queries with Knex
    const db = require('../config/database');
    
    let query = db('orders');
    
    // Apply status filter if provided
    if (status) {
      query = query.where('order_status', status);
    }
    
    // Get total count for pagination
    const totalQuery = query.clone();
    const totalResult = await totalQuery.count('id as count').first();
    const totalOrders = totalResult.count;
    
    // Get paginated orders
    const offset = (page - 1) * limit;
    const orders = await query
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(offset);
    
    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number || order.orderNumber || `ORDER-${order.id}`,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address,
      subtotal: order.subtotal,
      totalAmount: order.total_amount,
      orderStatus: order.order_status || 'pending',
      paymentStatus: order.payment_status || 'pending',
      paymentMethod: order.payment_method || 'upi',
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }));
    
    console.log(`Found ${formattedOrders.length} orders`);

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      total: totalOrders,
      data: formattedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalOrders / limit),
        hasNextPage: offset + formattedOrders.length < totalOrders,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting orders',
      error: error.message
    });
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
router.put('/orders/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order'
    });
  }
});

// ===============================
// COUPONS MANAGEMENT
// ===============================

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
router.get('/coupons', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, type } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
        query.startDate = { $lte: new Date() };
        query.endDate = { $gte: new Date() };
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'expired') {
        query.endDate = { $lt: new Date() };
      }
    }
    
    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Coupon.countDocuments(query);

    res.status(200).json({
      success: true,
      count: coupons.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: coupons
    });

  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting coupons'
    });
  }
});

// @desc    Get single coupon
// @route   GET /api/admin/coupons/:id
// @access  Private/Admin
router.get('/coupons/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('applicableCategories', 'name')
      .populate('applicableProducts', 'name');
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting coupon'
    });
  }
});

// @desc    Create new coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
router.post('/coupons', protect, authorize('admin'), async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user._id
    };

    const coupon = await Coupon.create(couponData);
    await coupon.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });

  } catch (error) {
    console.error('Create coupon error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating coupon'
    });
  }
});

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
router.put('/coupons/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });

  } catch (error) {
    console.error('Update coupon error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating coupon'
    });
  }
});

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
router.delete('/coupons/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if coupon has been used
    if (coupon.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete coupon. It has been used ${coupon.usedCount} times.`
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting coupon'
    });
  }
});

// ===============================
// SITE SETTINGS MANAGEMENT
// ===============================

// @desc    Get all site settings
// @route   GET /api/admin/settings
// @access  Private/Admin
router.get('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const settings = await Settings.find(query).sort('category key');
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedSettings
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting settings'
    });
  }
});

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
router.put('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const updates = req.body;
    const updatedSettings = [];
    
    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      const setting = await Settings.setSetting(key, value);
      updatedSettings.push(setting);
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating settings'
    });
  }
});

// @desc    Get specific setting by key
// @route   GET /api/admin/settings/:key
// @access  Private/Admin
router.get('/settings/:key', protect, authorize('admin'), async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.status(200).json({
      success: true,
      data: setting
    });

  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting setting'
    });
  }
});

// ===============================
// POS SYSTEM
// ===============================

// @desc    Create POS order
// @route   POST /api/admin/pos/order
// @access  Private/Admin
router.post('/pos/order', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      items,
      subtotal,
      discount_amount,
      total_amount,
      payment_method,
      cash_received,
      change_amount
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
    }

    // Fetch product details and validate stock
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product_id}`
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
        });
      }

      // Create order item with product details
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price, // Use actual product price from database
        quantity: item.quantity,
        image: product.images && product.images[0] ? product.images[0].url : ''
      });
    }

    // Create order
    const orderData = {
      user: null, // POS orders don't have user accounts
      customerName: customer_name || 'Walk-in Customer',
      customerPhone: customer_phone || '',
      customerEmail: customer_email || '',
      customerAddress: customer_address || '',
      items: orderItems,
      subtotal: subtotal,
      discountAmount: discount_amount || 0,
      totalAmount: total_amount,
      paymentMethod: payment_method || 'cash',
      paymentStatus: 'paid',
      orderStatus: 'completed',
      orderType: 'pos',
      cashReceived: cash_received || 0,
      changeAmount: change_amount || 0,
      createdBy: req.user._id
    };

    const order = await Order.create(orderData);

    // Update product stock and sales
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product_id,
        {
          $inc: {
            stock: -item.quantity,
            sales: item.quantity
          }
        }
      );
    }

    // Populate the order with product details
    await order.populate('items.product', 'name sku category');
    await order.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'POS order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create POS order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating POS order',
      error: error.message
    });
  }
});

// ===============================
// REPORTS AND ANALYTICS
// ===============================

// @desc    Get sales analytics
// @route   GET /api/admin/reports/analytics
// @access  Private/Admin
router.get('/reports/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Current period stats
    const currentStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Previous period stats for comparison
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2));
    previousStartDate.setDate(previousStartDate.getDate() + days);

    const previousStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStartDate, $lt: startDate },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Calculate growth percentages
    const current = currentStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const previous = previousStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    const revenueGrowth = previous.totalRevenue > 0 
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 
      : 0;
      
    const ordersGrowth = previous.totalOrders > 0 
      ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100 
      : 0;
      
    const aovGrowth = previous.avgOrderValue > 0 
      ? ((current.avgOrderValue - previous.avgOrderValue) / previous.avgOrderValue) * 100 
      : 0;

    // Get customer count
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const newCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startDate }
    });
    
    const previousCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    
    const customersGrowth = previousCustomers > 0 
      ? ((newCustomers - previousCustomers) / previousCustomers) * 100 
      : 0;

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          sales: '$totalSales',
          revenue: '$totalRevenue',
          quantity_sold: '$totalSales'
        }
      }
    ]);

    // Recent orders
    const recentOrders = await Order.find({
      createdAt: { $gte: startDate }
    })
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(10)
      .select('_id customerName totalAmount orderStatus paymentStatus createdAt');

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          total_revenue: current.totalRevenue,
          total_orders: current.totalOrders,
          total_customers: totalCustomers,
          avg_order_value: current.avgOrderValue,
          revenue_growth: revenueGrowth,
          orders_growth: ordersGrowth,
          customers_growth: customersGrowth,
          aov_growth: aovGrowth
        },
        topProducts,
        recentOrders
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting analytics'
    });
  }
});

// @desc    Get sales chart data
// @route   GET /api/admin/reports/sales-chart
// @access  Private/Admin
router.get('/reports/sales-chart', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          orders: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: salesData
    });

  } catch (error) {
    console.error('Get sales chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting sales chart data'
    });
  }
});

module.exports = router;
