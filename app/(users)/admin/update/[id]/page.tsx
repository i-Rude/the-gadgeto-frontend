'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';

interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  status: 'active' | 'inactive';
}

interface UpdateAdminDto {
  name?: string;
  email?: string;
  phone?: string;
  age?: number;
  password?: string;
}

export default function UpdateAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const [adminData, setAdminData] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<UpdateAdminDto>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    const extractId = async () => {
      const resolvedParams = await params;
      setId(Number(resolvedParams.id));
    };
    
    extractId();
  }, [params]);

  useEffect(() => {
    if (!id) return;
    
    const fetchAdminData = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/${id}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setAdminData(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          age: response.data.age
        });
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    try {
      setError(null);
      setUpdating(true);
      
      // Remove empty fields from the update data
      const updateData: UpdateAdminDto = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== adminData?.[key as keyof Admin]) {
          updateData[key as keyof UpdateAdminDto] = value;
        }
      });

      // Don't send request if no changes
      if (Object.keys(updateData).length === 0) {
        setError('No changes detected');
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/${id}`,
        updateData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update admin');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl text-blue-600">Loading admin data...</div>
    </div>
  );

  if (!adminData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-red-600">Admin not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-[#00B7EB] mb-6">Update Admin</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00B7EB] focus:border-[#00B7EB]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00B7EB] focus:border-[#00B7EB]"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00B7EB] focus:border-[#00B7EB]"
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00B7EB] focus:border-[#00B7EB]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password (leave empty to keep current)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00B7EB] focus:border-[#00B7EB]"
              placeholder="Enter new password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md">
              Admin updated successfully! Redirecting...
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-[#00B7EB] text-white rounded-md hover:bg-[#0095C0] disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Admin'}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}