/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('coupon_products', function(table) {
    table.increments('id').primary();
    table.integer('coupon_id').unsigned().notNullable();
    table.integer('product_id').unsigned().notNullable();
    table.enum('type', ['applicable', 'exclude']).notNullable();
    table.timestamps(true, true);
    
    table.foreign('coupon_id').references('id').inTable('coupons').onDelete('CASCADE');
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.unique(['coupon_id', 'product_id', 'type']);
    table.index(['coupon_id']);
    table.index(['product_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('coupon_products');
};