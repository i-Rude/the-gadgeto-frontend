'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-[#00B7EB] shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/home" 
              className="text-[#E5E4E2] text-xl font-bold hover:text-white transition-colors"
            >
              The Gadgeto
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link 
              href="/home" 
              className="text-[#E5E4E2] hover:text-white font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/login" 
              className="bg-[#E5E4E2] text-[#00B7EB] px-4 py-2 rounded-full font-medium hover:bg-white transition-colors transform hover:scale-105"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
