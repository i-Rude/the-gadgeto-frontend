'use client';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative h-[600px] bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50">
          <div className="container mx-auto px-6 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl font-bold mb-6">Welcome to The Gadgeto</h1>
              <p className="text-xl mb-8">Discover the latest in tech innovation with our premium selection of gadgets and electronics.</p>
              <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
              <div className="h-40 mb-4 relative">
                <Image src="/product/phone.webp" alt="Smartphones" layout="fill" objectFit="cover" className="rounded-lg" />
              </div>
              <h3 className="text-black font-semibold ">Smartphones</h3>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
              <div className="h-40 mb-4 relative">
                <Image src="/product/laptop.jpg" alt="Laptops" layout="fill" objectFit="cover" className="rounded-lg" />
              </div>
              <h3 className="text-black font-semibold">Laptops</h3>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
              <div className="h-40 mb-4 relative">
                <Image src="/product/gadget.webp" alt="Accessories" layout="fill" objectFit="cover" className="rounded-lg" />
              </div>
              <h3 className="text-black font-semibold">Accessories</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* iPhone 14 Pro */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 relative">
                <Image
                  src="/product/iphone.webp"
                  alt="iPhone 14 Pro"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="text-black font-semibold mb-2">iPhone 14 Pro</h3>
                <p className="text-gray-600 mb-2">Iphone 14 Pro with 512gb Storage</p>
                <p className="text-lg font-bold text-blue-600">$999</p>
              </div>
            </div>

            {/* Apple Watch */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 relative">
                <Image
                  src="/product/applewatch.webp"
                  alt="Apple Watch"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="text-black font-semibold mb-2">Apple Watch Series 8</h3>
                <p className="text-gray-600 mb-2">Series 8 with GPS</p>
                <p className="text-lg font-bold text-blue-600">$399</p>
              </div>
            </div>

            {/* iPad Mini */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 relative">
                <Image
                  src="/product/ipad.webp"
                  alt="iPad Mini"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="text-black font-semibold mb-2">iPad Mini</h3>
                <p className="text-gray-600 mb-2">8.3-inch Liquid Retina display</p>
                <p className="text-lg font-bold text-blue-600">$499</p>
              </div>
            </div>

            {/* Asus Vivobook */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 relative">
                <Image
                  src="/product/laptop.jpg"
                  alt="Asus Vivobook"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="text-black font-semibold mb-2">Asus Vivobook 15</h3>
                <p className="text-gray-600 mb-2">15.6" FHD, Intel Core i5</p>
                <p className="text-lg font-bold text-blue-600">$699</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Special Offer</h2>
              <p className="text-xl mb-8">Get 20% Discount on all the accessories</p>
              <Link href="/offers" className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold inline-block hover:bg-gray-100">
                View Offers
              </Link>
            </div>
            <div className="relative h-80">
              {/* Add offer image here */}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="text-center">
              <h2 className="text-black font-bold mb-6">Contact Us</h2>
              <div className="space-y-4 max-w-md mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
                    <p className="text-blue-600">tanjilm445@gmail.com</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Phone</h3>
                    <p className="text-gray-600">Customer Support: +8801797241407</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Log in Registration */}
            <div className="text-center">
              <h2 className="text-black font-bold mb-6">Join The Gadgeto</h2>
              <p className="text-gray-600 mb-8">
                Sign in to access your account or create a new one to start shopping.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link 
                  href="/login"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/signup"
                  className="flex-1 bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-full font-semibold border-2 border-blue-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Create an account to track orders and get personalized recommendations
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
