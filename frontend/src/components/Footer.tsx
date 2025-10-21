'use client';

import Link from 'next/link';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings, loading } = useSiteSettings();

  // Show loading state while fetching settings
  if (loading || !settings) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold mb-4">
              🎆 {settings.company_name}
            </div>
            <p className="text-gray-300 mb-4">
              {settings.company_description}
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-primary-500" />
                <span className="text-sm">
                  {settings.company_address}, {settings.company_city}, {settings.company_state}, {settings.company_country}
                  {settings.company_pincode && ` - ${settings.company_pincode}`}
                </span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-primary-500" />
                <span className="text-sm">{settings.company_phone}</span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-primary-500" />
                <span className="text-sm">{settings.company_email}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-primary-500 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-300 hover:text-primary-500 transition-colors">
                  Shop Now
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary-500 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop?category=ground-crackers" className="text-gray-300 hover:text-primary-500 transition-colors">
                  Ground Crackers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=aerial-fireworks" className="text-gray-300 hover:text-primary-500 transition-colors">
                  Aerial Fireworks
                </Link>
              </li>
              <li>
                <Link href="/shop?category=sparklers" className="text-gray-300 hover:text-primary-500 transition-colors">
                  Sparklers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=fountains" className="text-gray-300 hover:text-primary-500 transition-colors">
                  Fountains
                </Link>
              </li>
              <li>
                <Link href="/shop?category=gift-boxes" className="text-gray-300 hover:text-primary-500 transition-colors">
                  Gift Boxes
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} {settings.company_name}. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-primary-500 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-primary-500 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/admin" className="text-gray-400 hover:text-primary-500 text-sm transition-colors">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}