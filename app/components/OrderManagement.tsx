'use client';

import { useState, useEffect } from 'react';

import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { OrderApiService, ReviewApiService } from '../lib/api-service';

interface Order {
  id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress?: string;
  paymentMethod?: string;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    fileName?: string;
  };
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  productId: number;
  orderId: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
  };
}

export default function OrderManagementComponent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    productId: 0,
    orderId: 0,
  });
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // GET - Fetch customer orders
  const fetchOrders = async () => {
    try {
      const response = await OrderApiService.getCustomerOrders();
      setOrders(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    }
  };

  // GET - Fetch customer reviews
  const fetchReviews = async () => {
    try {
      const response = await ReviewApiService.getCustomerReviews();
      setReviews(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    }
  };

  // GET - Fetch single order details
  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await OrderApiService.getOrder(orderId.toString());
      setSelectedOrder(response.order || response);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error('Failed to load order details');
    }
  };

  // PATCH - Update order status (admin functionality - for demonstration)
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await OrderApiService.updateOrderStatus(orderId.toString(), newStatus);
      toast.success('Order status updated successfully!');
      await fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // POST - Cancel order
  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await OrderApiService.cancelOrder(orderId.toString());
      toast.success('Order cancelled successfully!');
      await fetchOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    }
  };

  // DELETE - Delete order
  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

    try {
      await OrderApiService.deleteOrder(orderId.toString());
      toast.success('Order deleted successfully!');
      await fetchOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error('Failed to delete order');
    }
  };

  // POST - Create review
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ReviewApiService.createReview(reviewForm);
      toast.success('Review created successfully!');
      
      // Reset form and refresh data
      setReviewForm({ rating: 5, comment: '', productId: 0, orderId: 0 });
      setShowReviewForm(false);
      await fetchReviews();
    } catch (error) {
      console.error('Failed to create review:', error);
      toast.error('Failed to create review');
    }
  };

  // PUT - Update review
  const handleUpdateReview = async (reviewId: number, e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ReviewApiService.updateReview(reviewId.toString(), {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success('Review updated successfully!');
      
      setEditingReview(null);
      setReviewForm({ rating: 5, comment: '', productId: 0, orderId: 0 });
      await fetchReviews();
    } catch (error) {
      console.error('Failed to update review:', error);
      toast.error('Failed to update review');
    }
  };

  // DELETE - Delete review
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await ReviewApiService.deleteReview(reviewId.toString());
      toast.success('Review deleted successfully!');
      await fetchReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchOrders(), fetchReviews()]);
        setLoading(false);
      };
      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading orders and reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order & Review Management</h1>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">My Orders</h2>
          
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-medium">Order #{order.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Total: ${order.totalAmount?.toFixed(2)} • 
                        Placed: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchOrderDetails(order.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        View Details
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          Cancel
                        </button>
                      )}
                      {(order.status === 'cancelled' || order.status === 'delivered') && (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                      {/* Demo: PATCH order status (normally admin only) */}
                      {user?.role === 'admin' && (
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span>
                              {item.product?.name} × {item.quantity}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                            {order.status === 'delivered' && (
                              <button
                                onClick={() => {
                                  setReviewForm({
                                    rating: 5,
                                    comment: '',
                                    productId: Number(item.product.id),
                                    orderId: Number(order.id),
                                  });
                                  setShowReviewForm(true);
                                }}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No orders found.</p>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Order Details #{selectedOrder.id}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span></p>
                  <p><strong>Total:</strong> ${selectedOrder.totalAmount?.toFixed(2)}</p>
                  <p><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><strong>Updated:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                  {selectedOrder.shippingAddress && (
                    <p><strong>Shipping Address:</strong> {selectedOrder.shippingAddress}</p>
                  )}
                  {selectedOrder.paymentMethod && (
                    <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  )}
                </div>
                
                {selectedOrder.items && (
                  <div>
                    <h4 className="font-medium mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between border-b pb-2">
                          <span>{item.product?.name} × {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
              
              <form onSubmit={handleCreateReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Terrible</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewForm({ rating: 5, comment: '', productId: 0, orderId: 0 });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">My Reviews</h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{review.product?.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingReview(review);
                          setReviewForm({
                            rating: review.rating,
                            comment: review.comment,
                            productId: Number(review.productId),
                            orderId: Number(review.orderId),
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {editingReview?.id === review.id ? (
                    <form onSubmit={(e) => handleUpdateReview(review.id, e)}>
                      <div className="space-y-3">
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={5}>5 Stars - Excellent</option>
                          <option value={4}>4 Stars - Good</option>
                          <option value={3}>3 Stars - Average</option>
                          <option value={2}>2 Stars - Poor</option>
                          <option value={1}>1 Star - Terrible</option>
                        </select>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReview(null);
                              setReviewForm({ rating: 5, comment: '', productId: 0, orderId: 0 });
                            }}
                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
