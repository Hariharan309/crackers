const db = require('./config/database');

async function checkProducts() {
  try {
    console.log('Checking products in database...');
    
    // Get all products
    const products = await db('products').select('*');
    console.log(`Found ${products.length} products:`);
    
    products.forEach(product => {
      console.log(`- ID: ${product.id}, Name: ${product.name}, Active: ${product.is_active}, Stock: ${product.stock}`);
    });
    
    if (products.length === 0) {
      console.log('No products found. Adding sample product...');
      
      // Check if categories exist
      let categories = await db('categories').select('*');
      let categoryId = 1;
      
      if (categories.length === 0) {
        console.log('No categories found. Creating sample category...');
        const [newCategoryId] = await db('categories').insert({
          name: 'Crackers',
          description: 'Delicious crackers for all occasions',
          slug: 'crackers',
          is_active: true,
          sort_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        });
        categoryId = newCategoryId;
        console.log('Created category with ID:', categoryId);
      } else {
        categoryId = categories[0].id;
        console.log('Using existing category ID:', categoryId);
      }
      
      // Add sample product
      const [productId] = await db('products').insert({
        name: 'Cheese Crackers Premium',
        description: 'Premium cheese flavored crackers made with real cheese',
        price: 399.99,
        discount_price: 349.99,
        category_id: categoryId,
        stock: 50,
        sku: 'CRACK004',
        unit: 'packet',
        is_active: 1,
        is_featured: 1,
        ratings_average: 0,
        ratings_count: 0,
        views: 0,
        sales: 0,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log('Created sample product with ID:', productId);
    }
    
    console.log('Check complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error checking products:', error);
    process.exit(1);
  }
}

checkProducts();