/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('coupons', function(table) {
    table.increments('id').primary();
    table.string('code', 50).notNullable().unique();
    table.string('name', 200).notNullable();
    table.text('description');
    table.enum('type', ['percentage', 'fixed']).notNullable();
    table.decimal('value', 10, 2).notNullable();
    table.decimal('minimum_order_amount', 10, 2).defaultTo(0);
    table.decimal('maximum_discount_amount', 10, 2);
    table.integer('usage_limit').unsigned();
    table.integer('used_count').unsigned().defaultTo(0);
    table.integer('user_usage_limit').unsigned().defaultTo(1);
    table.datetime('start_date').notNullable();
    table.datetime('end_date').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('created_by').unsigned().notNullable();
    table.timestamps(true, true);
    
    table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');
    table.index(['code']);
    table.index(['is_active']);
    table.index(['start_date', 'end_date']);
    table.index(['created_by']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('coupons');
};