const axios = require('axios');
require('dotenv').config();

async function testLoginAPI() {
  try {
    console.log('🧪 Testing login API endpoint...');
    
    const loginData = {
      email: 'admin@example.com',
      password: 'StrongPass123'
    };
    
    console.log('Login data:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLoginAPI();