const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication...');
    
    const testEmail = 'admin@example.com';
    const testPassword = 'StrongPass123';
    
    console.log('\n1. Searching for user with email:', testEmail);
    
    // Find user with password
    const user = await User.findByEmail(testEmail);
    
    if (!user) {
      console.log('❌ User not found in database');
      
      // Check if any users exist
      const allUsers = await User.findAll();
      console.log('\n📊 Total users in database:', allUsers.length);
      
      if (allUsers.length > 0) {
        console.log('📋 Existing users:');
        allUsers.forEach(u => console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`));
      }
      
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });
    
    if (!user.password) {
      console.log('❌ Password not included in user data');
      return;
    }
    
    console.log('\n2. Testing password comparison...');
    console.log('Input password:', testPassword);
    console.log('Stored hash (first 20 chars):', user.password.substring(0, 20) + '...');
    
    // Test password comparison
    const isValid = await User.comparePassword(testPassword, user.password);
    console.log('Password comparison result:', isValid);
    
    if (!isValid) {
      console.log('\n🔧 Testing manual bcrypt comparison...');
      const manualComparison = await bcrypt.compare(testPassword, user.password);
      console.log('Manual bcrypt result:', manualComparison);
      
      // Test if password is hashed correctly
      console.log('\n🔐 Testing password hashing...');
      const salt = await bcrypt.genSalt(10);
      const testHash = await bcrypt.hash(testPassword, salt);
      const testComparison = await bcrypt.compare(testPassword, testHash);
      console.log('Fresh hash test:', testComparison);
    } else {
      console.log('✅ Password is correct!');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugAuth();