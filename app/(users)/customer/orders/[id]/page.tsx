'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { API_ENDPOINTS, buildApiUrl } from '../../../../lib/api-config';

import { ensureNumber, formatPrice } from '../../../../lib/utils';

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
    email: string;
  };
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const params = useParams();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(buildApiUrl(API_ENDPOINTS.ORDER_BY_ID(params.id as string)), {
          withCredentials: true,
        });
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Order not found or access denied');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-100';
      case 'PROCESSING':
        return 'text-purple-600 bg-purple-100';
      case 'SHIPPED':
        return 'text-indigo-600 bg-indigo-100';
      case 'DELIVERED':
        return 'text-green-600 bg-green-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusProgress = (status: string) => {
    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statuses.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0;
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancelling(true);
    try {
      await axios.post(buildApiUrl(API_ENDPOINTS.CANCEL_ORDER(order.id.toString())), {}, {
        withCredentials: true
      });
      
      // Refresh order data
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.ORDER_BY_ID(params.id as string)), {
        withCredentials: true,
      });
      setOrder(response.data);
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
      setCancelling(false);
    }
  };

    const handleDownloadInvoice = async () => {
    try {
      const orderId = params.id;
      if (!orderId) {
        alert('Order ID not found');
        return;
      }
      
      console.log('Downloading invoice for order:', orderId);
      
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.ORDER_INVOICE(orderId.toString())), {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-semibold text-black mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-8">{error || 'The order you are looking for does not exist.'}</p>
            <Link
              href="/customer/orders"
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-300"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/customer/orders"
              className="text-black hover:text-gray-600 mb-4 flex items-center"
            >
              ← Back to Orders
            </Link>
            <h1 className="text-3xl font-bold text-black">Order #{order.id}</h1>
            <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </div>
        </div>

        {/* Order Progress */}
        <div className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold text-black mb-4">Order Progress</h2>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-500"
                style={{ width: `${getStatusProgress(order.status)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className={order.status === 'PENDING' ? 'text-black font-semibold' : ''}>Pending</span>
              <span className={order.status === 'CONFIRMED' ? 'text-black font-semibold' : ''}>Confirmed</span>
              <span className={order.status === 'PROCESSING' ? 'text-black font-semibold' : ''}>Processing</span>
              <span className={order.status === 'SHIPPED' ? 'text-black font-semibold' : ''}>Shipped</span>
              <span className={order.status === 'DELIVERED' ? 'text-black font-semibold' : ''}>Delivered</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Order Items</h2>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {order.orderItems.map((item) => (
              <div key={item.id} className="p-6 flex items-center space-x-4">
                {/* Image section removed - empty space */}
                <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">📦</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-black">{item.product.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-gray-600">Price: {formatPrice(item.unitPrice)} each</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-black">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>৳0.00</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-lg font-semibold text-black">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mt-8 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="text-black font-medium">
                {order.customerName || order.customer?.fullName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="text-black font-medium">
                {order.customerEmail || order.customer?.email || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        <div className="mt-8 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Order Actions</h2>
          <div className="flex gap-4">
            {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status.toUpperCase()) && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {cancelling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </button>
            )}
            <button
              onClick={handleDownloadInvoice}
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition duration-300"
            >
              Download Invoice
            </button>
            <Link
              href="/customer/orders"
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition duration-300"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
