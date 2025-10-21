const db = require('./config/database');

async function fixOrdersTable() {
  try {
    console.log('🔧 Fixing orders table structure...');
    
    // Drop existing tables to start fresh
    console.log('Dropping existing tables...');
    await db.schema.dropTableIfExists('order_items');
    await db.schema.dropTableIfExists('orders');
    
    // Create orders table with correct snake_case column names
    console.log('Creating orders table with correct column names...');
    await db.schema.createTable('orders', (table) => {
      table.increments('id').primary();
      table.string('order_number', 50).unique().notNullable();
      table.integer('user_id').nullable();
      table.string('customer_name', 100).notNullable();
      table.string('customer_email', 100).nullable();
      table.string('customer_phone', 20).nullable();
      table.text('customer_address').nullable();
      table.decimal('subtotal', 10, 2).notNullable();
      table.decimal('total_amount', 10, 2).notNullable();
      table.timestamps(true, true); // This creates created_at and updated_at
    });
    
    // Create order_items table
    console.log('Creating order_items table...');
    await db.schema.createTable('order_items', (table) => {
      table.increments('id').primary();
      table.integer('order_id').notNullable();
      table.integer('product_id').notNullable();
      table.string('name', 200).notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.integer('quantity').notNullable();
      table.string('image', 500).nullable();
      table.timestamps(true, true);
      
      // Add foreign key constraint
      table.foreign('order_id').references('orders.id').onDelete('CASCADE');
    });
    
    console.log('✅ Orders tables created successfully!');
    
    // Show the table structure
    const result = await db.raw('DESCRIBE orders');
    console.log('\n📋 Orders table structure:');
    console.table(result[0]);
    
    const result2 = await db.raw('DESCRIBE order_items');
    console.log('\n📋 Order items table structure:');
    console.table(result2[0]);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing orders table:', error.message);
    process.exit(1);
  }
}

fixOrdersTable();