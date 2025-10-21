/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del();
  
  // Inserts sample categories
  await knex('categories').insert([
    {
      id: 1,
      name: 'Ground Crackers',
      description: 'Ground based crackers and sparklers',
      slug: 'ground-crackers',
      is_active: true,
      sort_order: 1
    },
    {
      id: 2,
      name: 'Aerial Fireworks',
      description: 'Sky rockets and aerial display fireworks',
      slug: 'aerial-fireworks',
      is_active: true,
      sort_order: 2
    },
    {
      id: 3,
      name: 'Sparklers',
      description: 'Hand held sparklers and torches',
      slug: 'sparklers',
      is_active: true,
      sort_order: 3
    },
    {
      id: 4,
      name: 'Fountains',
      description: 'Beautiful fountain crackers',
      slug: 'fountains',
      is_active: true,
      sort_order: 4
    },
    {
      id: 5,
      name: 'Gift Boxes',
      description: 'Assorted cracker gift boxes',
      slug: 'gift-boxes',
      is_active: true,
      sort_order: 5
    }
  ]);
};