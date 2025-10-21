'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { SparklesIcon, ShieldCheckIcon, TruckIcon, HeartIcon } from '@heroicons/react/24/outline'
import { getCategories } from '@/lib/api'
import { Category } from '@/types'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Features (kept minimal — can be fetched from API later if needed)
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

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories()
        if (response.success && response.data) {
          setCategories(response.data)
        } else {
          setError(response.message || 'Failed to load categories.')
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Something went wrong while fetching categories.')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

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
              <Link
                href="/shop"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/products"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                View Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600">
              We bring the best quality and service to make your celebrations memorable
            </p>
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

      {/* Categories Section (Dynamic) */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Categories</h2>
            <p className="text-xl text-gray-600">
              Explore our wide range of crackers and fireworks
            </p>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading categories...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                >
                  <div className="bg-white p-6 rounded-lg text-center hover:shadow-lg transition-shadow cursor-pointer">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        width={96}
                        height={96}
                        className="h-24 w-24 object-cover rounded-full mx-auto mb-3"
                      />
                    ) : (
                      <div className="text-4xl mb-3">🎆</div>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">No categories available.</div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Light Up Your Celebration?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Browse our collection and find the perfect crackers for your special occasion
          </p>
          <div className="space-x-4">
            <Link
              href="/shop"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
            <Link
              href="/contact"
              className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
