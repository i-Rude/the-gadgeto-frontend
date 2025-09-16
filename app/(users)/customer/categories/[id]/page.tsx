// SSR: Server-Side Rendering for category pages for better SEO
// Category detail pages benefit from SSR for search engine indexing and faster initial load

import { Suspense } from 'react';
import Link from 'next/link';
import Header from '../../../../components/Header';
import { API_ENDPOINTS, buildApiUrl } from '../../../../lib/api-config';
import CategoryProductsClient from './CategoryProductsClient';

interface Category {
  id: number;
  name: string;
  description?: string;
  products?: Product[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  fileName?: string;
  stock: number;
  description?: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

// Server-side data fetching for SEO
async function getCategoryAndProducts(categoryId: string) {
  try {
    const response = await fetch(buildApiUrl(`${API_ENDPOINTS.CATEGORIES}/${categoryId}`), {
      cache: 'no-store' // Always fetch fresh data
    });
    
    if (!response.ok) {
      return { category: null, products: [] };
    }
    
    const categoryData = await response.json();
    
    return {
      category: categoryData,
      products: categoryData.products || []
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return { category: null, products: [] };
  }
}

export default async function CategoryDetailPage({ params }: PageProps) {
  // SSR: Data is fetched on the server before rendering
  const { category, products } = await getCategoryAndProducts(params.id);

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">The category you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/customer/categories"
              className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-300"
            >
              Browse All Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header activeTab="categories" />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-black">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/customer/categories" className="text-gray-700 hover:text-black">
                  Categories
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{category.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Client-side Interactive Component */}
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="text-center mb-12">
              <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
            <div className="bg-gray-200 h-16 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        }>
          <CategoryProductsClient category={category} products={products} />
        </Suspense>
      </div>
    </div>
  );
}