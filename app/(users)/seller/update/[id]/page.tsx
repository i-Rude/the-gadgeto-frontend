'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { use } from 'react';

interface SellerData {
  id: number;
  name: string;
  email: string;
  fileName?: string;
}

export default function UpdateSeller({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
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
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/seller/${resolvedParams.id}`, {
          withCredentials: true,
        });
        const sellerData = response.data;
        setSeller(sellerData);
        setFormData({
          name: sellerData.name,
          email: sellerData.email,
        });
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUpdateStatus({ loading: true, error: null, success: false });

    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    if (selectedFile) {
      form.append('file', selectedFile);
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/seller/${resolvedParams.id}`,
        form,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        setUpdateStatus({
          loading: false,
          error: null,
          success: true,
        });

        // Show success message for 2 seconds before redirecting
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Update error:', err);
      
      if (err.response?.status === 401) {
        // Handle unauthorized error
        router.push('/login');
        return;
      }

      setUpdateStatus({
        loading: false,
        error: err.response?.data?.message || 'Failed to update seller',
        success: false,
      });
    } finally {
      if (!updateStatus.success) {
        setUpdateStatus(prev => ({
          ...prev,
          loading: false
        }));
      }
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
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Seller</h2>

          {updateStatus.success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              Seller updated successfully! Redirecting to dashboard...
            </div>
          )}

          {updateStatus.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {updateStatus.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B7EB] focus:ring-[#00B7EB] sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B7EB] focus:ring-[#00B7EB] sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                Profile Picture (Optional)
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#00B7EB] file:text-white hover:file:bg-[#0095C0]"
              />
              {seller?.fileName && !selectedFile && (
                <p className="mt-2 text-sm text-gray-500">
                  Current file: {seller.fileName}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B7EB]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateStatus.loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B7EB] hover:bg-[#0095C0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B7EB] disabled:opacity-50"
              >
                {updateStatus.loading ? 'Updating...' : 'Update Seller'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}