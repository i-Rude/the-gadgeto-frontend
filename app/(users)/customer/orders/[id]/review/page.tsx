'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { API_ENDPOINTS, buildApiUrl } from '../../../../../lib/api-config';
import { formatPrice } from '../../../../../lib/utils';
import Header from '../../../../../components/Header';
import Footer from '../../../../../components/Footer';
import ProtectedRoute from '../../../../../components/ProtectedRoute';

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
  orderItems: OrderItem[];
  customer?: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface ReviewData {
  rating: number;
  comment: string;
  productId: number;
}

export default function OrderReviewPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<number, ReviewData>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const params = useParams();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(buildApiUrl(API_ENDPOINTS.ORDER_BY_ID(params.id as string)), {
          withCredentials: true,
        });
        setOrder(response.data);
        
        // Initialize reviews for each product
        const initialReviews: Record<number, ReviewData> = {};
        response.data.orderItems.forEach((item: OrderItem) => {
          initialReviews[item.product.id] = {
            rating: 5,
            comment: '',
            productId: item.product.id
          };
        });
        setReviews(initialReviews);
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

  const handleReviewChange = (productId: number, field: 'rating' | 'comment', value: number | string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const submitReview = async (productId: number) => {
    const review = reviews[productId];
    if (!review.comment.trim()) {
      alert('Please write a comment for your review');
      return;
    }

    setSubmitting(productId);
    try {
      await axios.post(buildApiUrl(API_ENDPOINTS.REVIEWS), {
        productId: productId,
        rating: review.rating,
        comment: review.comment,
        orderId: order?.id
      }, {
        withCredentials: true
      });
      
      alert('Review submitted successfully!');
      
      // Remove the product from reviews after successful submission
      setReviews(prev => {
        const newReviews = { ...prev };
        delete newReviews[productId];
        return newReviews;
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(null);
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

  if (error || !order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          <Header activeTab="orders" />
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
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (order.status.toLowerCase() !== 'delivered') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          <Header activeTab="orders" />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-semibold text-black mb-4">Review Not Available</h2>
              <p className="text-gray-600 mb-8">You can only review orders that have been delivered.</p>
              <Link
                href={`/customer/orders/${order.id}`}
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-300"
              >
                View Order Details
              </Link>
            </div>
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
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/customer/orders/${order.id}`}
              className="text-black hover:text-gray-600 mb-4 flex items-center"
            >
              ← Back to Order Details
            </Link>
            <h1 className="text-3xl font-bold text-black">Review Order #{order.id}</h1>
            <p className="text-gray-600">Share your experience with the products you received</p>
          </div>

          {/* Review Items */}
          <div className="space-y-6">
            {order.orderItems.map((item) => (
              reviews[item.product.id] && (
                <div key={item.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {/* Image section removed - empty space */}
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">📦</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-black">{item.product.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-gray-600">Price: {formatPrice(item.unitPrice)} each</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleReviewChange(item.product.id, 'rating', rating)}
                          className={`text-2xl ${
                            rating <= reviews[item.product.id].rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-gray-600">
                        {reviews[item.product.id].rating} / 5
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Comment
                    </label>
                    <textarea
                      value={reviews[item.product.id].comment}
                      onChange={(e) => handleReviewChange(item.product.id, 'comment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      rows={4}
                      placeholder="Share your experience with this product..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={() => submitReview(item.product.id)}
                    disabled={submitting === item.product.id}
                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting === item.product.id ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )
            ))}
          </div>

          {Object.keys(reviews).length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-semibold text-black mb-4">All Reviews Submitted</h2>
              <p className="text-gray-600 mb-8">Thank you for taking the time to review your order!</p>
              <Link
                href="/customer/orders"
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-300"
              >
                Back to Orders
              </Link>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
