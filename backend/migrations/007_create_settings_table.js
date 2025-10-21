/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('settings', function(table) {
    table.increments('id').primary();
    table.string('key', 100).notNullable().unique();
    table.text('value').notNullable();
    table.enum('type', ['string', 'number', 'boolean', 'object', 'array']).defaultTo('string');
    table.text('description');
    table.enum('category', ['general', 'company', 'payment', 'shipping', 'tax', 'email']).defaultTo('general');
    table.timestamps(true, true);
    
    table.index(['key']);
    table.index(['category']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('settings');
};