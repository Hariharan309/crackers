const knex = require('knex');
const knexConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ MySQL Database Connected Successfully');
  })
  .catch((err) => {
    console.error('❌ Database Connection Error:', err.message);
  });

module.exports = db;