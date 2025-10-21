const express = require('express');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../utils/helpers');

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50, includeInactive = false } = req.query;
    
    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      includeProductCount: true
    };
    
    if (search) {
      options.search = search;
    }
    
    if (!includeInactive) {
      options.is_active = true;
    }
    
    const categories = await Category.findAll(options);

    res.status(200).json({
      success: true,
      count: categories.length,
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
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
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

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;

    // Upload image if provided
    let imageData = {};
    if (req.file) {
      imageData = await uploadToCloudinary(req.file.path, 'categories');
    }

    const category = await Category.create({
      name,
      description,
      sortOrder: sortOrder || 0,
      image: imageData
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? 'Category name already exists' : 'Server error creating category'
    });
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { name, description, sortOrder, isActive } = req.body;
    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive })
    };

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (category.image?.public_id) {
        await deleteFromCloudinary(category.image.public_id);
      }
      
      updateData.image = await uploadToCloudinary(req.file.path, 'categories');
    }

    category = await Category.updateById(req.params.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('already exists') ? 'Category name already exists' : 'Server error updating category'
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Delete image if exists
    if (category.image?.public_id) {
      await deleteFromCloudinary(category.image.public_id);
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

module.exports = router;