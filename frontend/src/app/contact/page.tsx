'use client';

import { useState } from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export default function ContactPage() {
  const { settings, loading } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone',
      details: [settings.company_phone],
      description: 'Mon-Sat 9AM-8PM'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: [settings.company_email],
      description: '24/7 Support'
    },
    {
      icon: MapPinIcon,
      title: 'Address',
      details: [settings.company_address, `${settings.company_city}, ${settings.company_state} ${settings.company_pincode}`],
      description: 'Visit our showroom'
    },
    {
      icon: ClockIcon,
      title: 'Business Hours',
      details: ['Mon-Sat: 9:00 AM - 8:00 PM', 'Sunday: 10:00 AM - 6:00 PM'],
      description: 'We&apos;re here to help'
    }
  ];

  const branches = [
    {
      city: 'Chennai',
      address: '123 Main Street, T. Nagar, Chennai - 600001',
      phone: '+91 9876543210',
      timing: 'Mon-Sat: 9 AM - 8 PM'
    },
    {
      city: 'Bangalore',
      address: '456 MG Road, Bangalore - 560001',
      phone: '+91 9876543211',
      timing: 'Mon-Sat: 9 AM - 8 PM'
    },
    {
      city: 'Coimbatore',
      address: '789 RS Puram, Coimbatore - 641002',
      phone: '+91 9876543212',
      timing: 'Mon-Sat: 9 AM - 8 PM'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Get in touch with us for any questions, bulk orders, or special requirements
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">We&apos;re here to help with all your cracker needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info) => (
              <div key={info.title} className="text-center">
                <div className="flex justify-center mb-4">
                  <info.icon className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                {info.details.map((detail, index) => (
                  <p key={index} className="text-gray-600">{detail}</p>
                ))}
                <p className="text-sm text-primary-600 mt-1">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="bulk-order">Bulk Order</option>
                      <option value="product-info">Product Information</option>
                      <option value="support">Customer Support</option>
                      <option value="complaint">Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell us more about your requirements..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Map/Additional Info */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Visit Our Store</h3>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Main Showroom</h4>
                <div className="space-y-2 text-gray-600">
                  <p>📍 123 Main Street, T. Nagar</p>
                  <p>Chennai, Tamil Nadu - 600001</p>
                  <p>📞 +91 9876543210</p>
                  <p>🕒 Mon-Sat: 9:00 AM - 8:00 PM</p>
                  <p>🕒 Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
              
              {/* Quick Contact Options */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Quick Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center justify-center bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    Call Now
                  </a>
                  <a
                    href="mailto:info@crackershop.com"
                    className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branch Locations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Branches</h2>
            <p className="text-xl text-gray-600">Visit any of our convenient locations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {branches.map((branch) => (
              <div key={branch.city} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{branch.city}</h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-start">
                    <MapPinIcon className="h-5 w-5 mr-2 mt-0.5 text-primary-600" />
                    {branch.address}
                  </p>
                  <p className="flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-2 text-primary-600" />
                    {branch.phone}
                  </p>
                  <p className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-primary-600" />
                    {branch.timing}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer home delivery?</h3>
              <p className="text-gray-600 mb-4">Yes, we offer home delivery across 100+ cities with proper safety packaging.</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What are your bulk order discounts?</h3>
              <p className="text-gray-600 mb-4">We offer attractive discounts for bulk orders. Contact us for custom pricing.</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are your products safety certified?</h3>
              <p className="text-gray-600">All our products meet safety standards and have proper certifications.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I return unused products?</h3>
              <p className="text-gray-600 mb-4">Due to safety regulations, we don&apos;t accept returns. However, we ensure quality before delivery.</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you have eco-friendly options?</h3>
              <p className="text-gray-600 mb-4">Yes, we offer a range of eco-friendly and low-noise crackers.</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How can I track my order?</h3>
              <p className="text-gray-600">You&apos;ll receive tracking information via SMS and email once your order is dispatched.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}