// CSR: Client-Side component for interactive features like filtering, sorting, and cart operations
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/contexts/CartContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { ensureNumber, formatPrice } from '@/app/lib/utils';

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
  };
  seller?: {
    id: string;
    businessName: string;
  };
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface ProductsClientComponentProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ProductsClientComponent({ initialProducts, categories }: ProductsClientComponentProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 300000 });
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'discount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    filterProducts();
  }, [initialProducts, searchTerm, selectedCategory, priceRange, sortBy, sortOrder]);

  const filterProducts = () => {
    let filtered = [...initialProducts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category?.id === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const effectivePrice = ensureNumber(product.price) * (1 - ensureNumber(product.discount) / 100);
      return effectivePrice >= priceRange.min && effectivePrice <= priceRange.max;
    });

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = ensureNumber(a.price) - ensureNumber(b.price);
          break;
        case 'discount':
          comparison = ensureNumber(a.discount) - ensureNumber(b.discount);
          break;
        default:
          comparison = 0;
      }
      
      if (sortOrder === 'asc') {
        return comparison;
      } else {
        return -comparison;
      }
    });

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setPriceRange({ min: 0, max: 300000 });
    setSortBy('name');
    setSortOrder('asc');
  };

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
    
    // Show success message
    alert(`Added ${product.name} to cart!`);
  };

  return (
    <>
      {/* Search and Filter Section */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range (৳)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
              />
              <input
                type="number"
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 300000 }))}
              />
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                id="sort"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'discount')}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="discount">Discount</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {initialProducts.length} products
          </span>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
            <Link href={`/customer/products/${product.id}`} className="block">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {/* Image section removed - empty space */}
                <div className="w-full h-48 flex items-center justify-center">
                  <span className="text-gray-400 text-4xl">📦</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {product.discount > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(ensureNumber(product.price))}
                      </span>
                    )}
                    <span className="text-lg font-bold text-black">
                      {formatPrice(ensureNumber(product.price) * (1 - ensureNumber(product.discount) / 100))}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Stock: {product.stock}
                </div>
                {product.category && (
                  <div className="text-xs text-gray-500">
                    {product.category.name}
                  </div>
                )}
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

      {/* No Products Found */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg mb-4">No products found matching your criteria</div>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition duration-200"
          >
            Clear Filters
          </button>
        </div>
      )}
    </>
  );
}