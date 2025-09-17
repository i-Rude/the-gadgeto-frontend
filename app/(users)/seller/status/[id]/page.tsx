'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { use } from 'react';

interface SellerData {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

export default function ChangeSellerStatus({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({
    loading: false,
    error: null,
    success: false,
  });

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/seller/${resolvedParams.id}`,
          {
            withCredentials: true,
          }
        );
        setSeller(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch seller data');
        if (err.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [resolvedParams.id, router]);

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!seller) return;

    setUpdateStatus({ loading: true, error: null, success: false });

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/seller/${resolvedParams.id}/status`,
        { status: newStatus },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setUpdateStatus({
        loading: false,
        error: null,
        success: true,
      });

      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Status update error:', err);
      
      if (err.response?.status === 401) {
        router.push('/login');
        return;
      }

      setUpdateStatus({
        loading: false,
        error: err.response?.data?.message || 'Failed to update seller status',
        success: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-blue-600">Loading seller data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-600 text-lg font-medium mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-red-600">Seller not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Seller Status</h2>

          {updateStatus.success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              Seller status updated successfully! Redirecting to dashboard...
            </div>
          )}

          {updateStatus.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {updateStatus.error}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">Seller Details</h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600">Name: {seller.name}</p>
              <p className="text-sm text-gray-600">Email: {seller.email}</p>
              <p className="text-sm text-gray-600">
                Current Status:{' '}
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    seller.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {seller.status}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Change Status</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleStatusChange('active')}
                disabled={updateStatus.loading || seller.status === 'active'}
                className={`flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${
                    seller.status === 'active'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }`}
              >
                Activate
              </button>
              <button
                onClick={() => handleStatusChange('inactive')}
                disabled={updateStatus.loading || seller.status === 'inactive'}
                className={`flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${
                    seller.status === 'inactive'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
              >
                Deactivate
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}