const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get products for POS
// @route   GET /api/pos/products
// @access  Private/Admin
router.get('/products', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let query = { isActive: true, stock: { $gt: 0 } };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .select('name price discountPrice stock images sku')
      .sort('name');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Get POS products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting products'
    });
  }
});

// @desc    Create POS order
// @route   POST /api/pos/orders
// @access  Private/Admin
router.post('/orders', protect, authorize('admin'), async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      orderType: 'pos',
      paymentStatus: 'paid' // POS orders are immediately paid
    };

    // Create order using the same logic as online orders
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'POS order created successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Create POS order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating POS order'
    });
  }
});

module.exports = router;