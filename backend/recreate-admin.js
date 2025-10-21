const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function recreateAdmin() {
  try {
    console.log('Recreating admin user...');
    
    // Delete existing admin
    await db('users').where('email', 'admin@crackers.com').del();
    console.log('Deleted existing admin user');
    
    // Create new admin user with correct structure
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const [adminId] = await db('users').insert({
      name: 'Admin User',
      email: 'admin@crackers.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+91 9876543210',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('Admin user recreated successfully!');
    console.log('ID:', adminId);
    console.log('Email: admin@crackers.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error recreating admin user:', error);
  } finally {
    process.exit(0);
  }
}

recreateAdmin();