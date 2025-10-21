import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Functions

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health', { timeout: 3000 });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Categories
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// Products
export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
  inStock?: boolean;
}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Settings
export const getSettings = async (category?: string) => {
  const params = category ? { category } : {};
  const response = await api.get('/settings', { params });
  return response.data;
};

// Site Settings
export const getSiteSettings = async () => {
  const response = await api.get('/settings/site');
  return response.data;
};

export const updateSiteSettings = async (settings: any) => {
  const response = await api.put('/settings/site', settings);
  return response.data;
};

// ===============================
// ADMIN DASHBOARD APIs
// ===============================

export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getRecentOrders = async (limit: number = 5) => {
  const response = await api.get('/admin/dashboard/recent-orders', { params: { limit } });
  return response.data;
};

export const getTodaysSummary = async () => {
  const response = await api.get('/admin/dashboard/todays-summary');
  return response.data;
};

export const getSalesAnalytics = async (period: 'week' | 'month' | 'year' = 'month') => {
  const response = await api.get('/admin/dashboard/analytics', { params: { period } });
  return response.data;
};

// ===============================
// ORDERS MANAGEMENT
// ===============================

export const getAdminOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  customer?: string;
}) => {
  const response = await api.get('/admin/orders', { params });
  return response.data;
};

export const updateOrderStatus = async (id: string, data: {
  orderStatus?: string;
  paymentStatus?: string;
  trackingNumber?: string;
}) => {
  const response = await api.put(`/admin/orders/${id}`, data);
  return response.data;
};

// ===============================
// CUSTOMERS MANAGEMENT
// ===============================

export const getAllCustomers = async (params?: {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/admin/customers', { params });
  return response.data;
};

// ===============================
// PRODUCTS MANAGEMENT
// ===============================

export const getAllProductsAdmin = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
}) => {
  const response = await api.get('/admin/products', { params });
  return response.data;
};

export const getProductByIdAdmin = async (id: string) => {
  const response = await api.get(`/admin/products/${id}`);
  return response.data;
};

export const createProduct = async (data: FormData) => {
  const response = await api.post('/admin/products', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProduct = async (id: string, data: FormData) => {
  const response = await api.put(`/admin/products/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
};

// ===============================
// CATEGORIES MANAGEMENT
// ===============================

export const getAllCategoriesAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const response = await api.get('/admin/categories', { params });
  return response.data;
};

export const getCategoryByIdAdmin = async (id: string) => {
  const response = await api.get(`/admin/categories/${id}`);
  return response.data;
};

export const createCategory = async (data: FormData) => {
  const response = await api.post('/admin/categories', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateCategory = async (id: string, data: FormData) => {
  const response = await api.put(`/admin/categories/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
};

// ===============================
// COUPONS MANAGEMENT
// ===============================

export const getAllCoupons = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}) => {
  const response = await api.get('/admin/coupons', { params });
  return response.data;
};

export const getCouponById = async (id: string) => {
  const response = await api.get(`/admin/coupons/${id}`);
  return response.data;
};

export const createCoupon = async (data: any) => {
  const response = await api.post('/admin/coupons', data);
  return response.data;
};

export const updateCoupon = async (id: string, data: any) => {
  const response = await api.put(`/admin/coupons/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: string) => {
  const response = await api.delete(`/admin/coupons/${id}`);
  return response.data;
};

// ===============================
// SETTINGS MANAGEMENT
// ===============================

export const getAdminSettings = async (category?: string) => {
  const params = category ? { category } : {};
  const response = await api.get('/admin/settings', { params });
  return response.data;
};

export const updateAdminSettings = async (settings: any) => {
  const response = await api.put('/admin/settings', settings);
  return response.data;
};

export const getSettingByKey = async (key: string) => {
  const response = await api.get(`/admin/settings/${key}`);
  return response.data;
};

// ===============================
// POS SYSTEM
// ===============================

export const createPOSOrder = async (orderData: {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount_amount?: number;
  total_amount: number;
  payment_method: 'cash' | 'card';
  cash_received?: number;
  change_amount?: number;
}) => {
  const response = await api.post('/admin/pos/order', orderData);
  return response.data;
};

// ===============================
// REPORTS AND ANALYTICS
// ===============================

export const getAnalyticsData = async (period: string = '30') => {
  const response = await api.get('/admin/reports/analytics', { params: { period } });
  return response.data;
};

export const getSalesChartData = async (period: string = '30') => {
  const response = await api.get('/admin/reports/sales-chart', { params: { period } });
  return response.data;
};

// Orders
export const createOrder = async (orderData: any) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getUserOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const downloadInvoice = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}/invoice`, {
    responseType: 'blob',
  });
  return response;
};

// Coupons
export const validateCoupon = async (code: string, orderAmount: number) => {
  const response = await api.post('/coupons/validate', {
    code,
    orderAmount,
  });
  return response.data;
};

// Auth
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: any;
}) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Contact
export const submitContactForm = async (formData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) => {
  const response = await api.post('/contact', formData);
  return response.data;
};

export default api;