'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log('Not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      if (allowedRoles.length > 0) {
        const userRole = user.role.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
        
        if (!normalizedAllowedRoles.includes(userRole)) {
          console.log('Unauthorized role, redirecting to appropriate dashboard');
          // Redirect to appropriate dashboard based on role
          switch (userRole) {
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
              router.push('/unauthorized');
          }
          return;
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
