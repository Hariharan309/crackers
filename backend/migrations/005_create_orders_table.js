/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.increments('id').primary();
    table.string('order_number', 50).notNullable().unique();
    table.integer('user_id').unsigned();
    
    // Customer Information
    table.string('customer_name', 100).notNullable();
    table.string('customer_email', 255).notNullable();
    table.string('customer_phone', 20).notNullable();
    table.text('customer_address_street').notNullable();
    table.string('customer_address_city', 100).notNullable();
    table.string('customer_address_state', 100).notNullable();
    table.string('customer_address_zip_code', 20).notNullable();
    table.string('customer_address_country', 100).defaultTo('India');
    
    // Order Amounts
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('discount_amount', 10, 2).defaultTo(0);
    table.enum('discount_type', ['percentage', 'fixed']).defaultTo('fixed');
    table.string('coupon_code', 50);
    table.decimal('shipping_cost', 10, 2).defaultTo(0);
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable();
    
    // Payment & Status
    table.enum('payment_method', ['cash', 'card', 'upi', 'netbanking']).defaultTo('cash');
    table.enum('payment_status', ['pending', 'paid', 'failed', 'refunded']).defaultTo('pending');
    table.enum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).defaultTo('pending');
    table.enum('order_type', ['online', 'pos']).defaultTo('online');
    
    // Additional Information
    table.text('notes');
    table.string('tracking_number', 100);
    table.datetime('estimated_delivery').nullable();
    table.datetime('delivered_at').nullable();
    table.datetime('cancelled_at').nullable();
    table.text('cancellation_reason');
    
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.index(['order_number']);
    table.index(['user_id']);
    table.index(['order_status']);
    table.index(['payment_status']);
    table.index(['order_type']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('orders');
};