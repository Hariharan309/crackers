const db = require('./config/database');

async function addAddressColumn() {
  try {
    console.log('Adding customer_address column to orders table...');
    
    // Check if column already exists
    const columns = await db.raw('SHOW COLUMNS FROM orders LIKE "customer_address"');
    
    if (columns[0].length > 0) {
      console.log('✅ customer_address column already exists');
    } else {
      // Add the column
      await db.schema.table('orders', (table) => {
        table.text('customer_address').nullable().after('customer_phone');
      });
      console.log('✅ customer_address column added successfully');
    }
    
    // Show updated table structure
    const result = await db.raw('DESCRIBE orders');
    console.log('\nUpdated orders table columns:');
    console.table(result[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.message.includes("doesn't exist")) {
      console.log('Orders table does not exist. Creating it with address column...');
      
      // Drop and recreate with all needed columns
      await db.schema.dropTableIfExists('order_items');
      await db.schema.dropTableIfExists('orders');
      
      await db.schema.createTable('orders', (table) => {
        table.increments('id').primary();
        table.string('orderNumber', 50).unique();
        table.integer('user_id').nullable();
        table.string('customer_name', 100);
        table.string('customer_email', 100);
        table.string('customer_phone', 20);
        table.text('customer_address').nullable();
        table.decimal('subtotal', 10, 2);
        table.decimal('total_amount', 10, 2);
        table.timestamps(true, true);
      });
      
      await db.schema.createTable('order_items', (table) => {
        table.increments('id').primary();
        table.integer('order_id');
        table.integer('product_id');
        table.string('name', 200);
        table.decimal('price', 10, 2);
        table.integer('quantity');
        table.string('image', 500);
        table.timestamps(true, true);
      });
      
      console.log('✅ Orders tables created with address column');
    }
  }
  
  process.exit(0);
}

addAddressColumn();