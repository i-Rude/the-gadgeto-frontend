'use client';

import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

interface HeaderProps {
  activeTab?: string;
}

export default function Header({ activeTab }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            <Link href="/home" className="flex items-center">
              <span className="text-2xl font-bold text-[#00B7EB]">The Gadgeto</span>
            </Link>
            <nav className="hidden md:flex ml-10 space-x-8">
              <Link href="/home" className="text-gray-700 hover:text-[#00B7EB] px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-[#00B7EB] px-3 py-2 text-sm font-medium">
                Products
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-[#00B7EB] px-3 py-2 text-sm font-medium">
                About
              </Link>
            </nav>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#00B7EB] focus:border-transparent"
              />
            </div>
          </div>

          {/* Auth and Cart */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-[#00B7EB] px-4 py-2 text-sm font-medium border border-transparent hover:border-[#00B7EB] rounded-lg transition-colors"
                >
                  Login
                </Link>
                <div className="relative group">
                  <button className="bg-[#00B7EB] text-white hover:bg-[#0095C0] px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center">
                    Sign Up
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link 
                      href="/customer/signup" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#00B7EB] first:rounded-t-lg"
                    >
                      Customer Sign Up
                    </Link>
                    <Link 
                      href="/seller/signup" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#00B7EB]"
                    >
                      Seller Sign Up
                    </Link>
                    <Link 
                      href="/admin/signup" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#00B7EB] last:rounded-b-lg"
                    >
                      Admin Sign Up
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-[#00B7EB] px-4 py-2 text-sm font-medium">
                    <span>Account</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link 
                      href={`/${user.role}/dashboard`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#00B7EB] first:rounded-t-lg"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href={`/${user.role}/profile`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#00B7EB]"
                    >
                      Profile
                    </Link>
                    {user.role === 'customer' && (
                      <Link 
                        href="/customer/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#00B7EB]"
                      >
                        My Orders
                      </Link>
                    )}
                    <button 
                      onClick={() => {}} // You'll need to add the logout function
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 last:rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <Link href="/cart" className="text-gray-700 hover:text-[#00B7EB] p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
