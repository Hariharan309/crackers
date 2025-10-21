const db = require('./config/database');

async function checkOrders() {
  try {
    console.log('=== CHECKING ORDERS IN DATABASE ===');
    
    // Check if orders table exists
    const tableInfo = await db.raw("SHOW TABLES LIKE 'orders'");
    console.log('Orders table exists:', tableInfo[0].length > 0);
    
    if (tableInfo[0].length > 0) {
      // Get table structure
      const structure = await db.raw('DESCRIBE orders');
      console.log('\nOrders table structure:');
      console.table(structure[0]);
      
      // Count total orders
      const countResult = await db('orders').count('id as count').first();
      console.log('\nTotal orders in database:', countResult.count);
      
      // Get first 5 orders
      const orders = await db('orders').select('*').limit(5);
      console.log('\nFirst 5 orders:');
      console.table(orders);
      
      // Check if order_items table exists
      const itemsTableInfo = await db.raw("SHOW TABLES LIKE 'order_items'");
      console.log('\nOrder_items table exists:', itemsTableInfo[0].length > 0);
      
      if (itemsTableInfo[0].length > 0) {
        const itemsCount = await db('order_items').count('id as count').first();
        console.log('Total order items in database:', itemsCount.count);
        
        const items = await db('order_items').select('*').limit(5);
        console.log('\nFirst 5 order items:');
        console.table(items);
      }
    }
    
  } catch (error) {
    console.error('Error checking orders:', error);
  } finally {
    process.exit(0);
  }
}

checkOrders();