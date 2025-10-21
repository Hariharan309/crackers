const db = require('../config/database');

class Category {
  static tableName = 'categories';

  // Generate slug from name
  static generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  // Create a new category
  static async create(categoryData) {
    // Validate required fields
    if (!categoryData.name) throw new Error('Please provide category name');
    if (categoryData.name.length > 50) throw new Error('Category name cannot exceed 50 characters');
    if (categoryData.description && categoryData.description.length > 200) {
      throw new Error('Description cannot exceed 200 characters');
    }
    
    // Check if category name already exists
    const existingCategory = await db(this.tableName)
      .where('name', categoryData.name.trim())
      .first();
    if (existingCategory) throw new Error('Category name already exists');
    
    // Generate slug
    const slug = this.generateSlug(categoryData.name.trim());
    
    // Check if slug already exists
    const existingSlug = await db(this.tableName).where('slug', slug).first();
    if (existingSlug) {
      // Add timestamp to make it unique
      const timestamp = Date.now();
      categoryData.slug = `${slug}-${timestamp}`;
    } else {
      categoryData.slug = slug;
    }
    
    // Prepare category data
    const categoryToInsert = {
      name: categoryData.name.trim(),
      description: categoryData.description || null,
      slug: categoryData.slug,
      image_public_id: categoryData.image?.public_id || null,
      image_url: categoryData.image?.url || null,
      is_active: categoryData.isActive !== undefined ? categoryData.isActive : true,
      sort_order: categoryData.sortOrder || 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [categoryId] = await db(this.tableName).insert(categoryToInsert);
    return await this.findById(categoryId);
  }

  // Find category by ID
  static async findById(id) {
    const category = await db(this.tableName).where('id', id).first();
    if (!category) return null;
    
    return this.formatCategory(category);
  }

  // Find category by slug
  static async findBySlug(slug) {
    const category = await db(this.tableName).where('slug', slug).first();
    if (!category) return null;
    
    return this.formatCategory(category);
  }

  // Find all categories
  static async findAll(options = {}) {
    let query = db(this.tableName);
    
    // Apply filters
    if (options.where) {
      query = query.where(options.where);
    }
    
    if (options.is_active !== undefined) {
      query = query.where('is_active', options.is_active);
    }
    
    if (options.search) {
      query = query.where(function() {
        this.where('name', 'like', `%${options.search}%`)
          .orWhere('description', 'like', `%${options.search}%`);
      });
    }
    
    // Add sorting
    if (options.sortBy) {
      const sortOrder = options.sortOrder || 'asc';
      query = query.orderBy(options.sortBy, sortOrder);
    } else {
      query = query.orderBy('sort_order', 'asc').orderBy('name', 'asc');
    }
    
    // Add pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    const categories = await query;
    
    // Get product counts for each category if requested
    if (options.includeProductCount) {
      const categoryIds = categories.map(cat => cat.id);
      const productCounts = await db('products')
        .whereIn('category_id', categoryIds)
        .groupBy('category_id')
        .select('category_id')
        .count('id as count');
      
      const countMap = {};
      productCounts.forEach(item => {
        countMap[item.category_id] = item.count;
      });
      
      return categories.map(category => {
        const formatted = this.formatCategory(category);
        formatted.productCount = countMap[category.id] || 0;
        return formatted;
      });
    }
    
    return categories.map(category => this.formatCategory(category));
  }

  // Update category
  static async updateById(id, updateData) {
    // Validate data if provided
    if (updateData.name && updateData.name.length > 50) {
      throw new Error('Category name cannot exceed 50 characters');
    }
    if (updateData.description && updateData.description.length > 200) {
      throw new Error('Description cannot exceed 200 characters');
    }
    
    // Check name uniqueness if updating name
    if (updateData.name) {
      const existingCategory = await db(this.tableName)
        .where('name', updateData.name.trim())
        .where('id', '!=', id)
        .first();
      if (existingCategory) throw new Error('Category name already exists');
    }
    
    // Prepare update data
    const dbUpdateData = {
      updated_at: new Date()
    };
    
    // Map fields
    if (updateData.name !== undefined) {
      dbUpdateData.name = updateData.name.trim();
      dbUpdateData.slug = this.generateSlug(updateData.name.trim());
    }
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
    if (updateData.image !== undefined) {
      dbUpdateData.image_public_id = updateData.image?.public_id || null;
      dbUpdateData.image_url = updateData.image?.url || null;
    }
    if (updateData.isActive !== undefined) dbUpdateData.is_active = updateData.isActive;
    if (updateData.sortOrder !== undefined) dbUpdateData.sort_order = updateData.sortOrder;
    
    await db(this.tableName).where('id', id).update(dbUpdateData);
    return await this.findById(id);
  }

  // Delete category
  static async deleteById(id) {
    // Check if category has products
    const productCount = await db('products')
      .where('category_id', id)
      .count('id as count')
      .first();
    
    if (productCount.count > 0) {
      throw new Error('Cannot delete category that has products. Please move or delete products first.');
    }
    
    return await db(this.tableName).where('id', id).del();
  }

  // Get category statistics
  static async getStats() {
    const [totalCategories, activeCategories] = await Promise.all([
      db(this.tableName).count('id as count').first(),
      db(this.tableName).where('is_active', true).count('id as count').first()
    ]);
    
    return {
      totalCategories: totalCategories.count,
      activeCategories: activeCategories.count
    };
  }

  // Format category data
  static formatCategory(category) {
    if (!category) return null;
    
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      image: {
        public_id: category.image_public_id,
        url: category.image_url
      },
      isActive: Boolean(category.is_active),
      sortOrder: category.sort_order,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };
  }
}

module.exports = Category;
