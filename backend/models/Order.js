const db = require('../config/database');

class Order {
  static tableName = 'orders';
  static itemsTableName = 'order_items';

  // Generate order number
  static async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Count orders created today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const todayOrdersCount = await db(this.tableName)
      .whereBetween('created_at', [startOfDay, endOfDay])
      .count('id as count')
      .first();
    
    const orderSequence = (todayOrdersCount.count + 1).toString().padStart(3, '0');
    return `CS${year}${month}${day}${orderSequence}`;
  }

  // Create a new order
  static async create(orderData) {
    const trx = await db.transaction();
    
    try {
      // Validate required fields
      if (!orderData.subtotal) throw new Error('Subtotal is required');
      if (!orderData.totalAmount) throw new Error('Total amount is required');
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Order items are required');
      }
      
      // Generate order number
      const orderNumber = await this.generateOrderNumber();
      
      // Prepare order data - simplified to match actual database schema
      const customerInfo = orderData.customerInfo || {};
      const address = customerInfo.address || {};
      
      // Use only the most basic columns that definitely exist
      const orderToInsert = {
        customer_name: customerInfo.name || 'Customer',
        customer_email: customerInfo.email || '',
        customer_phone: customerInfo.phone || '',
        subtotal: orderData.subtotal,
        total_amount: orderData.totalAmount || orderData.total_amount,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Try to add order number if column exists
      try {
        // First attempt with orderNumber
        const testInsert = { ...orderToInsert, orderNumber };
        console.log('Trying with orderNumber column...');
      } catch (e) {
        try {
          // Second attempt with order_number
          const testInsert = { ...orderToInsert, order_number: orderNumber };
          console.log('Trying with order_number column...');
        } catch (e2) {
          console.log('No order number column found, proceeding without it...');
        }
      }
      
      console.log('Basic order data to insert:', orderToInsert);
      
      const [orderId] = await trx(this.tableName).insert(orderToInsert);
      
      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: orderId,
        product_id: item.product_id || item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || null,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      await trx(this.itemsTableName).insert(orderItems);
      
      await trx.commit();
      
      return await this.findById(orderId);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Find order by ID
  static async findById(id) {
    const order = await db(this.tableName).where('id', id).first();
    if (!order) return null;
    
    const items = await db(this.itemsTableName).where('order_id', id);
    
    return this.formatOrder(order, items);
  }

  // Find order by order number
  static async findByOrderNumber(orderNumber) {
    const order = await db(this.tableName).where('orderNumber', orderNumber).first();
    if (!order) return null;
    
    const items = await db(this.itemsTableName).where('order_id', order.id);
    
    return this.formatOrder(order, items);
  }

  // Get all orders with pagination
  static async findAll(options = {}) {
    let query = db(this.tableName);
    
    // Apply filters
    if (options.where) {
      query = query.where(options.where);
    }
    
    if (options.orderStatus) {
      query = query.where('order_status', options.orderStatus);
    }
    
    if (options.paymentStatus) {
      query = query.where('payment_status', options.paymentStatus);
    }
    
    if (options.orderType) {
      query = query.where('order_type', options.orderType);
    }
    
    if (options.search) {
      query = query.where(function() {
        this.where('orderNumber', 'like', `%${options.search}%`)
          .orWhere('customer_name', 'like', `%${options.search}%`)
          .orWhere('customer_phone', 'like', `%${options.search}%`)
          .orWhere('customer_email', 'like', `%${options.search}%`);
      });
    }
    
    // Add pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    // Order by creation date (newest first)
    query = query.orderBy('created_at', 'desc');
    
    const orders = await query;
    
    // Get items for all orders
    const orderIds = orders.map(order => order.id);
    let allItems = [];
    if (orderIds.length > 0) {
      allItems = await db(this.itemsTableName).whereIn('order_id', orderIds);
    }
    
    // Group items by order
    const itemsByOrder = {};
    allItems.forEach(item => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push(item);
    });
    
    return orders.map(order => this.formatOrder(order, itemsByOrder[order.id] || []));
  }

  // Update order
  static async updateById(id, updateData) {
    // Convert camelCase to snake_case for database fields
    const dbUpdateData = {};
    Object.keys(updateData).forEach(key => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbUpdateData[snakeKey] = updateData[key];
    });
    
    dbUpdateData.updated_at = new Date();
    
    await db(this.tableName).where('id', id).update(dbUpdateData);
    return await this.findById(id);
  }

  // Delete order
  static async deleteById(id) {
    const trx = await db.transaction();
    
    try {
      // Delete order items first
      await trx(this.itemsTableName).where('order_id', id).del();
      
      // Delete order
      const result = await trx(this.tableName).where('id', id).del();
      
      await trx.commit();
      
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Get order statistics
  static async getStats() {
    const [totalOrders, totalRevenue, pendingOrders, completedOrders] = await Promise.all([
      db(this.tableName).count('id as count').first(),
      db(this.tableName).sum('total_amount as total').first(),
      db(this.tableName).where('order_status', 'pending').count('id as count').first(),
      db(this.tableName).where('order_status', 'delivered').count('id as count').first()
    ]);
    
    return {
      totalOrders: totalOrders.count,
      totalRevenue: totalRevenue.total || 0,
      pendingOrders: pendingOrders.count,
      completedOrders: completedOrders.count
    };
  }

  // Mongoose-like find method for compatibility with admin routes
  static find(filter = {}) {
    let query = db(this.tableName);
    
    // Apply filters
    Object.keys(filter).forEach(key => {
      if (key === 'created_at' && typeof filter[key] === 'object') {
        // Handle date range queries
        if (filter[key].$gte) {
          query = query.where('created_at', '>=', filter[key].$gte);
        }
        if (filter[key].$lte) {
          query = query.where('created_at', '<=', filter[key].$lte);
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
        const orders = await query;
        // Get items for all orders
        const orderIds = orders.map(order => order.id);
        let allItems = [];
        if (orderIds.length > 0) {
          allItems = await db(this.itemsTableName).whereIn('order_id', orderIds);
        }
        
        // Group items by order
        const itemsByOrder = {};
        allItems.forEach(item => {
          if (!itemsByOrder[item.order_id]) {
            itemsByOrder[item.order_id] = [];
          }
          itemsByOrder[item.order_id].push(item);
        });
        
        return orders.map(order => this.formatOrder(order, itemsByOrder[order.id] || []));
      }
    };
  }

  // Mongoose-like aggregate method for analytics
  static aggregate(pipeline) {
    // This is a simplified implementation for basic aggregation
    return {
      exec: async () => {
        // Handle basic aggregation operations
        if (pipeline.length > 0 && pipeline[0].$match) {
          const matchStage = pipeline[0].$match;
          let query = db(this.tableName);
          
          // Apply match conditions
          Object.keys(matchStage).forEach(key => {
            if (key === 'created_at' && typeof matchStage[key] === 'object') {
              if (matchStage[key].$gte) {
                query = query.where('created_at', '>=', matchStage[key].$gte);
              }
              if (matchStage[key].$lte) {
                query = query.where('created_at', '<=', matchStage[key].$lte);
              }
            } else {
              query = query.where(key, matchStage[key]);
            }
          });
          
          // For now, return basic stats
          const [count, sum] = await Promise.all([
            query.clone().count('id as count').first(),
            query.clone().sum('total_amount as total').first()
          ]);
          
          return [{
            _id: null,
            totalOrders: count.count,
            totalRevenue: sum.total || 0
          }];
        }
        
        return [];
      }
    };
  }

  // Format order data
  static formatOrder(order, items = []) {
    if (!order) return null;
    
    const itemsCount = items.reduce((total, item) => total + item.quantity, 0);
    
    const orderAge = Math.ceil(
      Math.abs(new Date() - new Date(order.created_at)) / (1000 * 60 * 60 * 24)
    );
    
    return {
      id: order.id,
      orderNumber: order.order_number || order.orderNumber,
      user_id: order.user_id,
      customerInfo: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: {
          full: order.customer_address
        }
      },
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      customerAddress: order.customer_address,
      items: items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal: order.subtotal,
      totalAmount: order.total_amount,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      // Virtual properties
      itemsCount,
      orderAge
    };
  }
}

module.exports = Order;
