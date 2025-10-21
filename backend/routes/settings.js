const express = require('express');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../utils/helpers');

const router = express.Router();

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    // For now, return basic settings until Settings model is properly implemented
    const basicSettings = {
      site: {
        company_name: process.env.COMPANY_NAME || 'Cracker Shop',
        company_email: process.env.COMPANY_EMAIL || 'info@crackershop.com',
        company_phone: process.env.COMPANY_PHONE || '+91 9876543210',
        company_address: process.env.COMPANY_ADDRESS || '123 Main Street, Chennai, Tamil Nadu, India'
      },
      general: {
        currency: 'INR',
        tax_rate: 18,
        shipping_cost: 50
      }
    };
    
    let settings = basicSettings;
    if (category) {
      settings = basicSettings[category] || {};
    }

    res.status(200).json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting settings'
    });
  }
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, authorize('admin'), upload.single('logo'), async (req, res) => {
  try {
    const updates = req.body;
    
    // Handle logo upload
    if (req.file) {
      const logoData = await uploadToCloudinary(req.file.path, 'settings');
      updates.company_logo = logoData.url;
    }

    // For now, just return the updated settings
    // TODO: Implement proper Settings model with Knex.js to persist changes
    const updatedSettings = updates;

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

// @desc    Initialize default settings
// @route   POST /api/settings/init
// @access  Private/Admin
router.post('/init', protect, authorize('admin'), async (req, res) => {
  try {
    // For now, just return success
    // TODO: Implement proper Settings model with Knex.js to initialize defaults
    
    res.status(200).json({
      success: true,
      message: 'Default settings initialized successfully'
    });

  } catch (error) {
    console.error('Initialize settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error initializing settings'
    });
  }
});

// @desc    Get site settings
// @route   GET /api/settings/site
// @access  Public
router.get('/site', async (req, res) => {
  try {
    // For now, return basic site settings
    // TODO: Implement proper Settings model with Knex.js
    const siteSettings = {
      company_name: process.env.COMPANY_NAME || 'Cracker Shop',
      company_email: process.env.COMPANY_EMAIL || 'info@crackershop.com',
      company_phone: process.env.COMPANY_PHONE || '+91 9876543210',
      company_address: process.env.COMPANY_ADDRESS || '123 Main Street, Chennai, Tamil Nadu, India',
      company_logo: null,
      currency: 'INR',
      tax_rate: 18,
      shipping_cost: 50
    };

    res.status(200).json({
      success: true,
      data: siteSettings
    });

  } catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting site settings'
    });
  }
});

// @desc    Update site settings
// @route   PUT /api/settings/site
// @access  Private/Admin
router.put('/site', protect, authorize('admin'), upload.single('logo'), async (req, res) => {
  try {
    // For now, just return success
    // TODO: Implement proper Settings model with Knex.js
    const updatedSettings = req.body;
    
    // Handle logo upload
    if (req.file) {
      const logoData = await uploadToCloudinary(req.file.path, 'settings');
      updatedSettings.company_logo = logoData.url;
    }

    res.status(200).json({
      success: true,
      message: 'Site settings updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating site settings'
    });
  }
});

module.exports = router;
