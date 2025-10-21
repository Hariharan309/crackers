const axios = require('axios');

async function testOrderCreation() {
  try {
    console.log('🧪 Testing Order Creation...');
    
    // Sample order data
    const orderData = {
      customerInfo: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '9876543210',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India'
        }
      },
      items: [
        {
          product: 1, // Assuming product ID 1 exists
          name: 'Test Crackers',
          price: 100,
          quantity: 2,
          image: ''
        }
      ],
      subtotal: 200,
      taxAmount: 36,
      totalAmount: 236,
      paymentMethod: 'upi',
      orderType: 'online'
    };
    
    console.log('📤 Sending order data:', JSON.stringify(orderData, null, 2));
    
    const response = await axios.post('http://localhost:5000/api/orders', orderData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Order creation successful!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Order creation failed!');
    console.error('Error details:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testOrderCreation();