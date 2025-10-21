const db = require('../config/database');

class SimpleOrder {
  static tableName = 'orders';
  static itemsTableName = 'order_items';

  // Generate simple order number
  static generateOrderNumber() {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-8);
    return `ORDER-${timestamp}`;
  }

  // Create a new order with minimal requirements
  static async create(orderData) {
    const trx = await db.transaction();
    
    try {
      console.log('Creating order with data:', orderData);
      
      const customerInfo = orderData.customerInfo || {};
      
      // Create the simplest possible order record
      const orderToInsert = {
        customer_name: customerInfo.name || 'Customer',
        customer_email: customerInfo.email || '',
        customer_phone: customerInfo.phone || '',
        subtotal: parseFloat(orderData.subtotal || 0),
        total_amount: parseFloat(orderData.totalAmount || orderData.total_amount || 0)
      };
      
      // Add timestamp columns if they exist
      try {
        orderToInsert.created_at = new Date();
        orderToInsert.updated_at = new Date();
      } catch (e) {
        console.log('Timestamp columns may not exist');
      }
      
      console.log('Inserting order:', orderToInsert);
      
      const [orderId] = await trx(this.tableName).insert(orderToInsert);
      console.log('Order created with ID:', orderId);
      
      // Insert order items if items table exists
      if (orderData.items && Array.isArray(orderData.items)) {
        try {
          const orderItems = orderData.items.map(item => ({
            order_id: orderId,
            product_id: item.product_id || item.product || 0,
            name: item.name || 'Product',
            price: parseFloat(item.price || 0),
            quantity: parseInt(item.quantity || 1),
            image: item.image || '',
            created_at: new Date(),
            updated_at: new Date()
          }));
          
          await trx(this.itemsTableName).insert(orderItems);
          console.log('Order items inserted:', orderItems.length);
        } catch (itemError) {
          console.log('Could not insert order items:', itemError.message);
          // Continue without items if table doesn't exist
        }
      }
      
      await trx.commit();
      
      // Return a formatted order
      return {
        id: orderId,
        orderNumber: this.generateOrderNumber(),
        customerName: orderToInsert.customer_name,
        customerEmail: orderToInsert.customer_email,
        customerPhone: orderToInsert.customer_phone,
        subtotal: orderToInsert.subtotal,
        totalAmount: orderToInsert.total_amount,
        createdAt: orderToInsert.created_at || new Date(),
        itemsCount: orderData.items ? orderData.items.length : 0
      };
      
    } catch (error) {
      await trx.rollback();
      console.error('Order creation error:', error.message);
      throw error;
    }
  }

  // Find order by ID
  static async findById(id) {
    try {
      const order = await db(this.tableName).where('id', id).first();
      if (!order) return null;
      
      // Try to get items
      let items = [];
      try {
        items = await db(this.itemsTableName).where('order_id', id);
      } catch (e) {
        console.log('Order items table may not exist');
      }
      
      return {
        id: order.id,
        orderNumber: order.order_number || order.orderNumber || `ORDER-${order.id}`,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        subtotal: order.subtotal,
        totalAmount: order.total_amount,
        createdAt: order.created_at || order.createdAt,
        items: items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        itemsCount: items.length
      };
    } catch (error) {
      console.error('Find order error:', error.message);
      return null;
    }
  }
}

module.exports = SimpleOrder;