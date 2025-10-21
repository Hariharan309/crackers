const db = require('./config/database');

async function createOrdersTable() {
  try {
    console.log('Creating minimal orders and order_items tables...');
    
    // Drop existing tables if they exist
    await db.schema.dropTableIfExists('order_items');
    await db.schema.dropTableIfExists('orders');
    
    // Create orders table with minimal required fields
    await db.schema.createTable('orders', (table) => {
      table.increments('id').primary();
      table.string('orderNumber', 50).unique().notNullable();
      table.integer('user_id').nullable();
      table.string('customer_name', 100).notNullable();
      table.string('customer_email', 100).nullable();
      table.string('customer_phone', 20).nullable();
      table.text('customer_address').nullable();
      table.decimal('subtotal', 10, 2).notNullable();
      table.decimal('total_amount', 10, 2).notNullable();
      table.timestamps(true, true);
    });
    
    // Create order_items table
    await db.schema.createTable('order_items', (table) => {
      table.increments('id').primary();
      table.integer('order_id').notNullable();
      table.integer('product_id').notNullable();
      table.string('name', 200).notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.integer('quantity').notNullable();
      table.string('image', 500).nullable();
      table.timestamps(true, true);
      
      table.foreign('order_id').references('orders.id').onDelete('CASCADE');
    });
    
    console.log('✅ Orders and order_items tables created successfully!');
    console.log('Tables structure:');
    console.log('Orders: id, orderNumber, user_id, customer_name, customer_email, customer_phone, customer_address, subtotal, total_amount, created_at, updated_at');
    console.log('Order_items: id, order_id, product_id, name, price, quantity, image, created_at, updated_at');
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error creating tables:', error.message);
    process.exit(1);
  }
}

createOrdersTable();