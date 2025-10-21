const db = require('./config/database');

async function addTestOrder() {
  try {
    console.log('=== ADDING TEST ORDER ===');
    
    // Add a test order
    const testOrder = {
      order_number: `ORDER-${Date.now().toString().slice(-8)}`,
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '9876543210',
      customer_address_street: '123 Test Street',
      customer_address_city: 'Chennai',
      customer_address_state: 'Tamil Nadu',
      customer_address_zip_code: '600001',
      subtotal: 500.00,
      total_amount: 550.00,
      shipping_cost: 50.00,
      payment_method: 'upi',
      payment_status: 'paid',
      order_status: 'confirmed',
      order_type: 'online',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [orderId] = await db('orders').insert(testOrder);
    console.log('Test order created with ID:', orderId);
    
    // Add test order items
    const testItems = [
      {
        order_id: orderId,
        product_id: 1,
        product_name: 'Test Cracker 1',
        price: 200.00,
        quantity: 2,
        product_image: '/uploads/test-image1.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        order_id: orderId,
        product_id: 2,
        product_name: 'Test Cracker 2',
        price: 100.00,
        quantity: 1,
        product_image: '/uploads/test-image2.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    await db('order_items').insert(testItems);
    console.log('Test order items added');
    
    // Verify the data
    const orders = await db('orders').select('*');
    console.log('Total orders now:', orders.length);
    
  } catch (error) {
    console.error('Error adding test order:', error);
  } finally {
    process.exit(0);
  }
}

addTestOrder();