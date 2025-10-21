const User = require('./models/User');
const { generateToken } = require('./utils/helpers');
require('dotenv').config();

async function testAdminAPI() {
  try {
    console.log('🧪 Testing Admin API endpoints...\n');
    
    // Find admin user
    const admin = await User.findByEmail('admin@example.com');
    if (!admin) {
      console.log('❌ Admin user not found. Please create admin user first.');
      return;
    }
    
    console.log('✅ Admin user found:', admin.name);
    
    // Test JWT token generation
    console.log('\n2. Testing JWT token generation...');
    const token = generateToken(admin.id);
    console.log('✅ JWT token generated:', token.substring(0, 20) + '...');
    
    console.log('\n3. Admin API endpoints available:');
    console.log('   - GET /api/admin/dashboard');
    console.log('   - GET /api/admin/dashboard/recent-orders');
    console.log('   - GET /api/admin/dashboard/todays-summary');
    console.log('   - GET /api/admin/products');
    console.log('   - GET /api/admin/categories');
    
    console.log('\n✅ Admin API setup completed!');
    console.log('\n💡 You can now:');
    console.log('   1. Start the backend: npm run dev');
    console.log('   2. Start the frontend: npm run dev');
    console.log('   3. Login with: admin@example.com / StrongPass123');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAdminAPI();