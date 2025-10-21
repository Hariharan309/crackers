'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { getAnalyticsData, getSalesChartData, getAllProductsAdmin } from '@/lib/api';

function ReportsContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [salesChart, setSalesChart] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const authData = localStorage.getItem('admin-auth');
    
    if (!token || !authData) {
      router.push('/admin/login');
      return;
    }
    
    try {
      const { user: userData, timestamp } = JSON.parse(authData);
      const isNotExpired = Date.now() - timestamp < 24 * 60 * 60 * 1000;
      
      if (isNotExpired && userData) {
        setUser(userData);
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('admin-auth');
        router.push('/admin/login');
      }
    } catch (e) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('admin-auth');
      router.push('/admin/login');
    }
  }, [router]);

  // Fetch analytics data
  useEffect(() => {
    if (user) {
      fetchReportsData();
    }
  }, [user, period]);

  const fetchReportsData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const [analyticsResponse, salesChartResponse, productsResponse] = await Promise.all([
        getAnalyticsData(period),
        getSalesChartData(period),
        getAllProductsAdmin({ limit: 10 })
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
      
      if (salesChartResponse.success) {
        setSalesChart(salesChartResponse.data || []);
      }
      
      if (productsResponse.success) {
        setTopProducts(productsResponse.data?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center">
                <Link
                  href="/admin"
                  className="text-primary-600 hover:text-primary-700 mr-4"
                >
                  ← Back to Dashboard
                </Link>
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                  <p className="text-gray-600">View sales reports and business analytics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{analytics?.metrics?.total_revenue?.toLocaleString() || '0'}
                </p>
                <p className={`text-sm ${
                  (analytics?.metrics?.revenue_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics?.metrics?.revenue_growth >= 0 ? '+' : ''}{analytics?.metrics?.revenue_growth?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.metrics?.total_orders || 0}
                </p>
                <p className={`text-sm ${
                  (analytics?.metrics?.orders_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics?.metrics?.orders_growth >= 0 ? '+' : ''}{analytics?.metrics?.orders_growth?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.metrics?.total_customers || 0}
                </p>
                <p className={`text-sm ${
                  (analytics?.metrics?.customers_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics?.metrics?.customers_growth >= 0 ? '+' : ''}{analytics?.metrics?.customers_growth?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentChartBarIcon className="h-8 w-8 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{analytics?.metrics?.avg_order_value?.toLocaleString() || '0'}
                </p>
                <p className={`text-sm ${
                  (analytics?.metrics?.aov_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics?.metrics?.aov_growth >= 0 ? '+' : ''}{analytics?.metrics?.aov_growth?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
              {salesChart.length > 0 ? (
                <div className="space-y-3">
                  {salesChart.slice(0, 7).map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{data.date}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">₹{data.revenue?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-gray-500">{data.orders || 0} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No sales data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
              {topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <div className="text-sm font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">Stock: {product.stock}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">₹{product.price}</div>
                        <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DocumentChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No product data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return <ReportsContent />;
}
