const db = require('../config/database');

class Coupon {
  static tableName = 'coupons';

  // Create a new coupon
  static async create(couponData) {
    // Validate required fields
    if (!couponData.code) throw new Error('Coupon code is required');
    if (!couponData.name) throw new Error('Coupon name is required');
    if (!couponData.type) throw new Error('Discount type is required');
    if (couponData.value === undefined || couponData.value === null) throw new Error('Discount value is required');
    if (!couponData.startDate) throw new Error('Start date is required');
    if (!couponData.endDate) throw new Error('End date is required');
    if (!couponData.createdBy) throw new Error('Created by user is required');
    
    // Validate data
    if (couponData.code.length > 20) throw new Error('Coupon code cannot exceed 20 characters');
    if (couponData.name.length > 100) throw new Error('Coupon name cannot exceed 100 characters');
    if (couponData.description && couponData.description.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }
    if (!['percentage', 'fixed'].includes(couponData.type)) {
      throw new Error('Discount type must be either percentage or fixed');
    }
    if (couponData.value < 0) throw new Error('Discount value cannot be negative');
    if (couponData.type === 'percentage' && couponData.value > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }
    if (couponData.minimumOrderAmount < 0) throw new Error('Minimum order amount cannot be negative');
    if (couponData.maximumDiscountAmount && couponData.maximumDiscountAmount < 0) {
      throw new Error('Maximum discount amount cannot be negative');
    }
    if (couponData.usageLimit && couponData.usageLimit < 1) {
      throw new Error('Usage limit must be at least 1');
    }
    if (couponData.userUsageLimit && couponData.userUsageLimit < 1) {
      throw new Error('User usage limit must be at least 1');
    }
    if (new Date(couponData.endDate) <= new Date(couponData.startDate)) {
      throw new Error('End date must be after start date');
    }
    
    // Check if coupon code already exists
    const existingCoupon = await db(this.tableName)
      .where('code', couponData.code.toUpperCase().trim())
      .first();
    if (existingCoupon) throw new Error('Coupon code already exists');
    
    // Prepare coupon data
    const couponToInsert = {
      code: couponData.code.toUpperCase().trim(),
      name: couponData.name.trim(),
      description: couponData.description || null,
      type: couponData.type,
      value: couponData.value,
      minimum_order_amount: couponData.minimumOrderAmount || 0,
      maximum_discount_amount: couponData.maximumDiscountAmount || null,
      usage_limit: couponData.usageLimit || null,
      used_count: couponData.usedCount || 0,
      user_usage_limit: couponData.userUsageLimit || 1,
      applicable_categories: couponData.applicableCategories ? JSON.stringify(couponData.applicableCategories) : null,
      applicable_products: couponData.applicableProducts ? JSON.stringify(couponData.applicableProducts) : null,
      exclude_categories: couponData.excludeCategories ? JSON.stringify(couponData.excludeCategories) : null,
      exclude_products: couponData.excludeProducts ? JSON.stringify(couponData.excludeProducts) : null,
      start_date: new Date(couponData.startDate),
      end_date: new Date(couponData.endDate),
      is_active: couponData.isActive !== undefined ? couponData.isActive : true,
      created_by: couponData.createdBy,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [couponId] = await db(this.tableName).insert(couponToInsert);
    return await this.findById(couponId);
  }

  // Find coupon by ID
  static async findById(id) {
    const coupon = await db(this.tableName).where('id', id).first();
    if (!coupon) return null;
    
    return this.formatCoupon(coupon);
  }

  // Find coupon by code
  static async findByCode(code) {
    const coupon = await db(this.tableName)
      .where('code', code.toUpperCase().trim())
      .first();
    if (!coupon) return null;
    
    return this.formatCoupon(coupon);
  }

  // Find all coupons
  static async findAll(options = {}) {
    let query = db(this.tableName);
    
    // Apply filters
    if (options.where) {
      query = query.where(options.where);
    }
    
    if (options.is_active !== undefined) {
      query = query.where('is_active', options.is_active);
    }
    
    if (options.type) {
      query = query.where('type', options.type);
    }
    
    if (options.search) {
      query = query.where(function() {
        this.where('code', 'like', `%${options.search}%`)
          .orWhere('name', 'like', `%${options.search}%`)
          .orWhere('description', 'like', `%${options.search}%`);
      });
    }
    
    // Add sorting
    if (options.sortBy) {
      const sortOrder = options.sortOrder || 'asc';
      query = query.orderBy(options.sortBy, sortOrder);
    } else {
      query = query.orderBy('created_at', 'desc');
    }
    
    // Add pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    const coupons = await query;
    return coupons.map(coupon => this.formatCoupon(coupon));
  }

  // Update coupon
  static async updateById(id, updateData) {
    // Validate data if provided
    if (updateData.code && updateData.code.length > 20) {
      throw new Error('Coupon code cannot exceed 20 characters');
    }
    if (updateData.name && updateData.name.length > 100) {
      throw new Error('Coupon name cannot exceed 100 characters');
    }
    if (updateData.description && updateData.description.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }
    if (updateData.type && !['percentage', 'fixed'].includes(updateData.type)) {
      throw new Error('Discount type must be either percentage or fixed');
    }
    if (updateData.value !== undefined && updateData.value < 0) {
      throw new Error('Discount value cannot be negative');
    }
    
    // Check code uniqueness if updating code
    if (updateData.code) {
      const existingCoupon = await db(this.tableName)
        .where('code', updateData.code.toUpperCase().trim())
        .where('id', '!=', id)
        .first();
      if (existingCoupon) throw new Error('Coupon code already exists');
    }
    
    // Prepare update data
    const dbUpdateData = {
      updated_at: new Date()
    };
    
    // Map fields
    if (updateData.code !== undefined) dbUpdateData.code = updateData.code.toUpperCase().trim();
    if (updateData.name !== undefined) dbUpdateData.name = updateData.name.trim();
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
    if (updateData.type !== undefined) dbUpdateData.type = updateData.type;
    if (updateData.value !== undefined) dbUpdateData.value = updateData.value;
    if (updateData.minimumOrderAmount !== undefined) dbUpdateData.minimum_order_amount = updateData.minimumOrderAmount;
    if (updateData.maximumDiscountAmount !== undefined) dbUpdateData.maximum_discount_amount = updateData.maximumDiscountAmount;
    if (updateData.usageLimit !== undefined) dbUpdateData.usage_limit = updateData.usageLimit;
    if (updateData.usedCount !== undefined) dbUpdateData.used_count = updateData.usedCount;
    if (updateData.userUsageLimit !== undefined) dbUpdateData.user_usage_limit = updateData.userUsageLimit;
    if (updateData.applicableCategories !== undefined) dbUpdateData.applicable_categories = JSON.stringify(updateData.applicableCategories);
    if (updateData.applicableProducts !== undefined) dbUpdateData.applicable_products = JSON.stringify(updateData.applicableProducts);
    if (updateData.excludeCategories !== undefined) dbUpdateData.exclude_categories = JSON.stringify(updateData.excludeCategories);
    if (updateData.excludeProducts !== undefined) dbUpdateData.exclude_products = JSON.stringify(updateData.excludeProducts);
    if (updateData.startDate !== undefined) dbUpdateData.start_date = new Date(updateData.startDate);
    if (updateData.endDate !== undefined) dbUpdateData.end_date = new Date(updateData.endDate);
    if (updateData.isActive !== undefined) dbUpdateData.is_active = updateData.isActive;
    
    await db(this.tableName).where('id', id).update(dbUpdateData);
    return await this.findById(id);
  }

  // Delete coupon
  static async deleteById(id) {
    return await db(this.tableName).where('id', id).del();
  }

  // Increment used count
  static async incrementUsedCount(id) {
    await db(this.tableName)
      .where('id', id)
      .increment('used_count', 1)
      .update('updated_at', new Date());
    
    return await this.findById(id);
  }

  // Check if coupon is applicable for order
  static isApplicableForOrder(coupon, orderAmount, items = []) {
    if (!this.isValid(coupon)) return false;
    
    // Check minimum order amount
    if (orderAmount < coupon.minimumOrderAmount) return false;
    
    // If specific categories or products are defined, check applicability
    if (coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0) {
      const hasApplicableItems = items.some(item => {
        // Check if product is in applicable products
        if (coupon.applicableProducts.length > 0) {
          return coupon.applicableProducts.some(productId => 
            productId.toString() === item.product_id.toString()
          );
        }
        
        // Check if product category is in applicable categories
        if (coupon.applicableCategories.length > 0) {
          return coupon.applicableCategories.some(categoryId => 
            categoryId.toString() === item.category_id?.toString()
          );
        }
        
        return true;
      });
      
      if (!hasApplicableItems) return false;
    }
    
    // Check exclude categories and products
    if (coupon.excludeCategories.length > 0 || coupon.excludeProducts.length > 0) {
      const hasExcludedItems = items.some(item => {
        // Check if product is in excluded products
        if (coupon.excludeProducts.length > 0) {
          return coupon.excludeProducts.some(productId => 
            productId.toString() === item.product_id.toString()
          );
        }
        
        // Check if product category is in excluded categories
        if (coupon.excludeCategories.length > 0) {
          return coupon.excludeCategories.some(categoryId => 
            categoryId.toString() === item.category_id?.toString()
          );
        }
        
        return false;
      });
      
      if (hasExcludedItems) return false;
    }
    
    return true;
  }

  // Calculate discount amount
  static calculateDiscount(coupon, orderAmount) {
    if (coupon.type === 'percentage') {
      const discountAmount = (orderAmount * coupon.value) / 100;
      return coupon.maximumDiscountAmount 
        ? Math.min(discountAmount, coupon.maximumDiscountAmount)
        : discountAmount;
    } else {
      return Math.min(coupon.value, orderAmount);
    }
  }

  // Check if coupon is valid
  static isValid(coupon) {
    const now = new Date();
    return coupon.isActive && 
           now >= new Date(coupon.startDate) && 
           now <= new Date(coupon.endDate) &&
           (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);
  }

  // Get coupon statistics
  static async getStats() {
    const [totalCoupons, activeCoupons, expiredCoupons] = await Promise.all([
      db(this.tableName).count('id as count').first(),
      db(this.tableName).where('is_active', true).count('id as count').first(),
      db(this.tableName).where('end_date', '<', new Date()).count('id as count').first()
    ]);
    
    return {
      totalCoupons: totalCoupons.count,
      activeCoupons: activeCoupons.count,
      expiredCoupons: expiredCoupons.count
    };
  }

  // Format coupon data
  static formatCoupon(coupon) {
    if (!coupon) return null;
    
    // Calculate virtual properties
    const remainingUsage = coupon.usage_limit 
      ? Math.max(0, coupon.usage_limit - coupon.used_count)
      : null;
    
    const isValid = this.isValid(coupon);
    
    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumOrderAmount: coupon.minimum_order_amount,
      maximumDiscountAmount: coupon.maximum_discount_amount,
      usageLimit: coupon.usage_limit,
      usedCount: coupon.used_count,
      userUsageLimit: coupon.user_usage_limit,
      applicableCategories: coupon.applicable_categories ? JSON.parse(coupon.applicable_categories) : [],
      applicableProducts: coupon.applicable_products ? JSON.parse(coupon.applicable_products) : [],
      excludeCategories: coupon.exclude_categories ? JSON.parse(coupon.exclude_categories) : [],
      excludeProducts: coupon.exclude_products ? JSON.parse(coupon.exclude_products) : [],
      startDate: coupon.start_date,
      endDate: coupon.end_date,
      isActive: Boolean(coupon.is_active),
      createdBy: coupon.created_by,
      createdAt: coupon.created_at,
      updatedAt: coupon.updated_at,
      // Virtual properties
      remainingUsage,
      isValid
    };
  }

