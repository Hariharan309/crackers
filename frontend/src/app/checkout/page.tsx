'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  CreditCardIcon, 
  BanknotesIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  UserIcon,
  ShoppingBagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { createOrder, getSiteSettings } from '@/lib/api';
import { Product } from '@/types';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, itemCount, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [gpayNumber, setGpayNumber] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  // Redirect if cart is empty and fetch payment settings
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.push('/cart');
    }
    
    // Fetch GPay number from settings
    const fetchPaymentSettings = async () => {
      try {
        const settings = await getSiteSettings();
        if (settings.success && settings.data) {
          setGpayNumber(settings.data.gpay_number || '+91 9876543210');
          setUpiId(settings.data.upi_id || 'yourname@paytm');
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
        // Use default values
        setGpayNumber('+91 9876543210');
        setUpiId('yourname@paytm');
      }
    };
    
    fetchPaymentSettings();
  }, [items, router, orderPlaced]);

  // Get product image helper function
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

  const taxAmount = total * 0.18;
  const finalTotal = total + taxAmount;

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '');
      setCustomerInfo(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setCustomerInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!customerInfo.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!customerInfo.phone.trim()) {
      setError('Phone is required');
      return false;
    }
    if (!customerInfo.address.street.trim()) {
      setError('Street address is required');
      return false;
    }
    if (!customerInfo.address.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!customerInfo.address.state.trim()) {
      setError('State is required');
      return false;
    }
    if (!customerInfo.address.zipCode.trim()) {
      setError('Zip code is required');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        customerInfo,
        items: items.map(item => ({
          product: item.product.id,
          name: item.product.name,
          price: item.product.discount_price || item.product.price,
          quantity: item.quantity,
          image: getProductImage(item.product)
        })),
        subtotal: total,
        taxAmount,
        totalAmount: finalTotal,
        paymentMethod: 'upi',
        orderType: 'online'
      };

      const response = await createOrder(orderData);

      if (response.success) {
        setOrderNumber(response.data.orderNumber);
        setOrderPlaced(true);
        clearCart();
      } else {
        setError(response.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Order placement error:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  // Order success page
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-lg text-gray-600 mb-2">Thank you for your order.</p>
            <p className="text-sm text-gray-500 mb-8">
              Order Number: <span className="font-mono font-semibold">{orderNumber}</span>
            </p>
            <div className="space-y-4">
              <Link 
                href="/products"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
              >
                Continue Shopping
              </Link>
              <div>
                <Link 
                  href="/"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link 
              href="/cart" 
              className="flex items-center text-primary-100 hover:text-white mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Cart
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Customer Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="street"
                      value={customerInfo.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your street address"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={customerInfo.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your city"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={customerInfo.address.state}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your state"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code *
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        value={customerInfo.address.zipCode}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter zip code"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        id="country"
                        value={customerInfo.address.country}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter your country"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Payment Details
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <PhoneIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-green-800">UPI Payment</h3>
                      <p className="text-green-700">Pay using GPay, PhonePe, or any UPI app</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-md p-3 border border-green-300">
                      <div className="text-sm text-gray-600 mb-1">GPay/PhonePe Number:</div>
                      <div className="font-mono text-lg font-semibold text-gray-900 select-all">
                        {gpayNumber}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-md p-3 border border-green-300">
                      <div className="text-sm text-gray-600 mb-1">UPI ID:</div>
                      <div className="font-mono text-lg font-semibold text-gray-900 select-all">
                        {upiId}
                      </div>
                    </div>
                    
                    <div className="text-sm text-green-700 bg-green-100 p-3 rounded-md">
                      <strong>Instructions:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Open your UPI app (GPay, PhonePe, Paytm, etc.)</li>
                        <li>Send ₹{finalTotal.toFixed(2)} to the above number or UPI ID</li>
                        <li>Take a screenshot of the payment confirmation</li>
                        <li>Click "Place Order" below to complete your order</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => {
                  const productImage = getProductImage(item.product);
                  const isImage = productImage.startsWith('http');
                  const itemPrice = item.product.discount_price || item.product.price;

                  return (
                    <div key={item.product.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {isImage ? (
                          <img
                            src={productImage}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center text-xl">
                            {productImage}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{itemPrice} x {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(itemPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (GST 18%)</span>
                  <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors mt-6 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Confirming Order...' : 'Confirm Order (After Payment)'}
              </button>

              {/* Safety Notice */}
              <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-800">
                  <strong>Safety Notice:</strong> Please read all instructions carefully before use. 
                  Keep water/sand nearby. Adult supervision required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}