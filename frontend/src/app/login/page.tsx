'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to admin login after a short delay
    const timer = setTimeout(() => {
      router.push('/admin/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-600 p-4 rounded-full">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 2.676-.732 5.162-2.056 7.323-3.957.146-.129.284-.261.418-.396A12.015 12.015 0 0021 9a12.02 12.02 0 00-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">🎆 Cracker Shop Login</h2>
          <p className="mt-2 text-sm text-gray-600">Redirecting to admin login...</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center space-y-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                This will redirect you to the admin login page in a few seconds...
              </p>
              
              <div className="space-y-3">
                <Link 
                  href="/admin/login" 
                  className="flex items-center justify-center w-full bg-primary-600 text-white px-4 py-3 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Go to Admin Login
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
                
                <Link 
                  href="/" 
                  className="flex items-center justify-center w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Access</h3>
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="font-medium text-gray-900">Default Admin:</div>
            <div className="text-gray-600">Email: admin@example.com</div>
            <div className="text-gray-600">Password: StrongPass123</div>
          </div>
        </div>
      </div>
    </div>
  );
}