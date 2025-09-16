//CSR
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { API_ENDPOINTS, buildApiUrl } from '../../../lib/api-config';

import { formatPrice, ensureNumber } from '../../../lib/utils';

interface Order {
  id: number;
  totalAmount: string | number;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  phoneNumber?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  customer?: {
    id: string;
    fullName: string;
  };
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: number;
    name: string;
    fileName?: string;
  };
}

interface User {
  id: string;
  email: string;
  role: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.CUSTOMER_ORDERS), {
        withCredentials: true
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push('/customer/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      await axios.post(buildApiUrl(API_ENDPOINTS.CANCEL_ORDER(orderId.toString())), {}, {
        withCredentials: true
      });
      
      // Refresh orders after successful cancellation
      await fetchOrders();
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to cancel order';
        alert(errorMessage);
      } else {
        alert('Failed to cancel order. Please try again.');
      }
    } finally {
      setCancellingOrder(null);
    }
  };

    const handleDownloadInvoice = async (orderId: string) => {
    try {
      console.log('Downloading invoice for order:', orderId);
      
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.ORDER_INVOICE(orderId)), {
        responseType: 'blob',
        withCredentials: true  // Include authentication cookies
      });
      
      console.log('Invoice response:', response);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-gray-200 text-gray-800';
      case 'processing':
        return 'bg-black text-white';
      case 'shipped':
        return 'bg-gray-600 text-white';
      case 'delivered':
        return 'bg-black text-white';
      case 'cancelled':
        return 'bg-white text-black border border-black';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          <Header activeTab="orders" />
          <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header activeTab="orders" />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-black">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/customer/dashboard" className="text-gray-700 hover:text-black">
                  Dashboard
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">My Orders</span>
              </div>
            </li>
          </ol>
        </nav>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.toString().padStart(8, '0')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                        <p className="text-sm text-gray-600">{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Order Items</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            {/* Image section removed - empty space */}
                            <div className="text-gray-400 text-2xl">�</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(item.totalPrice)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition duration-300"
                      >
                        View Details
                      </button>
                      
                      {order.status.toLowerCase() === 'delivered' && (
                        <Link
                          href={`/customer/orders/${order.id}/review`}
                          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition duration-300 text-center"
                        >
                          Write Review
                        </Link>
                      )}

                      {['pending', 'processing'].includes(order.status.toLowerCase()) && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrder === order.id}
                          className="bg-white text-black border border-black px-4 py-2 rounded-md hover:bg-gray-100 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}

                      <button 
                        onClick={() => handleDownloadInvoice(order.id.toString())}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
                      >
                        Download Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-8xl mb-6">🛒</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Orders Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/customer/products"
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-300"
              >
                Browse Products
              </Link>
              <Link 
                href="/customer/categories"
                className="bg-gray-200 text-gray-900 px-6 py-3 rounded-md hover:bg-gray-300 transition duration-300"
              >
                Shop by Category
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details #{selectedOrder.id.toString().padStart(8, '0')}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Order Date</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">{formatPrice(selectedOrder.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Items</p>
                      <p className="text-sm text-gray-900">{selectedOrder.orderItems.length} item(s)</p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            {/* Image section removed - empty space */}
                            <div className="text-gray-400">�</div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatPrice(item.totalPrice)}</p>
                          <p className="text-sm text-gray-600">{formatPrice(item.unitPrice)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
    </ProtectedRoute>
  );
}
