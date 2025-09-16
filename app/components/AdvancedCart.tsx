'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { CartApiService, CustomerApiService, OrderApiService } from '../lib/api-service';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    fileName?: string;
    stock: number;
  };
}

interface CheckoutForm {
  shippingAddressId?: string;
  paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery';
  notes?: string;
}

export default function AdvancedCartComponent() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    paymentMethod: 'cash_on_delivery',
    notes: '',
  });

  // GET - Fetch cart contents
  const fetchCart = async () => {
    try {
      const response = await CartApiService.getCart();
      setCartItems(Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // GET - Fetch customer addresses for checkout
  const fetchCustomerProfile = async () => {
    try {
      const response = await CustomerApiService.getProfile();
      const profileData = response.data || response;
      setCustomerAddresses(profileData.addresses || []);
      
      // Set default shipping address if available
      if (profileData.addresses?.length > 0) {
        setCheckoutForm(prev => ({
          ...prev,
          shippingAddressId: profileData.addresses[0].id
        }));
      }
    } catch (error) {
      console.error('Failed to fetch customer profile:', error);
    }
  };

  // POST - Add item to cart
  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    try {
      await CartApiService.addToCart(productId, quantity);
      toast.success('Item added to cart!');
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // PUT - Update cart item quantity
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(itemId);
      return;
    }

    try {
      await CartApiService.updateCartItem(itemId, newQuantity);
      toast.success('Quantity updated!');
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  // DELETE - Remove item from cart
  const handleRemoveItem = async (itemId: string) => {
    try {
      await CartApiService.removeFromCart(itemId);
      toast.success('Item removed from cart!');
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  // DELETE - Clear entire cart
  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      await CartApiService.clearCart();
      toast.success('Cart cleared!');
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  // POST - Create order from cart
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!checkoutForm.shippingAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    try {
      setProcessingCheckout(true);

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: checkoutForm.shippingAddressId,
        paymentMethod: checkoutForm.paymentMethod,
        totalAmount: calculateTotal(),
        notes: checkoutForm.notes,
      };

      // Create order
      const response = await OrderApiService.createOrder(orderData);
      
      // Clear cart after successful order
      await CartApiService.clearCart();
      setCartItems([]);
      
      toast.success('Order placed successfully!');
      const orderId = response.order?.id || response.data?.id || (response as any).id;
      router.push(`/customer/orders/${orderId}`);
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Checkout failed. Please try again.');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 100 ? 0 : 10; // Free shipping over $100
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchCustomerProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <button
              onClick={() => router.push('/customer/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4">
                  {/* Image section removed - empty space */}
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📦</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                    <p className="text-sm text-gray-500">
                      In stock: {item.product.stock}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Order Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address
                  </label>
                  {customerAddresses.length > 0 ? (
                    <select
                      value={checkoutForm.shippingAddressId || ''}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, shippingAddressId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select an address</option>
                      {customerAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.streetAddress}, {address.city}, {address.state} {address.zipCode}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p>No addresses found.</p>
                      <button
                        type="button"
                        onClick={() => router.push('/customer/profile')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Add an address
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={checkoutForm.paymentMethod}
                    onChange={(e) => setCheckoutForm({ 
                      ...checkoutForm, 
                      paymentMethod: e.target.value as 'credit_card' | 'paypal' | 'cash_on_delivery' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={checkoutForm.notes}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Any special instructions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={processingCheckout || cartItems.length === 0}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingCheckout ? 'Processing...' : `Place Order - $${calculateTotal().toFixed(2)}`}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/customer/products')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
