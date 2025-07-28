'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export default function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user?.role) {
      const userRole = session.user.role;
      const isVerified = session.user.isVerified;
      const currentPath = window.location.pathname;

      // Define role-specific routes
      const roleRoutes = {
        'STUDENT': '/dashboard',
        'ALUMNI': '/dashboard',
        'PROFESSOR': '/dashboard',
        'ADMIN': '/admin'
      };

      const defaultRoute = roleRoutes[userRole as keyof typeof roleRoutes] || '/dashboard';

      // If user is on the auth page and authenticated, redirect to their role-specific route
      if (currentPath === '/auth' || currentPath === '/') {
        // Check if user is new (not verified) and redirect accordingly
        if (!isVerified) {
          router.push('/wait-for-approval');
        } else {
          router.push(defaultRoute);
        }
      }

      // If user is verified but hasn't completed onboarding, redirect to onboarding
      if (isVerified && currentPath === '/wait-for-approval') {
        router.push('/onboarding');
        return;
      }

      // If user is trying to access admin page but is not admin, redirect to dashboard
      if (currentPath.startsWith('/admin') && userRole !== 'ADMIN') {
        router.push('/dashboard');
      }

      // If admin is trying to access dashboard, redirect to admin panel
      if (currentPath.startsWith('/dashboard') && userRole === 'ADMIN') {
        router.push('/admin');
      }
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 