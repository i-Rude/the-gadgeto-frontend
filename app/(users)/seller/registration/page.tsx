'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Types for our seller data
interface SellerFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  nid: string;
}

// API functions
async function createSeller(sellerData: SellerFormData, file: File | null, isAdmin: boolean = false) {
  try {
    const formData = new FormData();
    
    // Insert all seller data to FormData
    formData.append('name', sellerData.name);
    formData.append('email', sellerData.email);
    formData.append('password', sellerData.password);
    formData.append('phone', sellerData.phone);
    formData.append('nid', sellerData.nid);
    
    if (file) {
      formData.append('file', file); // Changed to match backend expectation
    }

    // Determine the endpoint based on whether user is admin
    const endpoint = isAdmin 
      ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/createSeller`
      : `${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/createSeller`;

    console.log('Using endpoint:', endpoint);

    const response = await axios.post(
      endpoint,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Check if user is admin by trying to access an admin-only endpoint
async function checkAdminStatus(): Promise<boolean> {
  try {
    // Try to access an admin endpoint to check if user is admin
    await axios.get(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/check-admin`,
      { withCredentials: true }
    );
    return true;
  } catch (error) {
    console.log('User is not an admin');
    return false;
  }
}

// Zod schema for validation
const sellerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Email must be a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^01\d{9}$/, 'Phone number must start with 01 and be 11 digits'),
  nid: z.string()
    .min(1, 'NID number is required')
    .regex(/^\d{10,17}$/, 'Bangladeshi NID must be 10 to 17 digits'),
  fileName: z.string().optional(),
  file: z.instanceof(File).optional()
    .refine((file) => !file || file.size <= 2 * 1024 * 1024, 'File size must be less than 2MB')
    .refine((file) => !file || file.type.startsWith('image/'), 'Only image files are allowed')
});

export default function SellerRegistration() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nid, setNid] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is admin on component mount
  useEffect(() => {
    async function checkAdmin() {
      try {
        const adminStatus = await checkAdminStatus();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAdmin();
  }, []);

  async function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setNid('');
    setFile(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Don't submit if we're still checking auth status
    if (isCheckingAuth) return;
    
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Prepare form data
      const formData = {
        name,
        email,
        password,
        phone,
        nid,
        fileName: file ? file.name : undefined,
        file
      };

      // Validate form data
      const validation = sellerSchema.safeParse(formData);
      if (!validation.success) {
        const formattedErrors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0] as string;
          formattedErrors[path] = issue.message;
        });
        throw { type: 'validation', errors: formattedErrors };
      }

      // Create seller
      const sellerData: SellerFormData = {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        nid: nid.trim()
      };

      const result = await createSeller(sellerData, file, isAdmin);
      console.log('Seller created successfully:', result);

      setSuccessMessage('Seller registration successful!');
      await resetForm();

      // Redirect after success - only if admin
      if (isAdmin) {
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.type === 'validation') {
        setErrors(error.errors);
      } else {
        // Handle backend validation errors
        if (error.response?.data?.message) {
          if (Array.isArray(error.response.data.message)) {
            const backendErrors: Record<string, string> = {};
            error.response.data.message.forEach((msg: string) => {
              if (msg.includes('email')) backendErrors.email = msg;
              else if (msg.includes('phone')) backendErrors.phone = msg;
              else if (msg.includes('nid')) backendErrors.nid = msg;
              else backendErrors.general = msg;
            });
            setErrors(backendErrors);
          } else {
            setErrors({
              general: error.response.data.message
            });
          }
        } else {
          setErrors({
            general: error.response?.data?.message || 'Failed to register seller'
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    if (errors.file) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }
  }

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Seller Registration
        </h2>
        {isAdmin && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Registering a new seller as an administrator
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
          
          {errors.general && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="nid" className="block text-sm font-medium text-gray-700">
                NID Number
              </label>
              <div className="mt-1">
                <input
                  id="nid"
                  name="nid"
                  type="text"
                  required
                  value={nid}
                  onChange={(e) => setNid(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.nid ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.nid && (
                <p className="mt-2 text-sm text-red-600">{errors.nid}</p>
              )}
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div className="mt-1">
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.file ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.file && (
                <p className="mt-2 text-sm text-red-600">{errors.file}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}