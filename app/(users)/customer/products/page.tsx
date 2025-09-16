// SSR
import { Suspense } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import { API_ENDPOINTS, buildApiUrl } from '../../../lib/api-config';
import ProductsClientComponent from './ProductsClientComponent';

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

// Server-side data fetching for SEO and initial load performance
async function getProductsAndCategories() {
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(buildApiUrl(API_ENDPOINTS.PRODUCTS), { 
        cache: 'no-store' // Always fetch fresh data
      }),
      fetch(buildApiUrl(API_ENDPOINTS.CATEGORIES), { 
        cache: 'no-store' 
      })
    ]);
    
    const products = await productsResponse.json();
    const categories = await categoriesResponse.json();
    
    // Filter active products server-side
    const activeProducts = products.filter((product: Product) => product.isActive);
    
    return {
      products: activeProducts,
      categories: categories
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      products: [],
      categories: []
    };
  }
}

export default async function ProductsPage() {
  // SSR: Data is fetched on the server before rendering
  const { products, categories } = await getProductsAndCategories();

  return (
    <div className="min-h-screen bg-white">
      <Header activeTab="products" />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Products</h1>
          <p className="text-lg text-gray-600">Discover our wide range of tech gadgets and electronics</p>
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
                <span className="text-gray-500">Products</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Client-side Interactive Component */}
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="bg-gray-200 h-20 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        }>
          <ProductsClientComponent initialProducts={products} categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
