// CSR: Client-Side component for interactive category product features
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../../contexts/CartContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { ensureNumber, formatPrice } from '../../../../lib/utils';

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  fileName?: string;
  stock: number;
  description?: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface CategoryProductsClientProps {
  category: Category;
  products: Product[];
}

export default function CategoryProductsClient({ category, products }: CategoryProductsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'discount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleQuickAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      router.push('/customer/login');
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: ensureNumber(product.price),
      stock: product.stock,
      image: product.fileName
    }, 1);
    
    alert(`Added ${product.name} to cart!`);
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => 
      searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = ensureNumber(a.price) * (1 - ensureNumber(a.discount) / 100);
          bValue = ensureNumber(b.price) * (1 - ensureNumber(b.discount) / 100);
          break;
        case 'discount':
          aValue = ensureNumber(a.discount);
          bValue = ensureNumber(b.discount);
          break;
        default: // name
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <>
      {/* Category Info */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{category.description}</p>
        )}
        <div className="mt-6">
          <span className="text-sm text-gray-500">
            {products.length} {products.length === 1 ? 'product' : 'products'} in this category
          </span>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'discount')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="discount">Sort by Discount</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredAndSortedProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <Link href={`/customer/products/${product.id}`} className="block">
                <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                  {/* Image section removed - empty space */}
                  <div className="w-full h-48 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">�</span>
                  </div>
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-lg font-bold text-black">
                            {formatPrice(ensureNumber(product.price) * (1 - ensureNumber(product.discount) / 100))}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-black">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Stock: {product.stock}
                  </div>
                </div>
              </Link>
              
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleQuickAddToCart(product)}
                  disabled={product.stock === 0}
                  className={`w-full py-2 px-4 rounded-md font-medium transition duration-200 ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg mb-4">
            {searchTerm ? 'No products found matching your search' : 'No products in this category yet'}
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition duration-200"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </>
  );
}
