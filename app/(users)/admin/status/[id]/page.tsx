'use client';
import { useEffect, useState } from "react";
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

async function getAdminData(id: number) {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/${id}`, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

async function updateAdminStatus(id: number, status: 'active' | 'inactive') {
  const response = await axios.patch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/updateStatus/${id}`,
    { status },
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

export default function UpdateAdminStatus({ params }: { params: Promise<{ id: string }> }) {
  const [adminData, setAdminData] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  // Extract the id from params
  const [id, setId] = useState<number | null>(null);
  
  useEffect(() => {
    // Extract the id from the params promise
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
        const data = await getAdminData(id);
        setAdminData(data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [id]);

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    try {
      if (!id) return;
      
      setError(null);
      await updateAdminStatus(id, newStatus);
      setSuccess(true);
      
      // Update local data
      if (adminData) {
        setAdminData({ ...adminData, status: newStatus });
      }
      
      // Redirect back after a short delay
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl text-blue-600">Loading admin data...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-[#00B7EB] mb-4">Update Admin Status</h1>
        
        {adminData && (
          <div className="mb-6">
            <p className="text-gray-700 mb-2"><strong>Name:</strong> {adminData.name}</p>
            <p className="text-gray-700 mb-2"><strong>Email:</strong> {adminData.email}</p>
            <p className="text-gray-700 mb-4"><strong>Current Status:</strong> 
              <span className={`ml-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                adminData.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {adminData.status}
              </span>
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleStatusChange('active')}
                disabled={adminData.status === 'active'}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  adminData.status === 'active'
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                Set Active
              </button>
              <button
                onClick={() => handleStatusChange('inactive')}
                disabled={adminData.status === 'inactive'}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  adminData.status === 'inactive'
                    ? 'bg-red-500 text-white cursor-not-allowed'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                Set Inactive
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Status updated successfully! Redirecting back to dashboard...
          </div>
        )}
        
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}