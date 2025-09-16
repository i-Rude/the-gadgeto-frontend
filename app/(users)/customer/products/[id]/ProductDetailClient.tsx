// CSR: Client-Side component for interactive features like add to cart, quantity selection
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../../contexts/CartContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { ensureNumber, formatPrice } from '../../../../lib/utils';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  fileName?: string;
  discount: number;
  isActive: boolean;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  seller?: {
    id: string;
    businessName: string;
    email: string;
  };
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface ProductDetailClientProps {
  product: Product;
  reviews: Review[];
}

export default function ProductDetailClient({ product, reviews }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'specifications'>('description');
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Number(e.target.value));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/customer/login');
      return;
    }

    if (product.stock === 0) {
      alert('Sorry, this product is out of stock!');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: ensureNumber(product.price),
      stock: product.stock,
      image: product.fileName
    }, quantity);

    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, review: Review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const effectivePrice = ensureNumber(product.price) * (1 - ensureNumber(product.discount) / 100);

  return (
    <div className="lg:flex lg:space-x-12">
      {/* Product Image */}
      <div className="lg:w-1/2 mb-8 lg:mb-0">
        <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-lg overflow-hidden">
          {/* Image section removed - empty space */}
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-6xl">�</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="lg:w-1/2">
        <div className="mb-4">
          {product.category && (
            <span className="inline-block bg-black text-white text-sm px-3 py-1 rounded-full mb-2">
              {product.category.name}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

        {/* Reviews */}
        <div className="flex items-center mb-6">
          <div className="text-yellow-400 mr-2">
            {renderStars(calculateAverageRating())}
          </div>
          <span className="text-gray-600">
            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-black">
              ৳{formatPrice(effectivePrice)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  ৳{formatPrice(product.price)}
                </span>
                <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                  Save {product.discount}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="mb-6">
          <span className={`text-lg font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </span>
        </div>

        {/* Quantity and Add to Cart */}
        {product.stock > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition duration-300 font-medium"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Seller Info */}
        {product.seller && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
            <p className="text-gray-700">
              <span className="font-medium">Business Name:</span> {product.seller.businessName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Contact:</span> {product.seller.email}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-t pt-8">
          <div className="flex border-b mb-6">
            {['description', 'reviews', 'specifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-4 font-medium capitalize ${
                  activeTab === tab
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-48">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Product Description</h3>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {product.description || 'No description available for this product.'}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 mr-2">
                              {review.customer.fullName}
                            </span>
                            <span className="text-yellow-400">
                              {renderStars(review.rating)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Product ID:</span>
                    <span>#{product.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Category:</span>
                    <span>{product.category?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Stock:</span>
                    <span>{product.stock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Discount:</span>
                    <span>{product.discount}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
