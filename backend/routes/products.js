const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary, paginate, getPaginationInfo } = require('../utils/helpers');
const knex = require('../config/database');
const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public

router.get('/', async (req, res) => {
  try {
    const products = await knex('products')
      .where('is_active', true)
      .limit(parseInt(req.query.limit || 12))
      .offset(((parseInt(req.query.page || 1) - 1) * parseInt(req.query.limit || 12)))
      .select('*');

    // Get images for each product
    const productIds = products.map(p => p.id);
    const images = await knex('product_images')
      .whereIn('product_id', productIds)
      .select('id', 'product_id', 'url');

    // Attach images to products
    const productsWithImages = products.map(p => ({
      ...p,
      images: images.filter(img => img.product_id === p.id)
    }));

    res.json({ success: true, data: productsWithImages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment views
    await Product.updateById(req.params.id, { views: product.views + 1 });

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

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      stock,
      sku,
      weight,
      unit,
      tags,
      isFeatured
    } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Upload images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageData = await uploadToCloudinary(file.path, 'products');
        images.push(imageData);
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      category_id: category,
      images,
      stock_quantity: stock || 0,
      sku,
      weight,
      unit,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isFeatured: isFeatured === 'true'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? 'SKU already exists' : 'Server error creating product'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      description,
      price,
      discountPrice,
      category,
      stock,
      sku,
      weight,
      unit,
      tags,
      isFeatured,
      isActive,
      removeImages
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice;
    if (category) updateData.category_id = category;
    if (stock !== undefined) updateData.stock_quantity = stock;
    if (sku) updateData.sku = sku;
    if (weight !== undefined) updateData.weight = weight;
    if (unit) updateData.unit = unit;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true';
    if (isActive !== undefined) updateData.isActive = isActive === 'true';

    // Handle images
    let currentImages = product.images || [];
    
    // Handle image removal
    if (removeImages) {
      const imagesToRemove = JSON.parse(removeImages);
      for (const publicId of imagesToRemove) {
        await deleteFromCloudinary(publicId);
        currentImages = currentImages.filter(img => img.public_id !== publicId);
      }
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageData = await uploadToCloudinary(file.path, 'products');
        currentImages.push(imageData);
      }
    }

    updateData.images = currentImages;

    product = await Product.updateById(req.params.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('already exists') ? 'SKU already exists' : 'Server error updating product'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete all images
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        await deleteFromCloudinary(image.public_id);
      }
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

module.exports = router;