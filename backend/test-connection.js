const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('Testing MySQL connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  console.log('Port:', process.env.DB_PORT);
  
  try {
    // First try to connect without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });
    
    console.log('✅ Connected to MySQL server successfully!');
    
    // Check if database exists
    const [databases] = await connection.execute(`SHOW DATABASES LIKE '${process.env.DB_NAME}'`);
    
    if (databases.length === 0) {
      console.log(`⚠️  Database '${process.env.DB_NAME}' does not exist. Creating it...`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
      console.log('✅ Database created successfully!');
    } else {
      console.log('✅ Database exists!');
    }
    
    await connection.end();
    
    // Now test connection with database
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('✅ Connected to database successfully!');
    await dbConnection.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Suggestions:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check if MySQL is installed on your system');
      console.log('3. Verify MySQL is running on port 3306');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Suggestions:');
      console.log('1. Check username and password in .env file');
      console.log('2. Make sure the user has proper permissions');
    }
  }
}

testConnection();