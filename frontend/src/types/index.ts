// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  address_country?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
  image_public_id?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  productCount?: number;
}

// Product types
export interface ProductImage {
  id: number;
  product_id: number;
  public_id: string;
  url: string;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  category_id: number;
  category?: Category;
  stock: number;
  sku: string;
  weight?: number;
  unit: 'piece' | 'packet' | 'box' | 'kg' | 'gram';
  is_active: boolean;
  is_featured: boolean;
  tags?: string;
  ratings_average: number;
  ratings_count: number;
  views: number;
  sales: number;
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

// Order types
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  product_image?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  user?: User;
  
  // Customer Information
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address_street: string;
  customer_address_city: string;
  customer_address_state: string;
  customer_address_zip_code: string;
  customer_address_country: string;
  
  // Order Details
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  discount_type: 'percentage' | 'fixed';
  coupon_code?: string;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  
  // Status
  payment_method: 'cash' | 'card' | 'upi' | 'netbanking';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  order_type: 'online' | 'pos';
  
  // Additional Info
  notes?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  
  created_at: string;
  updated_at: string;
}

// Settings types
export interface Setting {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  category: 'general' | 'company' | 'payment' | 'shipping' | 'tax' | 'email';
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  company_logo?: string;
  company_website?: string;
}

// Coupon types
export interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  user_usage_limit: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage?: number;
    prevPage?: number;
  };
  errors?: any[];
}

// Admin Dashboard types
export interface AdminDashboardStats {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  sales_change: string;
  orders_change: string;
  customers_change: string;
  products_change: string;
}

export interface DashboardOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TodaysSummary {
  new_orders: number;
  revenue: number;
  new_customers: number;
  pending_orders: number;
}

export interface SalesAnalytics {
  daily_sales: Array<{
    date: string;
    amount: number;
    orders: number;
  }>;
  monthly_sales: Array<{
    month: string;
    amount: number;
    orders: number;
  }>;
  top_products: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  top_categories: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

// Legacy dashboard type for compatibility
export interface DashboardStats {
  stats: {
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalSales: number;
  };
  recentOrders: Order[];
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
}

// Cart types (for frontend state)
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
}

// Filter types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PriceRange {
  id: string;
  name: string;
  min: number;
  max: number;
}