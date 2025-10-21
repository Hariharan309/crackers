'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FunnelIcon, StarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { getProducts, getCategories } from '@/lib/api';
import { Product, Category, ApiResponse } from '@/types';
import { useCart } from '@/contexts/CartContext';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, getItemQuantity } = useCart();

  // Fetch products and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse: ApiResponse<Category[]> = await getCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
        
        // Fetch products with filters
        const productsResponse: ApiResponse<Product[]> = await getProducts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: sortBy,
          inStock: true
        });
        
        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCategory, sortBy]);

  // Sample fallback data for development
  const fallbackProducts = [
    {
      id: 1,
      name: 'Golden Sparklers',
      category: 'sparklers',
      price: 150,
      originalPrice: 180,
      image: '✨',
      rating: 4.5,
      reviews: 24,
      inStock: true,
      description: 'Beautiful golden sparklers perfect for celebrations'
    },
    {
      id: 2,
      name: 'Flower Pot Deluxe',
      category: 'ground-crackers',
      price: 250,
      originalPrice: null,
      image: '🎆',
      rating: 4.8,
      reviews: 56,
      inStock: true,
      description: 'Premium flower pot crackers with vibrant colors'
    },
    {
      id: 3,
      name: 'Sky Rocket Supreme',
      category: 'aerial-fireworks',
      price: 400,
      originalPrice: 450,
      image: '🎇',
      rating: 4.7,
      reviews: 89,
      inStock: true,
      description: 'High-flying rockets with spectacular effects'
    },
    {
      id: 4,
      name: 'Color Fountain',
      category: 'fountains',
      price: 180,
      originalPrice: null,
      image: '⛲',
      rating: 4.6,
      reviews: 34,
      inStock: false,
      description: 'Multi-colored fountain with long duration'
    },
    {
      id: 5,
      name: 'Family Gift Box',
      category: 'gift-boxes',
      price: 800,
      originalPrice: 1000,
      image: '🎁',
      rating: 4.9,
      reviews: 123,
      inStock: true,
      description: 'Complete family pack with assorted crackers'
    },
    {
      id: 6,
      name: 'Electric Sparklers',
      category: 'sparklers',
      price: 120,
      originalPrice: null,
      image: '✨',
      rating: 4.4,
      reviews: 67,
      inStock: true,
      description: 'Safe electric sparklers for kids'
    }
  ];

  // Build categories list with counts
  const categoryOptions = [
    { id: 'all', name: 'All Products', count: products.length },
    ...categories.map(cat => ({
      id: cat.slug,
      name: cat.name,
      count: cat.productCount || 0
    }))
  ];

  const priceRanges = [
    { id: 'all', name: 'All Prices', min: 0, max: Infinity },
    { id: '0-200', name: 'Under ₹200', min: 0, max: 200 },
    { id: '200-500', name: '₹200 - ₹500', min: 200, max: 500 },
    { id: '500-1000', name: '₹500 - ₹1000', min: 500, max: 1000 },
    { id: '1000+', name: 'Above ₹1000', min: 1000, max: Infinity }
  ];

  // Filter products based on selected filters (client-side for price range)
  const filteredProducts = products.filter(product => {
    const priceRangeObj = priceRanges.find(range => range.id === priceRange);
    const priceMatch = product.price >= priceRangeObj!.min && product.price <= priceRangeObj!.max;
    return priceMatch;
  });

  // Products are already filtered and sorted by the backend
  const displayProducts = filteredProducts;

  // Get product image URL
  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    // Fallback emoji based on category
    const categoryName = product.category?.name.toLowerCase() || '';
    if (categoryName.includes('sparkler')) return '✨';
    if (categoryName.includes('aerial') || categoryName.includes('rocket')) return '🎇';
    if (categoryName.includes('fountain')) return '⛲';
    if (categoryName.includes('gift') || categoryName.includes('box')) return '🎁';
    return '🎆'; // default
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold">Shop Crackers</h1>
          <p className="text-xl mt-2">Discover our premium collection of crackers and fireworks</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            {/* Mobile filter toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>

            {/* Filters */}
            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Categories */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categoryOptions.map((category) => (
                    <label key={category.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {category.name} ({category.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        value={range.id}
                        checked={priceRange === range.id}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{range.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-primary-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Can't find what you're looking for?
                </p>
                <Link
                  href="/contact"
                  className="block text-center bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="text-sm text-gray-700">
                  Showing {displayProducts.length} of {products.length} products
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Products</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayProducts.map((product) => {
                  const productImage = getProductImage(product);
                  const isImage = productImage.startsWith('http');
                  
                  return (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4">
                        {/* Product Image */}
                        <div className="text-center mb-4">
                          {isImage ? (
                            <img
                              src={productImage}
                              alt={product.name}
                              className="w-16 h-16 mx-auto object-cover rounded-lg mb-2"
                            />
                          ) : (
                            <div className="text-4xl mb-2">{productImage}</div>
                          )}
                          {product.stock === 0 && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>

                          {/* Rating */}
                          <div className="flex items-center justify-center mb-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.ratings_average) ? 'fill-current' : ''
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-1">
                              ({product.ratings_count})
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mb-4">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{product.discount_price || product.price}
                            </span>
                            {product.discount_price && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ₹{product.price}
                              </span>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            onClick={() => {
                              if (product.stock > 0) {
                                addToCart(product);
                              }
                            }}
                            disabled={product.stock === 0}
                            className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              product.stock > 0
                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCartIcon className="h-4 w-4 mr-2" />
                            {product.stock > 0 ? (
                              getItemQuantity(product.id) > 0 ? 
                                `In Cart (${getItemQuantity(product.id)})` : 
                                'Add to Cart'
                            ) : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No Products Message */}
            {!loading && !error && displayProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange('all');
                  }}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Load More Button */}
            {!loading && !error && displayProducts.length > 0 && (
              <div className="text-center mt-8">
                <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
                  Load More Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-red-50 border-t border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-red-800">
                <strong>Safety Notice:</strong> Please read all instructions carefully before use. 
                Keep water/sand nearby. Adult supervision required for children.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}