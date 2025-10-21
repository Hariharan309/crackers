const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testAuth() {
  try {
    console.log('🔍 Testing Authentication...\n');
    
    // 1. Check if admin user exists
    console.log('1. Checking admin user...');
    const admin = await User.findByEmail('admin@example.com');
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    console.log('✅ Admin user found:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive
    });
    
    // 2. Test JWT token generation
    console.log('\n2. Testing JWT token generation...');
    const testToken = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    console.log('✅ JWT token generated successfully');
    console.log('Token (first 50 chars):', testToken.substring(0, 50) + '...');
    
    // 3. Test JWT token verification
    console.log('\n3. Testing JWT token verification...');
    try {
      const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
      console.log('✅ Token verification successful');
      console.log('Decoded payload:', decoded);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return;
    }
    
    // 4. Test finding user by decoded ID
    console.log('\n4. Testing user lookup by decoded ID...');
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    const userFromToken = await User.findById(decoded.id);
    if (!userFromToken) {
      console.log('❌ User not found by token ID');
      return;
    }
    console.log('✅ User found by token ID:', {
      id: userFromToken.id,
      email: userFromToken.email,
      role: userFromToken.role
    });
    
    console.log('\n✅ All authentication tests passed!');
    console.log('\n💡 Test this token in your API calls:');
    console.log(`Authorization: Bearer ${testToken}`);
    
    // 5. Test actual API endpoint simulation
    console.log('\n5. Simulating auth middleware check...');
    
    // Simulate what happens in auth middleware
    const mockReq = {
      headers: {
        authorization: `Bearer ${testToken}`
      }
    };
    
    let token;
    if (mockReq.headers.authorization && mockReq.headers.authorization.startsWith('Bearer')) {
      token = mockReq.headers.authorization.split(' ')[1];
      console.log('✅ Token extracted from header');
    }
    
    if (!token) {
      console.log('❌ No token in header');
      return;
    }
    
    try {
      const decoded2 = jwt.verify(token, process.env.JWT_SECRET);
      const user2 = await User.findById(decoded2.id);
      
      if (!user2) {
        console.log('❌ User not found in middleware simulation');
        return;
      }
      
      if (!user2.isActive) {
        console.log('❌ User is not active');
        return;
      }
      
      console.log('✅ Auth middleware simulation successful');
      console.log('User role:', user2.role);
      
      // Test admin authorization
      if (['admin', 'super_admin'].includes(user2.role)) {
        console.log('✅ Admin authorization check passed');
      } else {
        console.log('❌ Admin authorization failed - user role:', user2.role);
      }
      
    } catch (error) {
      console.log('❌ Auth middleware simulation failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAuth();