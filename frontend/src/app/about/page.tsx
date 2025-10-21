'use client';

import { CheckCircleIcon, StarIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export default function AboutPage() {
  const { settings, loading } = useSiteSettings();

  // Show loading state while fetching settings
  if (loading || !settings) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }
  const stats = [
    { name: 'Years of Experience', value: '29+' },
    { name: 'Happy Customers', value: '50,000+' },
    { name: 'Products Available', value: '500+' },
    { name: 'Cities Served', value: '100+' },
  ]

  const values = [
    {
      name: 'Safety First',
      description: 'We prioritize safety in all our products and follow strict quality standards.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Quality Assurance',
      description: 'Every product undergoes rigorous testing to ensure the best experience.',
      icon: CheckCircleIcon,
    },
    {
      name: 'Customer Satisfaction',
      description: 'Your happiness and satisfaction are at the heart of everything we do.',
      icon: HeartIcon,
    },
    {
      name: 'Excellence',
      description: 'We strive for excellence in products, service, and customer experience.',
      icon: StarIcon,
    },
  ]

  const milestones = [
    { year: '1995', event: 'Founded Cracker Shop with a small team in Chennai' },
    { year: '2000', event: 'Expanded to serve 10 major cities across Tamil Nadu' },
    { year: '2005', event: 'Introduced online ordering and home delivery services' },
    { year: '2010', event: 'Became the largest cracker retailer in South India' },
    { year: '2015', event: 'Launched eco-friendly and low-noise cracker range' },
    { year: '2020', event: 'Expanded nationwide with 100+ cities coverage' },
    { year: '2024', event: 'Celebrating 29 years of bringing joy to celebrations' },
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About {settings.company_name}</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Bringing light, joy, and sparkle to your celebrations since {settings.established_year}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in {settings.established_year} in {settings.company_city}, {settings.company_name} began as a small family business with a big dream - 
                  to bring the highest quality crackers and fireworks to every celebration across India.
                </p>
                <p>
                  What started as a single store has now grown into one of India's most trusted names in 
                  the crackers industry, serving over 50,000 happy customers across 100+ cities.
                </p>
                <p>
                  Our commitment to quality, safety, and customer satisfaction has remained unchanged throughout 
                  our journey. We carefully source our products from certified manufacturers and conduct 
                  rigorous quality checks to ensure every cracker meets our high standards.
                </p>
                <p>
                  Today, we're proud to offer over 500 different products, from traditional crackers to 
                  eco-friendly alternatives, making us your one-stop destination for all celebration needs.
                </p>
              </div>
            </div>
            <div className="bg-primary-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <blockquote className="text-lg text-gray-700 italic mb-4">
                "To illuminate every celebration with safe, high-quality crackers while preserving 
                the joy and tradition of Indian festivities."
              </blockquote>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Premium quality products</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Safety-first approach</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Eco-friendly options</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <span>Exceptional customer service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey in Numbers</h2>
            <p className="text-xl text-gray-600">These numbers reflect our commitment and growth over the years</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.name} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-700 font-medium">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.name} className="text-center">
                <div className="flex justify-center mb-4">
                  <value.icon className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.name}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our 29-year journey</p>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex items-center">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-bold text-primary-600">{milestone.year}</span>
                </div>
                <div className="flex-shrink-0 mx-8">
                  <div className="w-4 h-4 bg-primary-600 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-gray-700">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Commitment</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are committed to maintaining the highest standards of quality and safety while 
              preserving the joy and tradition of celebrations. Our experienced team works 
              tirelessly to bring you the best products and services.
            </p>
          </div>
          <div className="bg-primary-600 text-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Thank You for 29 Amazing Years!</h3>
            <p className="text-lg">
              Your trust and support have made us who we are today. Here's to many more years 
              of lighting up your celebrations together!
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}