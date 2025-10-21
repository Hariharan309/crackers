const User = require('./models/User');
require('dotenv').config();

async function checkUserStatus() {
  try {
    const testEmail = 'admin@example.com';
    const user = await User.findByEmail(testEmail);
    
    console.log('User details:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isActiveType: typeof user.isActive,
      hasPassword: !!user.password
    });
    
    console.log('isActive check result:', user.isActive === true);
    console.log('!user.isActive result:', !user.isActive);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserStatus();