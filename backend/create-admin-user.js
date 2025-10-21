const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');
    
    const adminData = {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'StrongPass123',
      role: 'admin'
    };
    
    // Check if admin already exists
    const existing = await User.findByEmail(adminData.email);
    if (existing) {
      console.log('⚠️  Admin user already exists with email:', adminData.email);
      return;
    }
    
    // Create admin user
    const admin = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔐 Password:', adminData.password);
    console.log('👨‍💼 Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

createAdminUser();