import Header from '../components/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header activeTab="about" />

      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
            About The-Gadgeto
          </h1>
          
          {/* Beta Application Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-12 text-left">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-800">
                  Beta Application
                </h3>
                <p className="mt-2 text-blue-700">
                  This is a beta application developed for the Advanced Web Technologies project.
                </p>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Developer Information</h2>
            <div className="space-y-4 text-lg">
              <div className="flex justify-center items-center space-x-2">
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="text-gray-900">Rudro Shine Datta</span>
              </div>
              <div className="flex justify-center items-center space-x-2">
                <span className="font-semibold text-gray-700">ID:</span>
                <span className="text-gray-900">22-46723-1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
