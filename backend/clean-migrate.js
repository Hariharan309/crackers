const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanAndMigrate() {
  console.log('🧹 Cleaning database and running migrations...');
  
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('✅ Connected to database');
    
    // Drop tables in reverse order due to foreign key constraints
    const tablesToDrop = [
      'coupon_products',
      'coupon_categories', 
      'coupons',
      'settings',
      'order_items',
      'orders',
      'product_images',
      'products',
      'categories',
      'users',
      'knex_migrations',
      'knex_migrations_lock'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS \`${table}\``);
        console.log(`🗑️  Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} doesn't exist or couldn't be dropped`);
      }
    }
    
    await connection.end();
    console.log('✅ Database cleaned successfully');
    
    // Now run migrations
    console.log('🚀 Running migrations...');
    const { spawn } = require('child_process');
    
    const migrate = spawn('npx', ['knex', 'migrate:latest'], {
      stdio: 'inherit',
      shell: true
    });
    
    migrate.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Migrations completed successfully!');
      } else {
        console.error('❌ Migration failed with code:', code);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanAndMigrate();