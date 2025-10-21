/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.increments('id').primary();
    table.string('name', 200).notNullable();
    table.text('description').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.decimal('discount_price', 10, 2);
    table.integer('category_id').unsigned().notNullable();
    table.integer('stock').unsigned().defaultTo(0);
    table.string('sku', 100).notNullable().unique();
    table.decimal('weight', 8, 2);
    table.enum('unit', ['piece', 'packet', 'box', 'kg', 'gram']).defaultTo('piece');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);
    table.text('tags');
    table.decimal('ratings_average', 3, 2).defaultTo(0);
    table.integer('ratings_count').defaultTo(0);
    table.integer('views').defaultTo(0);
    table.integer('sales').defaultTo(0);
    table.timestamps(true, true);
    
    table.foreign('category_id').references('id').inTable('categories').onDelete('CASCADE');
    table.index(['name']);
    table.index(['category_id']);
    table.index(['price']);
    table.index(['is_active']);
    table.index(['is_featured']);
    table.index(['stock']);
    table.index(['sku']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('products');
};