const db = require('./config/database');

async function checkOrdersTable() {
  try {
    console.log('Checking what columns exist in orders table...');
    
    // Try to get table structure
    try {
      const result = await db.raw('SHOW COLUMNS FROM orders');
      console.log('Existing columns in orders table:');
      result[0].forEach(col => {
        console.log(`- ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      if (error.message.includes("doesn't exist")) {
        console.log('Orders table does not exist. Let me check what tables do exist...');
        
        const tables = await db.raw('SHOW TABLES');
        console.log('Available tables:');
        tables[0].forEach(table => {
          console.log(`- ${Object.values(table)[0]}`);
        });
      } else {
        throw error;
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkOrdersTable();