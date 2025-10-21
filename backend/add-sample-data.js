const Product = require('./models/Product');
const Category = require('./models/Category');

async function addSampleData() {
  try {
    console.log('Adding sample data...');
    
    // Check if category already exists
    const existingCategories = await Category.findAll();
    let categoryId = 1;
    
    if (existingCategories.length === 0) {
      // Add sample category
      const category = await Category.create({
        name: 'Crackers',
        description: 'Delicious crackers for all occasions',
        is_active: true
      });
      categoryId = category.id;
      console.log('Added sample category:', category.name);
    } else {
      categoryId = existingCategories[0].id;
      console.log('Using existing category:', existingCategories[0].name);
    }
    
    // Add sample products
    const products = [
      {
        name: 'Classic Butter Crackers',
        description: 'Traditional butter flavored crackers, perfect for snacking',
        price: 299.99,
        discount_price: 249.99,
        category_id: categoryId,
        stock: 50,
        sku: 'CRACK001',
        unit: 'packet',
        tags: ['butter', 'classic', 'snack'],
        is_active: true,
        is_featured: true
      },
      {
        name: 'Spicy Masala Crackers',
        description: 'Hot and spicy masala flavored crackers with Indian spices',
        price: 199.99,
        category_id: categoryId,
        stock: 30,
        sku: 'CRACK002',
        unit: 'packet',
        tags: ['spicy', 'masala', 'indian'],
        is_active: true,
        is_featured: false
      },
      {
        name: 'Sweet & Salt Mix',
        description: 'Perfect blend of sweet and salty crackers for kids and adults',
        price: 179.99,
        discount_price: 149.99,
        category_id: categoryId,
        stock: 25,
        sku: 'CRACK003',
        unit: 'packet',
        tags: ['sweet', 'salty', 'mix', 'kids'],
        is_active: true,
        is_featured: false
      },
      {
        name: 'Cheese Crackers Premium',
        description: 'Premium cheese flavored crackers made with real cheese',
        price: 399.99,
        discount_price: 349.99,
        category_id: categoryId,
        stock: 20,
        sku: 'CRACK004',
        unit: 'packet',
        tags: ['cheese', 'premium', 'real cheese'],
        is_active: true,
        is_featured: true
      },
      {
        name: 'Garlic Herb Crackers',
        description: 'Aromatic garlic and herb flavored crackers',
        price: 229.99,
        category_id: categoryId,
        stock: 40,
        sku: 'CRACK005',
        unit: 'packet',
        tags: ['garlic', 'herb', 'aromatic'],
        is_active: true,
        is_featured: false
      }
    ];
    
    for (const productData of products) {
      try {
        const product = await Product.create(productData);
        console.log('Added product:', product.name);
      } catch (error) {
        if (error.message.includes('SKU already exists')) {
          console.log('Product already exists:', productData.name);
        } else {
          console.error('Error adding product:', productData.name, error.message);
        }
      }
    }
    
    console.log('Sample data added successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
}

addSampleData();