// SSR: Server-Side Rendering used for individual product pages for better SEO and performance
// Product detail pages benefit greatly from SSR for search engine indexing and social media sharing

import { Suspense } from 'react';
import Link from 'next/link';
import Header from '../../../../components/Header';
import { API_ENDPOINTS, buildApiUrl } from '../../../../lib/api-config';
import ProductDetailClient from './ProductDetailClient';

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

interface PageProps {
  params: {
    id: string;
  };
}

// Server-side data fetching for SEO and performance
async function getProductAndReviews(productId: string) {
  try {
    const [productResponse, reviewsResponse] = await Promise.all([
      fetch(buildApiUrl(`${API_ENDPOINTS.PRODUCTS}/${productId}`), { 
        cache: 'no-store' // Always fetch fresh data
      }),
      fetch(buildApiUrl(`/review/product/${productId}`), { 
        cache: 'no-store' 
      })
    ]);
    
    if (!productResponse.ok) {
      return { product: null, reviews: [] };
    }
    
    const product = await productResponse.json();
    const reviews = reviewsResponse.ok ? await reviewsResponse.json() : [];
    
    return { product, reviews };
  } catch (error) {
    console.error('Error fetching product data:', error);
    return { product: null, reviews: [] };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  // SSR: Data is fetched on the server before rendering
  const { product, reviews } = await getProductAndReviews(params.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/customer/products"
              className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-300"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header activeTab="products" />

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
                <Link href="/customer/products" className="text-gray-700 hover:text-black">
                  Products
                </Link>
              </div>
            </li>
            {product.category && (
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link 
                    href={`/customer/categories/${product.category.id}`} 
                    className="text-gray-700 hover:text-black"
                  >
                    {product.category.name}
                  </Link>
                </div>
              </li>
            )}
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Client-side Interactive Component */}
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="lg:flex lg:space-x-12">
              <div className="lg:w-1/2 mb-8 lg:mb-0">
                <div className="w-full h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="lg:w-1/2">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        }>
          <ProductDetailClient product={product} reviews={reviews} />
        </Suspense>
      </div>
    </div>
  );
}