  // Mongoose-like find method for compatibility with admin routes
  static find(filter = {}) {
    let query = db(this.tableName);
    
    // Apply filters
    Object.keys(filter).forEach(key => {
      if (key === 'start_date' && typeof filter[key] === 'object') {
        // Handle date range queries
        if (filter[key].$gte) {
          query = query.where('start_date', '>=', filter[key].$gte);
        }
        if (filter[key].$lte) {
          query = query.where('start_date', '<=', filter[key].$lte);
        }
      } else if (key === 'end_date' && typeof filter[key] === 'object') {
        if (filter[key].$gte) {
          query = query.where('end_date', '>=', filter[key].$gte);
        }
        if (filter[key].$lte) {
          query = query.where('end_date', '<=', filter[key].$lte);
        }
      } else {
        query = query.where(key, filter[key]);
      }
    });
    
    return {
      sort: (sortBy) => {
        if (typeof sortBy === 'string') {
          const direction = sortBy.startsWith('-') ? 'desc' : 'asc';
          const field = sortBy.replace(/^-/, '');
          query = query.orderBy(field, direction);
        } else if (typeof sortBy === 'object') {
          Object.keys(sortBy).forEach(field => {
            const direction = sortBy[field] === -1 ? 'desc' : 'asc';
            query = query.orderBy(field, direction);
          });
        }
        return this;
      },
      limit: (limitCount) => {
        query = query.limit(limitCount);
        return this;
      },
      exec: async () => {
        const coupons = await query;
        return coupons.map(coupon => this.formatCoupon(coupon));
      }
    };
  }
}

module.exports = Coupon;
