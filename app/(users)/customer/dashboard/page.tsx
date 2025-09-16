// CSR: Client-Side Rendering for personalized dashboard
// Dashboard requires user authentication, personalized data, and dynamic content updates
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Header from '@/app/components/Header';
import { API_ENDPOINTS, buildApiUrl, buildImageUrl } from '@/app/lib/api-config';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Customer {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  fileName?: string;
  addresses: Address[];
  orders: Order[];
  reviews: Review[];
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    fileName?: string;
  };
}

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCustomerProfile();
    }
  }, [user]);

  const fetchCustomerProfile = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.CUSTOMER_PROFILE), {
        withCredentials: true
      });
      setCustomer(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/customer/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!customer) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h2>
            <Link href="/customer/login" className="text-blue-600 hover:text-blue-800">
              Return to login
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header activeTab="dashboard" />
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-1/4 mb-8 md:mb-0">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  {customer.fileName ? (
                    <img 
                      src={buildImageUrl(customer.fileName)}
                      alt={customer.fullName} 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xl font-medium text-gray-600">
                        {customer.fullName?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{customer.fullName}</h3>
                    <p className="text-sm text-gray-600">@{customer.username}</p>
                  </div>
                </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-md transition duration-300 ${
                    activeTab === 'overview' 
                      ? 'bg-black text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-md transition duration-300 ${
                    activeTab === 'profile' 
                      ? 'bg-black text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-2 rounded-md transition duration-300 ${
                    activeTab === 'orders' 
                      ? 'bg-black text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full text-left px-4 py-2 rounded-md transition duration-300 ${
                    activeTab === 'reviews' 
                      ? 'bg-black text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  My Reviews
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4 md:ml-8">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black mb-2">Total Orders</h3>
                    <p className="text-3xl font-bold text-black">{customer.orders?.length || 0}</p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Reviews Given</h3>
                    <p className="text-3xl font-bold text-green-600">{customer.reviews?.length || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                    {customer.orders?.length ? (
                      customer.orders
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 3)
                        .map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 mb-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Order #{order.id.toString().padStart(8, '0')}</p>
                              <p className="text-sm text-gray-600">${parseFloat(order.totalAmount.toString()).toFixed(2)}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No orders yet</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Link 
                        href="/customer/products" 
                        className="block w-full bg-black text-white text-center py-3 px-4 rounded-md hover:bg-gray-800 transition duration-300"
                      >
                        Browse Products
                      </Link>
                      <Link 
                        href="/customer/orders" 
                        className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition duration-300"
                      >
                        View All Orders
                      </Link>
                      <button 
                        onClick={() => setActiveTab('profile')}
                        className="block w-full bg-gray-600 text-white text-center py-3 px-4 rounded-md hover:bg-gray-700 transition duration-300"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <p className="mt-1 text-sm text-gray-900">@{customer.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.dateOfBirth 
                        ? new Date(customer.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Not provided'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.gender 
                        ? customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)
                        : 'Not provided'
                      }
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link 
                      href="/customer/profile/edit"
                      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition duration-300"
                    >
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
                  <Link 
                    href="/customer/orders" 
                    className="text-black hover:text-gray-600 text-sm font-medium"
                  >
                    View All Orders →
                  </Link>
                </div>
                {customer.orders?.length ? (
                  <div className="space-y-4">
                    {customer.orders
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5) // Show only 5 most recent orders
                      .map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">Order #{order.id.toString().padStart(8, '0')}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-600 font-semibold">${parseFloat(order.totalAmount.toString()).toFixed(2)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Link 
                              href={`/customer/orders/${order.id}`}
                              className="text-black hover:text-gray-600 text-sm font-medium"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {customer.orders.length > 5 && (
                      <div className="text-center pt-4">
                        <Link 
                          href="/customer/orders"
                          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition duration-300"
                        >
                          View All {customer.orders.length} Orders
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">🛒</div>
                    <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                    <Link 
                      href="/customer/products"
                      className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-300"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}


            {activeTab === 'reviews' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
                  <Link 
                    href="/customer/orders" 
                    className="text-black hover:text-gray-600 text-sm font-medium"
                  >
                    Find products to review →
                  </Link>
                </div>
                {customer.reviews?.length ? (
                  <div className="space-y-4">
                    {customer.reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex text-yellow-400 mr-3">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                  ★
                                </span>
                              ))}
                            </div>
                            {review.product && (
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">
                                  {review.product.name}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                        
                        {/* Image section removed - empty space */}
                        <div className="mt-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-md border flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">📦</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">⭐</div>
                    <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
                    <Link 
                      href="/customer/orders"
                      className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-300"
                    >
                      Browse Your Orders
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
