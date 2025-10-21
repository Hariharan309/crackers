const db = require('./config/database');

async function checkTableStructure() {
  try {
    console.log('Checking orders table structure...');
    
    // Get table structure
    const columns = await db.raw('DESCRIBE orders');
    console.log('Orders table columns:');
    console.table(columns[0]);
    
    console.log('Checking if orders table exists and has data...');
    const orderCount = await db('orders').count('id as count').first();
    console.log(`Orders table has ${orderCount.count} records`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error checking table structure:', error.message);
    
    if (error.message.includes("doesn't exist")) {
      console.log('\nOrders table does not exist. Creating it...');
      
      try {
        await db.schema.createTable('orders', (table) => {
          table.increments('id').primary();
          table.string('orderNumber').unique().notNullable();
          table.integer('user_id').nullable();
          table.string('customer_name').notNullable();
          table.string('customer_email').nullable();
          table.string('customer_phone').nullable();
          table.text('customer_address').nullable();
          table.decimal('cash_received', 10, 2).defaultTo(0);
          table.decimal('change_amount', 10, 2).defaultTo(0);
          table.integer('created_by').nullable();
          table.decimal('subtotal', 10, 2).notNullable();
          table.decimal('discount_amount', 10, 2).defaultTo(0);
          table.enum('discount_type', ['fixed', 'percentage']).defaultTo('fixed');
          table.string('coupon_code').nullable();
          table.decimal('shipping_cost', 10, 2).defaultTo(0);
          table.decimal('tax_amount', 10, 2).defaultTo(0);
          table.decimal('total_amount', 10, 2).notNullable();
          table.enum('payment_method', ['cash', 'card', 'upi', 'netbanking']).defaultTo('cash');
          table.enum('payment_status', ['pending', 'paid', 'failed', 'refunded']).defaultTo('pending');
          table.enum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).defaultTo('pending');
          table.enum('order_type', ['online', 'pos']).defaultTo('online');
          table.text('notes').nullable();
          table.string('tracking_number').nullable();
          table.datetime('estimated_delivery').nullable();
          table.datetime('delivered_at').nullable();
          table.datetime('cancelled_at').nullable();
          table.string('cancellation_reason').nullable();
          table.timestamps(true, true);
        });
        
        // Create order_items table
        await db.schema.createTable('order_items', (table) => {
          table.increments('id').primary();
          table.integer('order_id').notNullable();
          table.integer('product_id').notNullable();
          table.string('name').notNullable();
          table.decimal('price', 10, 2).notNullable();
          table.integer('quantity').notNullable();
          table.string('image').nullable();
          table.timestamps(true, true);
          
          table.foreign('order_id').references('orders.id').onDelete('CASCADE');
        });
        
        console.log('Orders and order_items tables created successfully!');
        
      } catch (createError) {
        console.error('Error creating tables:', createError.message);
      }
    }
    
    process.exit(1);
  }
}

checkTableStructure();