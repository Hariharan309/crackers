'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  UserGroupIcon, 
  CurrencyRupeeIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  PresentationChartLineIcon,
  TicketIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
// import ProtectedRoute from '@/components/ProtectedRoute';
// import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, getRecentOrders, getTodaysSummary, healthCheck } from '@/lib/api';

function AdminDashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [todaysSummary, setTodaysSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('admin-auth');
    router.push('/admin/login');
  };


  // Fetch dashboard data
  useEffect(() => {
    if (!user) return; // Only fetch data when user is authenticated
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📊 Fetching dashboard data...');
        
        // Fetch data from API
        try {
          // Quick health check first
          await healthCheck();
          console.log('✅ Health check passed');
          
          const [statsResponse, ordersResponse, summaryResponse] = await Promise.all([
            getDashboardStats(),
            getRecentOrders(5),
            getTodaysSummary()
          ]);
          
          console.log('📈 API responses:', { statsResponse, ordersResponse, summaryResponse });

          if (statsResponse.success) {
            setStats(statsResponse.data);
          }
          
          if (ordersResponse.success) {
            setRecentOrders(ordersResponse.data || []);
          }
          
          if (summaryResponse.success) {
            setTodaysSummary(summaryResponse.data);
          }
        } catch (apiError) {
          console.error('❌ API Error:', apiError);
          setError('Failed to load dashboard data. Please check if the backend server is running.');
          setUsingFallbackData(true);
        }
        
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setError('Failed to connect to backend server. Please ensure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);
  // Dynamic stats data
  const statsCards = [
    { 
      name: 'Total Sales', 
      value: stats ? `₹${stats.total_sales.toLocaleString()}` : '₹0', 
      change: stats?.sales_change || '0%', 
      icon: CurrencyRupeeIcon 
    },
    { 
      name: 'Orders', 
      value: stats ? stats.total_orders.toString() : '0', 
      change: stats?.orders_change || '0%', 
      icon: ShoppingBagIcon 
    },
    { 
      name: 'Customers', 
      value: stats ? stats.total_customers.toString() : '0', 
      change: stats?.customers_change || '0%', 
      icon: UserGroupIcon 
    },
    { 
      name: 'Products', 
      value: stats ? stats.total_products.toString() : '0', 
      change: stats?.products_change || '0%', 
      icon: ClipboardDocumentListIcon 
    },
  ];

  const quickActions = [
    { name: 'Manage Products', href: '/admin/products', icon: ClipboardDocumentListIcon, color: 'bg-blue-500' },
    { name: 'View Orders', href: '/admin/orders', icon: ShoppingBagIcon, color: 'bg-green-500' },
    { name: 'Customer List', href: '/admin/customers', icon: UserGroupIcon, color: 'bg-purple-500' },
    { name: 'Categories', href: '/admin/categories', icon: ChartBarIcon, color: 'bg-yellow-500' },
    { name: 'POS System', href: '/admin/pos', icon: CurrencyRupeeIcon, color: 'bg-red-500' },
    { name: 'Site Settings', href: '/admin/settings', icon: CogIcon, color: 'bg-gray-500' },
    { name: 'Coupons', href: '/admin/coupons', icon: TicketIcon, color: 'bg-pink-500' },
    { name: 'Reports', href: '/admin/reports', icon: PresentationChartLineIcon, color: 'bg-indigo-500' },
  ];

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Show loading state while checking auth or fetching data
  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}! Here's what's happening with your store.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 mr-4">
                <span className="font-medium">{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                <br />
                <span>{user?.email}</span>
              </div>
              <Link href="/admin/pos" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                POS System
              </Link>
              <Link href="/" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
                View Store
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors flex items-center"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Error Banner */}
        {usingFallbackData && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Backend Connection Error:</strong> Unable to connect to the backend API.
                  <br />
                  <span className="text-xs">Please ensure your backend server is running on http://localhost:5000</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => {
            const isPositive = stat.change.startsWith('+');
            const isNegative = stat.change.startsWith('-');
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className={`${action.color} p-3 rounded-lg mb-2`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 text-center">{action.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Orders</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {todaysSummary?.new_orders || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{todaysSummary?.revenue?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Customers</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {todaysSummary?.new_customers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Orders</span>
                  <span className={`text-sm font-semibold ${
                    (todaysSummary?.pending_orders || 0) > 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {todaysSummary?.pending_orders || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View all
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.order_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customer_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{(order.total_amount || order.totalAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                              {order.order_status ? order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center">
                            <ShoppingBagIcon className="h-8 w-8 text-gray-300 mb-2" />
                            <span>No recent orders found</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dynamic Alerts - Only show if there are pending orders */}
            {todaysSummary && todaysSummary.pending_orders > 0 && (
              <div className="bg-white shadow rounded-lg mt-6 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
                <div className="space-y-3">
                  <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Pending Orders Alert:</strong> You have {todaysSummary.pending_orders} pending orders that need attention.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return <AdminDashboardContent />;
}
