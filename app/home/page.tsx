'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_ENDPOINTS, API_BASE_URL, buildApiUrl, buildImageUrl } from '@/app/lib/api-config';
import { formatPrice } from '@/app/lib/utils';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  fileName?: string;
  category?: {
    id: number;
    name: string;
  };
  stock: number;
  discount?: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');

        const productsUrl = buildApiUrl(API_ENDPOINTS.PRODUCTS);
        const categoriesUrl = buildApiUrl(API_ENDPOINTS.CATEGORIES);

        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(productsUrl, { 
            headers: { 'Accept': 'application/json' },
            timeout: 5000
          }),
          axios.get(categoriesUrl, {
            headers: { 'Accept': 'application/json' },
            timeout: 5000
          })
        ]);

        if (productsRes.data && Array.isArray(productsRes.data)) {
          setProducts(productsRes.data);
          // Select featured products (newest products or with discount)
          const featured = productsRes.data
            .filter(p => p.discount || p.stock > 0)
            .sort((a, b) => b.id - a.id) // Sort by newest
            .slice(0, 4); // Take top 4
          setFeaturedProducts(featured);
        } else {
          setProducts([]);
          setError('Invalid product data format received');
        }

        if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data);
        } else {
          setCategories([]);
          setError((prev) => prev ? `${prev}. Invalid category data format received` : 'Invalid category data format received');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setError(`Products not found. Server response: ${err.response.data?.message || 'No server message'}`);
          } else if (err.code === 'ECONNREFUSED') {
            setError('Could not connect to the server. Please check if the server is running.');
          } else {
            setError(`Failed to load products: ${err.response?.data?.message || err.message}`);
          }
          // Log additional debugging information
          const errorDetails = {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message,
            config: {
              url: err.config?.url,
              method: err.config?.method,
              baseURL: err.config?.baseURL,
              headers: err.config?.headers
            }
          };
          console.error('API Error Details:', errorDetails);
          
          // Set a more descriptive error message
          if (err.code === 'ECONNREFUSED') {
            setError(`Could not connect to server at ${API_BASE_URL}. Please check if the backend server is running.`);
          } else if (err.response?.status === 404) {
            setError(`API endpoint not found: ${err.config?.url}. Please check the API configuration.`);
          } else {
            setError(`Failed to load data: ${err.message}. ${err.response?.data?.message || ''}`);
          }
        } else {
          setError('An unexpected error occurred while loading products');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category?.id === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded ${
                selectedCategory === null
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <Link href={`/products/${product.id}`}>
                <div className="aspect-w-1 aspect-h-1 w-full">
                  {product.fileName ? (
                    <Image
                      src={buildImageUrl(product.fileName)}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="text-sm text-orange-500">
                        Only {product.stock} left!
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="text-sm text-red-500">Out of stock</span>
                    )}
                  </div>
                  {product.discount && product.discount > 0 && (
                    <div className="mt-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                        {product.discount}% OFF
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products found {selectedCategory ? 'in this category' : ''}.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
    
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-black to-gray-900 text-white relative overflow-hidden rounded-xl mb-8">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
              <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">The-Gadgeto</span>
              </h1>
              <p className="text-xl md:text-3xl mb-12 text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Your ultimate destination for the latest gadgets and cutting-edge technology
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/customer/products"
                  className="inline-block bg-white text-black px-10 py-4 rounded-xl font-bold text-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-white/20"
                >
                  Shop Now
                </Link>
                <Link
                  href="/customer/about"
                  className="inline-block border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-6 tracking-tight">Featured Products</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover our most popular and cutting-edge gadgets</p>
            </div>
            
            {/* SSR: No loading state needed since data is pre-fetched on server */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product: Product) => (
                  <div key={product.id} className="bg-black rounded-2xl shadow-2xl hover:shadow-white/10 transition-all duration-300 transform hover:scale-105 border border-gray-800 group">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-t-2xl">
                      {/* Image section removed - empty space */}
                      <div className="w-full h-48 flex items-center justify-center">
                        <span className="text-gray-600 text-4xl">📦</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gray-200 transition-colors">{product.name}</h3>
                      <p className="text-gray-400 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-white">৳{product.price.toLocaleString('en-BD')}</span>
                        <Link
                          href={`/customer/products/${product.id}`}
                          className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold transform hover:scale-105"
                        >
                          View Details
                        </Link>
                      </div>
                      {product.category && (
                        <span className="inline-block bg-white text-black px-3 py-1 rounded-full text-sm font-medium">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            
            <div className="text-center mt-16">
              <Link
                href="/customer/products"
                className="inline-block bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-6 tracking-tight">Shop by Category</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Explore our wide range of carefully curated product categories</p>
            </div>
            
            {/* SSR: No loading state needed since data is pre-fetched on server */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category: Category) => (
                  <Link
                    key={category.id}
                    href={`/customer/categories/${category.id}`}
                    className="bg-white rounded-2xl p-8 text-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-gray-200 group"
                  >
                    <div className="w-20 h-20 bg-black rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-gray-800 transition-all duration-300 shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-gray-700 transition-colors">{category.name}</h3>
                    <p className="text-gray-600 leading-relaxed">{category.description}</p>
                  </Link>
                ))}
              </div>
            
            <div className="text-center mt-16">
              <Link
                href="/customer/categories"
                className="inline-block bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                View All Categories
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="w-20 h-20 bg-black rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-gray-800 transition-all duration-300 transform group-hover:scale-110 shadow-2xl">
                  <span className="text-white font-bold text-2xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-gray-700 transition-colors">Quality Guaranteed</h3>
                <p className="text-gray-600 text-lg leading-relaxed">All products are thoroughly tested and come with comprehensive warranty coverage</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-black rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-gray-800 transition-all duration-300 transform group-hover:scale-110 shadow-2xl">
                  <span className="text-white font-bold text-2xl">🚚</span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-gray-700 transition-colors">Fast Shipping</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Lightning-quick and reliable delivery straight to your doorstep nationwide</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-black rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-gray-800 transition-all duration-300 transform group-hover:scale-110 shadow-2xl">
                  <span className="text-white font-bold text-2xl">💬</span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-gray-700 transition-colors">24/7 Support</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Round-the-clock expert customer service for complete peace of mind</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-black to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to Start Shopping?</h2>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied customers and discover your perfect gadget today
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/customer/signup"
                className="inline-block bg-white text-black px-10 py-4 rounded-xl font-bold text-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-white/20"
              >
                Sign Up Now
              </Link>
              <Link
                href="/customer/contact"
                className="inline-block border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-xl hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
