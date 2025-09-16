'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_ENDPOINTS, buildApiUrl, buildImageUrl } from '../../../../lib/api-config';
import Header from '../../../../components/Header';
import Link from 'next/link';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  fileName?: string;
  addresses?: Array<{
    id: number;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    addressType: string;
    isDefault: boolean;
  }>;
}

interface EditProfileClientComponentProps {
  initialData: Customer;
}

export default function EditProfileClientComponent({ initialData }: EditProfileClientComponentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    username: initialData.username || '',
    email: initialData.email || '',
    phone: initialData.phoneNumber || '', // Map phoneNumber to phone for backend compatibility
    dateOfBirth: initialData.dateOfBirth || '',
    gender: initialData.gender || ''
  });

  // Frontend validation function
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.phone && !/^\d+$/.test(formData.phone)) {
      setError('Phone number must contain only digits');
      return false;
    }
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        setError('Birth date cannot be in the future');
        return false;
      }
    }
    if (formData.gender && !['male', 'female'].includes(formData.gender.toLowerCase())) {
      setError('Gender must be either male or female');
      return false;
    }
    return true;
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error on input change
  };

  // Handle file change for profile image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
        setError('Please select a valid image file (JPG, PNG, or WebP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image file must be less than 5MB');
        return;
      }
      setProfileImage(file);
      setError('');
    }
  };

  // PUT Request - Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Frontend validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Update profile data using PUT request
      const updatePayload: any = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null
      };

      const profileResponse = await axios.put(
        buildApiUrl('/customer/me'),
        updatePayload,
        {
          withCredentials: true,
          timeout: 10000
        }
      );

      let imageUploadSuccess = true;

      // Upload profile image if selected (separate POST request)
      if (profileImage) {
        try {
          const imageFormData = new FormData();
          imageFormData.append('image', profileImage);

          await axios.post(
            buildApiUrl(API_ENDPOINTS.CUSTOMER_PROFILE_IMAGE),
            imageFormData,
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              timeout: 15000
            }
          );
        } catch (imageError: any) {
          console.error('Error uploading image:', imageError);
          imageUploadSuccess = false;
          setError(`Profile updated but image upload failed: ${imageError.response?.data?.message || 'Unknown error'}`);
        }
      }

      if (imageUploadSuccess) {
        setSuccess('Profile updated successfully!');
        
        // Redirect back to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 2000);
      }

    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white text-black">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-2">Update your personal information</p>
            </div>
            <Link 
              href="/customer/dashboard"
              className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Back to Profile
            </Link>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleUpdateProfile} className="bg-white border border-gray-300 rounded-lg p-6 space-y-6 shadow">
            {/* Current Profile Info */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-300">
              <div className="w-24 h-24 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center">
                {initialData.fileName ? (
                  <img 
                    src={buildImageUrl(initialData.fileName)} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-700">
                    {initialData.fullName?.split(' ')?.[0]?.[0]}{initialData.fullName?.split(' ')?.[1]?.[0] || ''}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{initialData.fullName}</h2>
                <p className="text-gray-600">@{initialData.username}</p>
                <p className="text-gray-600">{initialData.email}</p>
              </div>
            </div>

            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-black focus:border-blue-500 focus:ring-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-black file:text-white hover:file:bg-gray-800 transition-colors"
              />
              <p className="text-gray-600 text-sm mt-1">
                Supported formats: JPG, PNG, WebP (max 5MB)
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your username"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter phone number (digits only)"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-300">
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              
              <Link 
                href="/customer/dashboard"
                className="bg-white hover:bg-gray-100 text-black border border-gray-300 px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-8 bg-white border border-gray-300 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Important Notes</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• All fields marked with * are required</li>
              <li>• Username must be at least 3 characters long</li>
              <li>• Email address will be used for account verification</li>
              <li>• Profile images must be less than 5MB in size</li>
              <li>• Supported image formats: JPG, PNG, WebP</li>
              <li>• All changes will be saved immediately upon submission</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
