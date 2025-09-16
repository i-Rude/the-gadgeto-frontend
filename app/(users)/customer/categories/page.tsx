// SSR: Server-Side Rendering used for better SEO and initial page load
// Categories page benefits from SSR for search engine indexing of product categories

import Link from 'next/link';
import { API_ENDPOINTS, buildApiUrl } from '../../../lib/api-config';
import Header from '../../../components/Header';

interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  products?: Product[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  fileName?: string;
  stock: number;
}

// Server-side data fetching
async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.CATEGORIES), {
      cache: 'no-store' // Always fetch fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  // SSR: Data is fetched on the server before rendering
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white">
      <Header activeTab="categories" />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Categories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of tech categories. From smartphones to laptops, 
            find exactly what you're looking for in our organized collections.
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-black">
                Home
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Categories</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/customer/categories/${category.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 group"
              >
                <div className="h-48 bg-gradient-to-br from-black to-gray-800 flex items-center justify-center relative">
                  {/* Category Icon */}
                  <div className="text-6xl text-white group-hover:scale-110 transition duration-300">
                    {getCategoryIcon(category.name, index)}
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-black transition duration-300">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {category.description || `Discover amazing ${category.name.toLowerCase()} products with competitive prices and quality assurance.`}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Added on {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center text-black group-hover:text-gray-800 transition duration-300">
                      <span className="text-sm font-medium">Explore</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories available</h3>
            <p className="text-gray-600 mb-6">
              Categories are being set up. Please check back later.
            </p>
            <Link 
              href="/customer/products"
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-300"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Featured Categories Section */}
        {categories.length > 0 && (
          <div className="mt-16">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why Shop by Category?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Targeted Shopping</h3>
                  <p className="text-gray-600">
                    Find exactly what you need without browsing through irrelevant products.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Discovery</h3>
                  <p className="text-gray-600">
                    Save time by exploring products within your area of interest.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Better Comparison</h3>
                  <p className="text-gray-600">
                    Compare similar products side by side to make informed decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-black rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Browse all our products or contact our support team for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/customer/products"
              className="bg-white text-black px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition duration-300"
            >
              View All Products
            </Link>
            <Link 
              href="/customer/contact"
              className="border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition duration-300"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get category icons
function getCategoryIcon(categoryName: string, index: number): string {
  const icons = ['📱', '💻', '🎧', '📷', '⌚', '🖥️', '🖱️', '⌨️', '🔌', '💡'];
  
  // Try to match common category names
  const name = categoryName.toLowerCase();
  if (name.includes('phone') || name.includes('mobile')) return '📱';
  if (name.includes('laptop') || name.includes('computer')) return '💻';
  if (name.includes('headphone') || name.includes('audio')) return '🎧';
  if (name.includes('camera') || name.includes('photo')) return '📷';
  if (name.includes('watch') || name.includes('smart')) return '⌚';
  if (name.includes('monitor') || name.includes('display')) return '🖥️';
  if (name.includes('mouse') || name.includes('gaming')) return '🖱️';
  if (name.includes('keyboard') || name.includes('input')) return '⌨️';
  if (name.includes('charger') || name.includes('cable')) return '🔌';
  if (name.includes('accessory') || name.includes('light')) return '💡';
  
  // Fallback to index-based icon
  return icons[index % icons.length];
}
