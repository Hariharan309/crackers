const express = require('express');
const Order = require('../models/SimpleOrder');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const Coupon = require('../models/Coupon');
const { protect, optionalAuth } = require('../middleware/auth');
const { generateInvoicePDF } = require('../utils/helpers');

const router = express.Router();

// @desc    Debug - Check products directly from DB
// @route   GET /api/orders/debug-products
// @access  Public
router.get('/debug-products', async (req, res) => {
  try {
    const db = require('../config/database');
    const products = await db('products').select('*').limit(10);
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Debug products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
router.post('/', optionalAuth, async (req, res) => {
  console.log('=== ORDER CREATION REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  try {
    const {
      customerInfo,
      items,
      couponCode,
      paymentMethod,
      orderType = 'online'
    } = req.body;

    // Validate customer info
    console.log('Customer info:', customerInfo);
    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      console.log('❌ Customer validation failed:', customerInfo);
      return res.status(400).json({
        success: false,
        message: 'Customer name, email, and phone are required'
      });
    }

    // Validate items
    console.log('Order items:', items);
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Items validation failed:', items);
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Process order items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Try different possible product ID fields
      const productId = item.product || item.product_id || item.id;
      console.log('Looking for product with ID:', productId, 'from item:', item);
      const product = await Product.findById(productId);
      console.log('Found product:', product ? product.name : 'null');
      
      if (!product) {
        console.log('Product not found:', {
          productId: productId,
          productExists: !!product
        });
        return res.status(400).json({
          success: false,
          message: `Product ${item.name || 'unknown'} not found`
        });
      }
      
      if (!product.isActive && !product.is_active) {
        console.log('Product is inactive:', {
          productId: productId,
          name: product.name,
          isActive: product.isActive,
          is_active: product.is_active
        });
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      // Use the correct field names
      const price = product.discountPrice || product.discount_price || product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product.id,
        name: product.name,
        price: price,
        quantity: item.quantity,
        image: product.images && product.images.length > 0 ? product.images[0].url : ''
      });
      
      console.log('Processing item:', {
        productId: product.id,
        name: product.name,
        price: price,
        quantity: item.quantity,
        currentStock: product.stock,
        newStock: product.stock - item.quantity
      });

      // Update stock using Knex-based update
      const currentStock = product.stock_quantity || product.stock || 0;
      const currentSales = product.sales || 0;
      
      await Product.updateById(product.id, {
        stock: currentStock - item.quantity,
        sales: currentSales + item.quantity
      });
      
      console.log('Updated stock for product:', product.name, 'from', currentStock, 'to', currentStock - item.quantity);
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let discountType = 'fixed';
    
    if (couponCode) {
      const coupon = await Coupon.findByCode(couponCode.toUpperCase());
      
      if (coupon && Coupon.isApplicableForOrder(coupon, subtotal, orderItems)) {
        discountAmount = Coupon.calculateDiscount(coupon, subtotal);
        discountType = coupon.type;
        
        // Update coupon usage using Knex-based update
        await Coupon.incrementUsedCount(coupon.id);
      }
    }

    // Get tax rate from settings
    const taxRate = await Settings.getSetting('tax_rate', 0);
    const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;

    // Calculate shipping
    const freeShippingThreshold = await Settings.getSetting('free_shipping_threshold', 1000);
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : await Settings.getSetting('shipping_cost', 50);

    const totalAmount = subtotal - discountAmount + shippingCost + taxAmount;

    // Create order
    const order = await Order.create({
      user_id: req.user?.id,
      customerInfo,
      items: orderItems,
      subtotal,
      discountAmount,
      discountType,
      couponCode,
      shippingCost,
      taxAmount,
      totalAmount,
      paymentMethod: paymentMethod || 'upi',
      orderType
    });

    console.log('✅ Order created successfully!');
    console.log('Order details:', {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      itemsCount: order.itemsCount
    });
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting orders'
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (req.user.role !== 'admin' && order.user?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting order'
    });
  }
});

// @desc    Download order invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (req.user.role !== 'admin' && order.user?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get company info from settings
    const companyInfo = await Settings.getSettingsByCategory('company');

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(order, companyInfo);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating invoice'
    });
  }
});

module.exports = router;