const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
router.post('/', async (req, res) => {
  try {
    console.log('=== ORDER CREATION REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      customerInfo,
      items,
      subtotal,
      totalAmount,
      paymentMethod = 'upi',
      orderType = 'online'
    } = req.body;

    // Validate customer info
    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      console.log('❌ Customer validation failed');
      return res.status(400).json({
        success: false,
        message: 'Customer name, email, and phone are required'
      });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Items validation failed');
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Validate totals
    if (!subtotal || !totalAmount) {
      console.log('❌ Amounts validation failed');
      return res.status(400).json({
        success: false,
        message: 'Subtotal and total amount are required'
      });
    }

    console.log('✅ Validation passed');

    // Process order items and update stock
    const orderItems = [];
    for (const item of items) {
      const productId = item.product || item.product_id || item.id;
      console.log('Looking for product with ID:', productId);
      
      const product = await Product.findById(productId);
      
      if (!product) {
        console.log('❌ Product not found:', productId);
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.name || productId}`
        });
      }

      if (!product.isActive && !product.is_active) {
        console.log('❌ Product inactive:', product.name);
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }

      if (product.stock < item.quantity) {
        console.log('❌ Insufficient stock:', product.name, product.stock, '<', item.quantity);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      // Add to order items
      orderItems.push({
        product_id: product.id,
        name: product.name,
        price: item.price || product.discount_price || product.price,
        quantity: item.quantity,
        image: item.image || ''
      });

      // Update stock
      const currentStock = product.stock_quantity || product.stock || 0;
      const currentSales = product.sales || 0;
      
      await Product.updateById(product.id, {
        stock: currentStock - item.quantity,
        sales: currentSales + item.quantity
      });

      console.log('✅ Updated stock for:', product.name, 'from', currentStock, 'to', currentStock - item.quantity);
    }

    // Create order
    console.log('Creating order...');
    const orderData = {
      customerInfo,
      items: orderItems,
      subtotal: parseFloat(subtotal),
      totalAmount: parseFloat(totalAmount)
    };

    const order = await Order.create(orderData);
    console.log('✅ Order created successfully:', order.orderNumber);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order',
      error: error.message
    });
  }
});

module.exports = router;