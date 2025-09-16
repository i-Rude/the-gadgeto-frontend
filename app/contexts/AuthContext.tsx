'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_ENDPOINTS, buildApiUrl } from '../lib/api-config';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Only check with backend since auth state is stored in HTTPOnly cookies
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.VERIFY), {
        withCredentials: true,
        timeout: 60 * 60 * 24, // 24 hours
      });
      
      if (response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // No authentication found or token expired
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post(buildApiUrl(API_ENDPOINTS.LOGIN), {
        email,
        password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login response:', response.data);

      if (response.data.user) {
        setUser(response.data.user);
        // Redirect based on user role
        const role = response.data.user.role.toLowerCase();
        console.log('User role:', role);
        
        switch (role) {
          case 'seller':
            router.push('/seller/dashboard');
            break;
          case 'customer':
            router.push('/customer/dashboard');
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/home');
        }
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the login component
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post(buildApiUrl(API_ENDPOINTS.LOGOUT), {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear local state - HTTPOnly cookies are cleared by the server
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
