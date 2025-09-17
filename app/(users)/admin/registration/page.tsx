'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Types for our admin data
interface AdminFormData {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  nid: string;
  age: number;
}

// API functions
async function createAdmin(adminData: AdminFormData, file: File | null) {
  try {
    const formData = new FormData();
    
    // Insert all admin data to FormData
    formData.append('id', adminData.id.toString());
    formData.append('name', adminData.name);
    formData.append('email', adminData.email);
    formData.append('password', adminData.password);
    formData.append('phone', adminData.phone);
    formData.append('nid', adminData.nid);
    formData.append('age', adminData.age.toString());
    
    if (file) {
      formData.append('myfile', file);
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/admin/createAdmin`,
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
    throw error;
  }
}

async function validateFormData(formData: any) {
  const validation = adminSchema.safeParse(formData);
  if (!validation.success) {
    const formattedErrors: Record<string, string> = {};
    validation.error.issues.forEach((issue) => {
      const path = issue.path[0] as string;
      formattedErrors[path] = issue.message;
    });
    throw { type: 'validation', errors: formattedErrors };
  }
  return validation.data;
}

// Define Zod schema with coerce that parse the input field
const adminSchema = z.object({
  id: z.coerce
    .number("Id must be a number")
    .positive('ID must be a positive number'),
  name: z.string()
    .min(1, 'Name is required')
    .min(5, 'Name must be at least 5 characters')
    .regex(/^[A-Z][a-zA-Z\s]*$/, 'Name should start with a capital letter and contain only alphabets'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^01\d{9}$/, 'Phone number must be 11 digits and start with 01'),
  nid: z.string()
    .min(1, 'NID number is required')
    .regex(/^\d{10,17}$/, 'Bangladeshi NID must be 10 to 17 digits'),
  age: z.coerce
    .number("Age must be a number")
    .min(18, 'Admin must be at least 18 years old'),
  fileName: z.string().optional(),
  file: z.instanceof(File).optional()
    .refine((file) => !file || file.size <= 2 * 1024 * 1024, 'File size must be less than 2MB')
    .refine((file) => !file || file.type.startsWith('image/'), 'Only image files are allowed')
});

export default function AdminRegistration() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nid, setNid] = useState('');
  const [age, setAge] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  async function resetForm() {
    setId('');
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setNid('');
    setAge('');
    setFile(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async function handleBackendError(error: any) {
    console.error('Error creating admin:', error);
    
    if (error.response?.data?.message) {
      // Backend validation errors
      if (Array.isArray(error.response.data.message)) {
        const backendErrors: Record<string, string> = {};
        error.response.data.message.forEach((msg: string) => {
          // Parse backend error messages and map to fields
          if (msg.includes('email')) backendErrors.email = msg;
          else if (msg.includes('phone')) backendErrors.phone = msg;
          else if (msg.includes('id')) backendErrors.id = msg;
          else backendErrors.general = msg;
        });
        return backendErrors;
      }
      return { general: error.response.data.message };
    } else if (error.response?.status === 409) {
      return { general: 'Admin with this email or ID already exists' };
    } else if (error.response?.status === 400) {
      return { general: 'Invalid data provided. Please check your inputs.' };
    }
    return { general: 'Failed to create admin. Please try again.' };
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    // Prepare form data for validation
    const formDataForValidation = {
      id,
      name,
      email,
      password,
      phone,
      nid,
      age,
      fileName: file ? file.name : undefined,
      file
    };

    try {
      // Validate form data
      const validatedData = await validateFormData(formDataForValidation);

      // Prepare admin data
      const adminData = {
        id: parseInt(id),
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        nid: nid.trim(),
        age: parseInt(age),
      };

      // Create admin
      const result = await createAdmin(adminData, file);
      console.log('Admin created successfully:', result);

      // Show success message
      setSuccessMessage('Admin registration successful!');
      
      // Reset the form
      await resetForm();
      
      // Redirect after success
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
      
    } catch (error: any) {
      if (error.type === 'validation') {
        setErrors(error.errors);
      } else {
        const backendErrors = await handleBackendError(error);
        setErrors(backendErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
    
    setIsSubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    if (errors.file) {
      const newErrors = { ...errors };
      delete newErrors.file;
      setErrors(newErrors);
    }
  };

  // Clear field errors when user starts typing
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-10 px-4 font-sans">
      <div className="max-w-lg mx-auto bg-white/95 rounded-2xl p-8 shadow-2xl shadow-blue-100/50 backdrop-blur-sm border border-white/20">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl">
            👤
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
            Admin Registration
          </h1>
          <p className="text-slate-500">
            Create a new administrator account
          </p>
        </div>

        {/* General error message */}
        {errors.general && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl mb-6 text-sm font-medium">
            ⚠️ {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 text-green-600 border border-green-200 rounded-xl mb-6 text-sm font-medium">
            ✅ {successMessage}
          </div>
        )}
        
        {/* Form Fields */}
        <div className="space-y-6">
          
          {/* Admin ID */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Admin ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Admin ID"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                clearFieldError('id');
              }}
              className={`w-full px-4 py-3 text-slate-900 bg-white border rounded-xl outline-none transition-all duration-200 shadow-sm
                ${errors.id ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
            />
            {errors.id && (
              <div className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.id}
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError('name');
              }}
              className={`w-full px-4 py-3 text-slate-900 bg-white border rounded-xl outline-none transition-all duration-200 shadow-sm
                ${errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
            />
            {errors.name && (
              <div className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter valid email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
              className={`w-full px-4 py-3 text-slate-900 bg-white border rounded-xl outline-none transition-all duration-200 shadow-sm
                ${errors.email ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
            />
            {errors.email && (
              <div className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              className={`w-full px-4 py-3 text-slate-900 bg-white border rounded-xl outline-none transition-all duration-200 shadow-sm
                ${errors.password ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
            />
            {errors.password && (
              <div className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="A valid Bangladeshi number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                clearFieldError('phone');
              }}
              className={`w-full px-4 py-3 text-slate-900 bg-white border rounded-xl outline-none transition-all duration-200 shadow-sm
                ${errors.phone ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
            />
            {errors.phone && (
              <div className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phone}
              </div>
            )}
          </div>

          {/* NID Number */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              NID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="10-17 digits Bangladeshi NID"
              value={nid}
              onChange={(e) => {
                setNid(e.target.value);
                clearFieldError('nid');
              }}
              className={`w-full px-4 py-3 text-slate-900 bg-white border rounded-xl outline-none transition-all duration-200 shadow-sm
                ${errors.nid ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
            />
            {errors.nid && (
              <div className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.nid}
              </div>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Must be 18 or older"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                clearFieldError('age');
              }}
              min="18"
              className={`w-full px-4 py-3 text-slate-900 bg-white border rounded-xl outline-none transition-all duration-200 shadow-sm
                ${errors.age ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
            />
            {errors.age && (
              <div className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.age}
              </div>
            )}
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Profile Picture <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                ${errors.file ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50'}`}>
                <div className="text-center">
                  <svg className="w-8 h-8 mb-3 mx-auto text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            {errors.file && (
              <div className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.file}
              </div>
            )}
            
            {file && !errors.file && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 text-sm font-medium">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 mt-4
              ${isSubmitting 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5'}`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </div>
            ) : (
              'Create Admin Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}