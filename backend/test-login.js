const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testLogin() {
  try {
    console.log('Testing admin login...');
    
    // Find admin user
    const admin = await User.findByEmail('admin@crackers.com');
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive
    });
    
    // Test password
    const isValid = await User.comparePassword('admin123', admin.password);
    console.log('Password test:', isValid ? '✅ Valid' : '❌ Invalid');
    
    if (isValid) {
      console.log('\n🎉 Admin login should work with:');
      console.log('Email: admin@crackers.com');
      console.log('Password: admin123');
    } else {
      console.log('\n❌ Password verification failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testLogin();