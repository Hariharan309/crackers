import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function ProductsPage() {
  const categories = [
    {
      id: 1,
      name: 'Ground Crackers',
      description: 'Traditional ground-based crackers perfect for creating spectacular displays',
      image: '🎆',
      products: ['Flower Pots', 'Chakras', 'Sparklers', 'Bombs', 'Bijilis'],
      features: ['Safe & Reliable', 'Vibrant Colors', 'Long Duration']
    },
    {
      id: 2,
      name: 'Aerial Fireworks',
      description: 'Sky-high fireworks that create breathtaking displays in the night sky',
      image: '🎇',
      products: ['Sky Rockets', 'Multi Shot', 'Roman Candles', 'Cakes', 'Comets'],
      features: ['High Altitude', 'Stunning Effects', 'Professional Grade']
    },
    {
      id: 3,
      name: 'Sparklers',
      description: 'Hand-held sparklers for intimate celebrations and special moments',
      image: '✨',
      products: ['Electric Sparklers', 'Color Sparklers', 'Heart Sparklers', 'Photo Sparklers'],
      features: ['Safe for Kids', 'Beautiful Effects', 'Perfect for Photos']
    },
    {
      id: 4,
      name: 'Fountains',
      description: 'Beautiful fountain effects that create magical cascades of light',
      image: '⛲',
      products: ['Color Fountains', 'Multi-Color', 'Golden Fountains', 'Silver Fountains'],
      features: ['Mesmerizing Effects', 'Long Duration', 'Safe Operation']
    },
    {
      id: 5,
      name: 'Gift Boxes',
      description: 'Curated collections of crackers perfect for gifting',
      image: '🎁',
      products: ['Family Packs', 'Premium Boxes', 'Festival Collections', 'Kids Special'],
      features: ['Variety Pack', 'Great Value', 'Perfect for Gifts']
    },
    {
      id: 6,
      name: 'Eco-Friendly Range',
      description: 'Environment-conscious crackers with reduced pollution',
      image: '🌱',
      products: ['Green Crackers', 'Low Noise', 'Minimal Smoke', 'Biodegradable'],
      features: ['Eco-Friendly', 'Less Pollution', 'Government Approved']
    }
  ]

  const specialOffers = [
    {
      title: 'Festival Combo',
      description: 'Get 20% off on orders above ₹2000',
      code: 'FESTIVAL20'
    },
    {
      title: 'Bulk Orders',
      description: 'Special discounts for bulk purchases',
      code: 'BULK15'
    },
    {
      title: 'First Time Buyers',
      description: 'Extra 10% off for new customers',
      code: 'WELCOME10'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Products</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Discover our extensive collection of premium crackers and fireworks
            </p>
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Categories</h2>
            <p className="text-xl text-gray-600">
              From traditional ground crackers to spectacular aerial displays, we have everything you need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div key={category.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{category.image}</div>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-center">{category.description}</p>
                  
                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {category.features.map((feature) => (
                        <li key={feature} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Sample Products */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Popular Items:</h4>
                    <div className="flex flex-wrap gap-1">
                      {category.products.slice(0, 3).map((product) => (
                        <span key={product} className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs">
                          {product}
                        </span>
                      ))}
                      {category.products.length > 3 && (
                        <span className="text-gray-500 text-xs px-2 py-1">
                          +{category.products.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Link 
                    href={`/shop?category=${category.name.toLowerCase().replace(' ', '-')}`}
                    className="block w-full bg-primary-600 text-white text-center py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    View Products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Special Offers</h2>
            <p className="text-xl text-gray-600">Limited time deals on our premium products</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialOffers.map((offer) => (
              <div key={offer.title} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                <div className="bg-primary-100 p-2 rounded text-center">
                  <span className="text-primary-700 font-mono font-bold">Code: {offer.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-900 mb-6 text-center">Safety First</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-4">Safety Guidelines:</h3>
                <ul className="space-y-2 text-red-800">
                  <li>• Always read instructions before use</li>
                  <li>• Keep water/sand nearby while bursting crackers</li>
                  <li>• Children should be supervised by adults</li>
                  <li>• Light crackers at arm's length and step back</li>
                  <li>• Never attempt to relight failed crackers</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-4">Storage Tips:</h3>
                <ul className="space-y-2 text-red-800">
                  <li>• Store in cool, dry place away from heat</li>
                  <li>• Keep away from children and pets</li>
                  <li>• Do not store near flammable materials</li>
                  <li>• Check expiry dates before use</li>
                  <li>• Dispose of unused crackers safely</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse our complete collection and find the perfect crackers for your celebration
          </p>
          <div className="space-x-4">
            <Link href="/shop" className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center">
              Shop Now
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors">
              Get Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}