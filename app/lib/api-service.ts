import api from './axios';
import { API_ENDPOINTS } from './api-config';

// Types for API responses
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  customer?: T;
  product?: T;
  order?: T;
  review?: T;
  address?: T;
  fileName?: string;
}

// Customer API Service
export class CustomerApiService {
  // GET - Fetch customer profile
  static async getProfile(): Promise<ApiResponse> {
    const response = await api.get(API_ENDPOINTS.CUSTOMER_PROFILE);
    return response.data;
  }

  // PUT - Update customer profile
  static async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
  }): Promise<ApiResponse> {
    const response = await api.put('/customer/me', profileData);
    return response.data;
  }

  // POST - Upload profile image
  static async uploadProfileImage(imageFile: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/customer/profileImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // DELETE - Delete customer account
  static async deleteAccount(customerId: string): Promise<ApiResponse> {
    const response = await api.delete(`/customer/${customerId}/remove`);
    return response.data;
  }

  // POST - Add new address
  static async addAddress(addressData: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    addressType?: string;
  }): Promise<ApiResponse> {
    const response = await api.post('/customer/addresses', addressData);
    return response.data;
  }

  // PUT - Update address
  static async updateAddress(addressId: string, addressData: {
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    addressType?: string;
  }): Promise<ApiResponse> {
    const response = await api.put(`/customer/updateAddress/${addressId}`, addressData);
    return response.data;
  }

  // DELETE - Remove address
  static async removeAddress(addressId: string): Promise<ApiResponse> {
    const response = await api.delete(`/customer/me/addresses/${addressId}`);
    return response.data;
  }
}

// Product API Service
export class ProductApiService {
  // GET - Fetch all products
  static async getAllProducts(params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<ApiResponse> {
    const response = await api.get(API_ENDPOINTS.PRODUCTS, { params });
    return response.data;
  }

  // GET - Fetch single product
  static async getProduct(productId: string): Promise<ApiResponse> {
    const response = await api.get(process.env.NEXT_PUBLIC_API_URL + `/product/${productId}`);
    return response.data;
  }
}

// Order API Service
export class OrderApiService {
  // GET - Fetch customer orders
  static async getCustomerOrders(): Promise<ApiResponse> {
    const response = await api.get(API_ENDPOINTS.CUSTOMER_ORDERS);
    return response.data;
  }

  // GET - Fetch single order
  static async getOrder(orderId: string): Promise<ApiResponse> {
    const response = await api.get(API_ENDPOINTS.ORDER_BY_ID(orderId));
    return response.data;
  }

  // POST - Create new order
  static async createOrder(orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: string;
    paymentMethod: string;
    totalAmount: number;
  }): Promise<ApiResponse> {
    const response = await api.post(API_ENDPOINTS.ORDERS, orderData);
    return response.data;
  }

  // PATCH - Update order status (admin functionality)
  static async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse> {
    const response = await api.patch(`${API_ENDPOINTS.ORDERS}/${orderId}/status`, { status });
    return response.data;
  }

  // POST - Cancel order
  static async cancelOrder(orderId: string): Promise<ApiResponse> {
    const response = await api.post(API_ENDPOINTS.CANCEL_ORDER(orderId));
    return response.data;
  }

  // DELETE - Delete order
  static async deleteOrder(orderId: string): Promise<ApiResponse> {
    const response = await api.delete(API_ENDPOINTS.DELETE_ORDER(orderId));
    return response.data;
  }
}

// Review API Service
export class ReviewApiService {
  // GET - Fetch product reviews
  static async getProductReviews(productId: string): Promise<ApiResponse> {
    const response = await api.get(API_ENDPOINTS.PRODUCT_REVIEWS(productId));
    return response.data;
  }

  // GET - Fetch customer reviews
  static async getCustomerReviews(): Promise<ApiResponse> {
    const response = await api.get(API_ENDPOINTS.CUSTOMER_REVIEWS);
    return response.data;
  }

  // POST - Create review
  static async createReview(reviewData: {
    productId: number;
    rating: number;
    comment: string;
    orderId?: number;
  }): Promise<ApiResponse> {
    const response = await api.post(API_ENDPOINTS.REVIEWS, reviewData);
    return response.data;
  }

  // PUT - Update review
  static async updateReview(reviewId: string, reviewData: {
    rating?: number;
    comment?: string;
  }): Promise<ApiResponse> {
    const response = await api.put(API_ENDPOINTS.REVIEW_BY_ID(reviewId), reviewData);
    return response.data;
  }

  // DELETE - Delete review
  static async deleteReview(reviewId: string): Promise<ApiResponse> {
    const response = await api.delete(API_ENDPOINTS.REVIEW_BY_ID(reviewId));
    return response.data;
  }

  // GET - Get product rating stats
  static async getProductRatingStats(productId: string): Promise<ApiResponse> {
    const response = await api.get(API_ENDPOINTS.PRODUCT_RATING_STATS(productId));
    return response.data;
  }
}

// Category API Service
export class CategoryApiService {
  // GET - Fetch all categories
  static async getAllCategories(): Promise<ApiResponse> {
    const response = await api.get(API_ENDPOINTS.CATEGORIES);
    return response.data;
  }

  // GET - Fetch single category
  static async getCategory(categoryId: number): Promise<ApiResponse> {
    const response = await api.get(API_ENDPOINTS.CATEGORY_BY_ID(categoryId));
    return response.data;
  }
}

// Cart API Service (if you have cart endpoints)
export class CartApiService {
  // POST - Add item to cart
  static async addToCart(productId: string, quantity: number): Promise<ApiResponse> {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  }

  // PUT - Update cart item quantity
  static async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse> {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  }

  // DELETE - Remove item from cart
  static async removeFromCart(itemId: string): Promise<ApiResponse> {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  }

  // GET - Get cart contents
  static async getCart(): Promise<ApiResponse> {
    const response = await api.get('/cart');
    return response.data;
  }

  // DELETE - Clear entire cart
  static async clearCart(): Promise<ApiResponse> {
    const response = await api.delete('/cart/clear');
    return response.data;
  }
}

export {
  CustomerApiService as Customer,
  ProductApiService as Product,
  OrderApiService as Order,
  ReviewApiService as Review,
  CategoryApiService as Category,
  CartApiService as Cart,
};
