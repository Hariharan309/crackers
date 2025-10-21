const Category = require('./models/Category');
const Product = require('./models/Product');
require('dotenv').config();

async function testAPIs() {
  try {
    console.log('🧪 Testing Categories and Products APIs...\n');
    
    // Test Categories
    console.log('1. Testing Categories:');
    try {
      const categories = await Category.findAll({ is_active: true });
      console.log(`✅ Categories found: ${categories.length}`);
      
      if (categories.length === 0) {
        console.log('📝 Creating a sample category...');
        const sampleCategory = await Category.create({
          name: 'Sample Category',
          description: 'This is a sample category for testing'
        });
        console.log('✅ Sample category created:', sampleCategory.name);
      } else {
        console.log('📋 Categories:');
        categories.forEach(cat => console.log(`  - ${cat.name}`));
      }
    } catch (error) {
      console.error('❌ Categories error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test Products
    console.log('2. Testing Products:');
    try {
      const products = await Product.findAll({ is_active: true, limit: 5 });
      console.log(`✅ Products found: ${products.length}`);
      
      if (products.length === 0) {
        console.log('📝 No products found - you can add products through the admin panel');
      } else {
        console.log('📋 Products:');
        products.forEach(product => console.log(`  - ${product.name} (₹${product.price})`));
      }
    } catch (error) {
      console.error('❌ Products error:', error.message);
    }
    
    console.log('\n✅ API tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAPIs();