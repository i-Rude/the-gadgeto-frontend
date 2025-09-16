// CSR: Client-Side Rendering for cart functionality
// Cart page requires dynamic user-specific content, real-time updates, and interactive features
'use client';

import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { formatPrice, ensureNumber } from '../../../lib/utils';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Header from '../../../components/Header';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_ENDPOINTS, buildApiUrl } from '../../../lib/api-config';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    customerEmail: '',
    phoneNumber: '',
    shippingAddress: '',
    paymentMethod: 'cash_on_delivery' as 'credit_card' | 'paypal' | 'cash_on_delivery'
  });
  const router = useRouter();

  // Fetch customer profile when component loads
  useEffect(() => {
    if (user) {
      fetchCustomerProfile();
    }
  }, [user]);

  const fetchCustomerProfile = async () => {
    try {
      const response = await axios.get(
        buildApiUrl(API_ENDPOINTS.CUSTOMER_PROFILE),
        { withCredentials: true }
      );
      
      if (response.data) {
        setCustomerProfile(response.data);
        // Pre-fill checkout form with profile data
        setCheckoutData(prev => ({
          ...prev,
          customerName: response.data.fullName || '',
          customerEmail: response.data.email || '',
          phoneNumber: response.data.phoneNumber || '',
          shippingAddress: response.data.addresses?.[0]?.fullAddress || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    }
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      
      // Validate required fields
      if (!checkoutData.customerName || !checkoutData.customerEmail || !checkoutData.shippingAddress || !checkoutData.phoneNumber) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Prepare order data
      const orderData = {
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        phoneNumber: checkoutData.phoneNumber,
        shippingAddress: checkoutData.shippingAddress,
        paymentMethod: checkoutData.paymentMethod,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      // Send order to backend
      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.ORDERS), 
        orderData,
        { withCredentials: true }
      );

      if (response.data) {
        // Clear cart after successful order
        clearCart();
        
        // Redirect to order confirmation or orders page
        router.push(`/customer/orders/${response.data.id}`);
      }
    } catch (error: any) {
      console.error('Checkout failed:', error);
      const errorMessage = error.response?.data?.message || 'Checkout failed. Please try again.';
      alert(errorMessage);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          <Header activeTab="cart" />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-black">Shopping Cart</h1>
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-xl font-semibold text-black mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Add some products to get started!</p>
              <Link 
                href="/customer/products"
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header activeTab="cart" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-black">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-300">
                  <div className="flex items-center space-x-4">
                    {/* Image section removed - empty space */}
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">📦</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black">{item.name}</h3>
                      <p className="text-gray-600">{formatPrice(item.price)}</p>
                      <p className="text-sm text-gray-500">In stock: {item.stock}</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-black"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-black font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-black">
                        ৳{(ensureNumber(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-black mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-black">
                  <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>৳{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-black">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold text-black">
                  <span>Total</span>
                  <span>৳{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowCheckoutForm(!showCheckoutForm)}
                disabled={isCheckingOut}
                className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showCheckoutForm ? 'Hide Checkout Form' : 'Proceed to Checkout'}
              </button>
              
              <button
                onClick={clearCart}
                className="w-full mt-4 border border-black text-black py-2 px-4 rounded-md hover:bg-gray-100 transition duration-300"
              >
                Clear Cart
              </button>

              {/* Checkout Form */}
              {showCheckoutForm && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">Checkout Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={checkoutData.customerName}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={checkoutData.customerEmail}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, customerEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={checkoutData.phoneNumber}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Address *
                      </label>
                      <textarea
                        value={checkoutData.shippingAddress}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter your full address"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={checkoutData.paymentMethod}
                        onChange={(e) => setCheckoutData(prev => ({ 
                          ...prev, 
                          paymentMethod: e.target.value as 'credit_card' | 'paypal' | 'cash_on_delivery' 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="cash_on_delivery">Cash on Delivery</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCheckingOut ? 'Processing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <Link 
                  href="/customer/products"
                  className="text-black hover:text-gray-600 text-sm"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
