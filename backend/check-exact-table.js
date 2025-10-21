const db = require('./config/database');

async function checkExactTable() {
  try {
    console.log('Checking exact orders table structure...');
    
    // Check if orders table exists and get its structure
    const result = await db.raw('DESCRIBE orders');
    console.log('\nCurrent orders table columns:');
    console.table(result[0]);
    
    // Also check what tables exist
    const tables = await db.raw('SHOW TABLES');
    console.log('\nAll available tables:');
    tables[0].forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.message.includes("doesn't exist")) {
      console.log('\nOrders table does not exist! Creating a simple one...');
      
      // Create the simplest possible orders table
      await db.schema.createTableIfNotExists('orders', (table) => {
        table.increments('id').primary();
        table.string('orderNumber', 50).unique();
        table.string('customer_name', 100);
        table.string('customer_email', 100);
        table.string('customer_phone', 20);
        table.decimal('subtotal', 10, 2);
        table.decimal('total_amount', 10, 2);
        table.timestamps(true, true);
      });
      
      await db.schema.createTableIfNotExists('order_items', (table) => {
        table.increments('id').primary();
        table.integer('order_id');
        table.integer('product_id');
        table.string('name', 200);
        table.decimal('price', 10, 2);
        table.integer('quantity');
        table.string('image', 500);
        table.timestamps(true, true);
      });
      
      console.log('✅ Simple orders tables created!');
    }
  }
  
  process.exit(0);
}

checkExactTable();