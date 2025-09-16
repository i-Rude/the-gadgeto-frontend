// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const sanitizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  console.log('Building API URL:', `${baseUrl}${sanitizedEndpoint}`); // Debug log
  return `${baseUrl}${sanitizedEndpoint}`;
};

// Helper function to build image URLs with additional options
export const buildImageUrl = (fileName: string, options?: { size?: 'small' | 'medium' | 'large' }): string => {
  if (!fileName) return '/product/default-product.webp'; // Default image path

  try {
    // Ensure the URL is properly encoded to handle spaces and special characters
    const encodedFileName = encodeURIComponent(fileName);
    
    // Base URL for images
    const baseUrl = `${API_BASE_URL}/upload`;

    // Handle different image sizes if implemented on the backend
    if (options?.size) {
      return `${baseUrl}/${options.size}/${encodedFileName}`;
    }

    // Regular image URL
    return `${baseUrl}/${encodedFileName}`;
  } catch (error) {
    console.error('Error building image URL:', error);
    return '/product/default-product.webp'; // Fallback to default image
  }
};

// API Request Configurations
export const API_CONFIG = {
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const MULTIPART_CONFIG = {
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VERIFY: '/auth/verify',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Category endpoints
  CATEGORIES: '/category',
  CATEGORY_BY_ID: (id: number) => `/category/${id}`,
  CATEGORY_CREATE: '/category',
  CATEGORY_UPDATE: (id: number) => `/category/${id}`,
  CATEGORY_DELETE: (id: number) => `/category/${id}`,

  // Customer endpoints
  CUSTOMER_REGISTER: '/customer/add',
  CUSTOMER_PROFILE: '/customer/profile',
  CUSTOMER_UPDATE: '/customer/me',
  CUSTOMER_PROFILE_IMAGE: '/customer/profileImage',
  CUSTOMER_DELETE: (id: string) => `/customer/${id}/remove`,
  CUSTOMER_ADDRESSES: '/customer/addresses',
  CUSTOMER_ADDRESS_UPDATE: (id: string) => `/customer/updateAddress/${id}`,

  // Product endpoints
  PRODUCTS: '/product', // GET all products (from ProductController @Get())
  PRODUCT_DETAILS: (id: string) => `/product/${id}`, // GET product by ID
  PRODUCT_CREATE: '/product/add', // POST new product
  PRODUCT_UPDATE: (id: number) => `/product/seller/${id}`, // PUT update product
  PRODUCT_DELETE: (id: number) => `/product/seller/${id}`, // DELETE product
  PRODUCT_DISCOUNT: (id: number) => `/product/${id}/discount`, // PATCH apply discount
  SELLER_PRODUCTS: '/product/seller/myProducts', // GET seller's products
  
  CUSTOMER_ADDRESS_DELETE: (id: string) => `/customer/me/addresses/${id}`,
  
  // Order endpoints
  ORDERS: '/orders',
  CUSTOMER_ORDERS: '/orders/customer/my-orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  ORDER_STATUS_UPDATE: (id: string) => `/orders/${id}/status`,
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,
  DELETE_ORDER: (id: string) => `/orders/${id}`,
  ORDER_INVOICE: (id: string) => `/orders/${id}/invoice`,
  
  // Review endpoints
  REVIEWS: '/reviews',
  PRODUCT_REVIEWS: (productId: string) => `/reviews/product/${productId}`,
  CUSTOMER_REVIEWS: '/reviews/customer/my-reviews',
  REVIEW_BY_ID: (id: string) => `/reviews/${id}`,
  PRODUCT_RATING_STATS: (productId: string) => `/reviews/product/${productId}/stats`,
  
  // Cart endpoints (if implemented in backend)
  CART: '/cart',
  CART_ADD: '/cart/add',
  CART_ITEM_UPDATE: (id: string) => `/cart/items/${id}`,

  // Additional endpoints
  SELLER_ORDERS: '/seller/me/orders',
  CART_ITEM_DELETE: (id: string) => `/cart/items/${id}`,
  CART_CLEAR: '/cart/clear',
} as const;


