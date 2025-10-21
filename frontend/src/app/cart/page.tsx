'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon, 
  ShoppingBagIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const { items, total, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    // Redirect to checkout page
    setTimeout(() => {
      setIsLoading(false);
      router.push('/checkout');
    }, 500);
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="bg-primary-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Link 
                href="/shop" 
                className="flex items-center text-primary-100 hover:text-white mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Shop
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
            </div>
          </div>
        </div>

        {/* Empty state */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBagIcon className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Add some crackers to your cart to get started with your celebration!
            </p>
            <Link 
              href="/shop"
              className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-primary-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/shop" 
                className="flex items-center text-primary-100 hover:text-white mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Shop
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
            </div>
            <div className="text-right">
              <p className="text-primary-100">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-200 rounded-lg">
              {/* Clear cart button */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Items list */}
              <div className="divide-y divide-gray-200">
                {items.map((item) => {
                  const productImage = getProductImage(item.product);
                  const isImage = productImage.startsWith('http');
                  const itemPrice = item.product.discount_price || item.product.price;

                  return (
                    <div key={item.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {isImage ? (
                            <img
                              src={productImage}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center text-3xl">
                              {productImage}
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.product.description}
                          </p>
                          <div className="mt-2">
                            <span className="text-lg font-semibold text-gray-900">
                              ₹{itemPrice}
                            </span>
                            {item.product.discount_price && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ₹{item.product.price}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ₹{(itemPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{(total * 0.18).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{(total * 1.18).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors mt-6 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <Link 
                href="/shop"
                className="block text-center text-primary-600 hover:text-primary-700 mt-4 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
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