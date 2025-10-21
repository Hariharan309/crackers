const db = require('../config/database');

class Product {
  static tableName = 'products';
  static imagesTableName = 'product_images';

  // Create a new product
  static async create(productData) {
    const trx = await db.transaction();
    
    try {
      // Validate required fields
      if (!productData.name) throw new Error('Please provide product name');
      if (!productData.description) throw new Error('Please provide product description');
      if (!productData.price) throw new Error('Please provide product price');
      if (!productData.category_id) throw new Error('Please provide product category');
      if (!productData.sku) throw new Error('Please provide SKU');
      
      // Validate data
      if (productData.name.length > 100) throw new Error('Product name cannot exceed 100 characters');
      if (productData.description.length > 1000) throw new Error('Description cannot exceed 1000 characters');
      if (productData.price < 0) throw new Error('Price cannot be negative');
      if (productData.discountPrice && productData.discountPrice < 0) throw new Error('Discount price cannot be negative');
      if (productData.discountPrice && productData.discountPrice >= productData.price) {
        throw new Error('Discount price should be less than regular price');
      }
      if (productData.stock < 0) throw new Error('Stock cannot be negative');
      
      // Check if SKU already exists
      const existingSKU = await db(this.tableName).where('sku', productData.sku).first();
      if (existingSKU) throw new Error('SKU already exists');
      
      // Prepare product data
      const productToInsert = {
        name: productData.name.trim(),
        description: productData.description,
        price: productData.price,
        discount_price: productData.discountPrice || productData.discount_price || null,
        category_id: productData.category_id || productData.category,
        stock: productData.stock_quantity || productData.stock || 0,
        sku: productData.sku,
        weight: productData.weight || null,
        unit: productData.unit || 'piece',
        is_active: productData.isActive !== undefined ? productData.isActive : true,
        is_featured: productData.isFeatured !== undefined ? productData.isFeatured : false,
        tags: productData.tags ? JSON.stringify(productData.tags) : null,
        ratings_average: productData.ratings?.average || 0,
        ratings_count: productData.ratings?.count || 0,
        views: productData.views || 0,
        sales: productData.sales || 0,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const [productId] = await trx(this.tableName).insert(productToInsert);
      
      // Insert product images if provided
      if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
        const imageData = productData.images.map(image => ({
          product_id: productId,
          public_id: image.public_id,
          url: image.url,
          created_at: new Date(),
          updated_at: new Date()
        }));
        
        await trx(this.imagesTableName).insert(imageData);
      }
      
      await trx.commit();
      
      return await this.findById(productId);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Find product by ID
  static async findById(id) {
    const product = await db(this.tableName)
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .select(
        'products.*',
        'categories.name as category_name'
      )
      .where('products.id', id)
      .first();
    
    if (!product) return null;
    
    const images = await db(this.imagesTableName).where('product_id', id);
    
    return this.formatProduct(product, images);
  }

  // Find all products with filtering and pagination
  static async findAll(options = {}) {
    let query = db(this.tableName)
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .select(
        'products.*',
        'categories.name as category_name'
      );
    
    // Apply filters
    if (options.where) {
      query = query.where(options.where);
    }
    
    if (options.category_id) {
      query = query.where('products.category_id', options.category_id);
    }
    
    if (options.is_active !== undefined) {
      query = query.where('products.is_active', options.is_active);
    }
    
    if (options.is_featured !== undefined) {
      query = query.where('products.is_featured', options.is_featured);
    }
    
    if (options.search) {
      query = query.where(function() {
        this.where('products.name', 'like', `%${options.search}%`)
          .orWhere('products.description', 'like', `%${options.search}%`)
          .orWhere('products.sku', 'like', `%${options.search}%`);
      });
    }
    
    if (options.minPrice) {
      query = query.where('products.price', '>=', options.minPrice);
    }
    
    if (options.maxPrice) {
      query = query.where('products.price', '<=', options.maxPrice);
    }
    
    // Add sorting
    if (options.sortBy) {
      const sortOrder = options.sortOrder || 'asc';
      // Convert camelCase to snake_case for database columns
      const dbColumnName = options.sortBy === 'createdAt' ? 'created_at' :
                          options.sortBy === 'updatedAt' ? 'updated_at' :
                          options.sortBy === 'stockQuantity' ? 'stock' :
                          options.sortBy === 'discountPrice' ? 'discount_price' :
                          options.sortBy === 'categoryId' ? 'category_id' :
                          options.sortBy === 'isActive' ? 'is_active' :
                          options.sortBy === 'isFeatured' ? 'is_featured' :
                          options.sortBy === 'ratingAverage' ? 'ratings_average' :
                          options.sortBy === 'ratingCount' ? 'ratings_count' :
                          options.sortBy;
      query = query.orderBy(`products.${dbColumnName}`, sortOrder);
    } else {
      query = query.orderBy('products.created_at', 'desc');
    }
    
    // Add pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    const products = await query;
    
    // Get images for all products
    const productIds = products.map(product => product.id);
    let allImages = [];
    if (productIds.length > 0) {
      allImages = await db(this.imagesTableName).whereIn('product_id', productIds);
    }
    
    // Group images by product
    const imagesByProduct = {};
    allImages.forEach(image => {
      if (!imagesByProduct[image.product_id]) {
        imagesByProduct[image.product_id] = [];
      }
      imagesByProduct[image.product_id].push(image);
    });
    
    return products.map(product => this.formatProduct(product, imagesByProduct[product.id] || []));
  }

  // Update product
  static async updateById(id, updateData) {
    const trx = await db.transaction();
    
    try {
      // Validate data if provided
      if (updateData.name && updateData.name.length > 100) {
        throw new Error('Product name cannot exceed 100 characters');
      }
      if (updateData.description && updateData.description.length > 1000) {
        throw new Error('Description cannot exceed 1000 characters');
      }
      if (updateData.price !== undefined && updateData.price < 0) {
        throw new Error('Price cannot be negative');
      }
      if (updateData.discountPrice !== undefined && updateData.discountPrice < 0) {
        throw new Error('Discount price cannot be negative');
      }
      if (updateData.stock !== undefined && updateData.stock < 0) {
        throw new Error('Stock cannot be negative');
      }
      
      // Check SKU uniqueness if updating SKU
      if (updateData.sku) {
        const existingSKU = await db(this.tableName)
          .where('sku', updateData.sku)
          .where('id', '!=', id)
          .first();
        if (existingSKU) throw new Error('SKU already exists');
      }
      
      // Prepare update data
      const dbUpdateData = {
        updated_at: new Date()
      };
      
      // Map fields
      if (updateData.name !== undefined) dbUpdateData.name = updateData.name.trim();
      if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
      if (updateData.price !== undefined) dbUpdateData.price = updateData.price;
      if (updateData.discountPrice !== undefined) dbUpdateData.discount_price = updateData.discountPrice;
      if (updateData.category_id !== undefined) dbUpdateData.category_id = updateData.category_id;
      if (updateData.stock !== undefined) dbUpdateData.stock = updateData.stock;
      if (updateData.stock_quantity !== undefined) dbUpdateData.stock = updateData.stock_quantity;
      if (updateData.sku !== undefined) dbUpdateData.sku = updateData.sku;
      if (updateData.weight !== undefined) dbUpdateData.weight = updateData.weight;
      if (updateData.unit !== undefined) dbUpdateData.unit = updateData.unit;
      if (updateData.isActive !== undefined) dbUpdateData.is_active = updateData.isActive;
      if (updateData.isFeatured !== undefined) dbUpdateData.is_featured = updateData.isFeatured;
      if (updateData.tags !== undefined) dbUpdateData.tags = JSON.stringify(updateData.tags);
      if (updateData.views !== undefined) dbUpdateData.views = updateData.views;
      if (updateData.sales !== undefined) dbUpdateData.sales = updateData.sales;
      
      // Update product
      await trx(this.tableName).where('id', id).update(dbUpdateData);
      
      // Update images if provided
      if (updateData.images && Array.isArray(updateData.images)) {
        // Delete existing images
        await trx(this.imagesTableName).where('product_id', id).del();
        
        // Insert new images
        if (updateData.images.length > 0) {
          const imageData = updateData.images.map(image => ({
            product_id: id,
            public_id: image.public_id,
            url: image.url,
            created_at: new Date(),
            updated_at: new Date()
          }));
          
          await trx(this.imagesTableName).insert(imageData);
        }
      }
      
      await trx.commit();
      
      return await this.findById(id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Delete product
  static async deleteById(id) {
    const trx = await db.transaction();
    
    try {
      // Delete product images first
      await trx(this.imagesTableName).where('product_id', id).del();
      
      // Delete product
      const result = await trx(this.tableName).where('id', id).del();
      
      await trx.commit();
      
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Update stock quantity
  static async updateStock(id, quantity, operation = 'subtract') {
    const product = await db(this.tableName).where('id', id).first();
    if (!product) throw new Error('Product not found');
    
    let newStock;
    if (operation === 'subtract') {
      newStock = product.stock - quantity;
      if (newStock < 0) throw new Error('Insufficient stock');
    } else if (operation === 'add') {
      newStock = product.stock + quantity;
    } else {
      throw new Error('Invalid operation. Use "add" or "subtract"');
    }
    
    await db(this.tableName)
      .where('id', id)
      .update({
        stock: newStock,
        updated_at: new Date()
      });
    
    return await this.findById(id);
  }

  // Get product statistics
  static async getStats() {
    const [totalProducts, activeProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
      db(this.tableName).count('id as count').first(),
      db(this.tableName).where('is_active', true).count('id as count').first(),
      db(this.tableName).where('stock', '>', 0).where('stock', '<=', 5).count('id as count').first(),
      db(this.tableName).where('stock', 0).count('id as count').first()
    ]);
    
    return {
      totalProducts: totalProducts.count,
      activeProducts: activeProducts.count,
      lowStockProducts: lowStockProducts.count,
      outOfStockProducts: outOfStockProducts.count
    };
  }

  // Format product data
  static formatProduct(product, images = []) {
    if (!product) return null;
    
    // Calculate virtual properties
    const sellingPrice = product.discount_price || product.price;
    const discountPercentage = product.discount_price 
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0;
    
    let stockStatus = 'in-stock';
    if (product.stock === 0) stockStatus = 'out-of-stock';
    else if (product.stock <= 5) stockStatus = 'low-stock';
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discount_price,
      category_id: product.category_id,
      category_name: product.category_name,
      images: images.map(img => ({
        id: img.id,
        public_id: img.public_id,
        url: img.url
      })),
      stock_quantity: product.stock,
      stock: product.stock,
      sku: product.sku,
      weight: product.weight,
      unit: product.unit,
      isActive: Boolean(product.is_active),
      is_active: Boolean(product.is_active),
      isFeatured: Boolean(product.is_featured),
      tags: product.tags ? JSON.parse(product.tags) : [],
      ratings: {
        average: product.ratings_average,
        count: product.ratings_count
      },
      views: product.views,
      sales: product.sales,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      // Virtual properties
      sellingPrice,
      discountPercentage,
      stockStatus
    };
  }
}

module.exports = Product;
