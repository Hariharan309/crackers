import Link from 'next/link'
import { SparklesIcon, ShieldCheckIcon, TruckIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      name: 'Premium Quality',
      description: 'Hand-picked crackers from trusted manufacturers ensuring safety and quality.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Fast Delivery',
      description: 'Quick and safe delivery to your doorstep with proper packaging.',
      icon: TruckIcon,
    },
    {
      name: 'Magical Moments',
      description: 'Create unforgettable celebrations with our spectacular fireworks.',
      icon: SparklesIcon,
    },
    {
      name: 'Customer Satisfaction',
      description: 'Your happiness is our priority. 100% satisfaction guaranteed.',
      icon: HeartIcon,
    },
  ]

  const categories = [
    { name: 'Ground Crackers', image: '🎆', description: 'Safe ground-based crackers' },
    { name: 'Aerial Fireworks', image: '🎇', description: 'Spectacular sky displays' },
    { name: 'Sparklers', image: '✨', description: 'Hand-held sparklers' },
    { name: 'Fountains', image: '⛲', description: 'Beautiful fountain effects' },
    { name: 'Gift Boxes', image: '🎁', description: 'Curated cracker collections' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Cracker Shop
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Premium Crackers & Fireworks for All Your Celebrations
            </p>
            <div className="space-x-4">
              <Link href="/shop" className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                Shop Now
              </Link>
              <Link href="/products" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                View Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600">We bring the best quality and service to make your celebrations memorable</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Categories</h2>
            <p className="text-xl text-gray-600">Explore our wide range of crackers and fireworks</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={`/shop?category=${category.name.toLowerCase().replace(' ', '-')}`}>
                <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-4xl mb-3">{category.image}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Light Up Your Celebration?</h2>
          <p className="text-xl text-gray-600 mb-8">Browse our collection and find the perfect crackers for your special occasion</p>
          <div className="space-x-4">
            <Link href="/shop" className="btn btn-primary">
              Start Shopping
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
