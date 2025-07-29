'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export default function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // If user is not authenticated, don't apply any redirects
    if (status === 'unauthenticated') {
      return;
    }

    // Add a small delay to ensure session is fully established
    const timeoutId = setTimeout(() => {
      // Only apply redirects for authenticated users with complete session data
      if (status === 'authenticated' && session?.user?.role && session?.user?.id) {
      const userRole = session.user.role;
      const isVerified = session.user.isVerified;
      const currentPath = window.location.pathname;

      // Debug logging (remove in production)
      // console.log('RoleBasedRedirect:', { userRole, isVerified, currentPath, sessionUser: session.user });

      // Define role-specific routes
      const roleRoutes = {
        'STUDENT': '/dashboard',
        'ALUMNI': '/dashboard',
        'PROFESSOR': '/dashboard',
        'ADMIN': '/admin'
      };

      const defaultRoute = roleRoutes[userRole as keyof typeof roleRoutes] || '/dashboard';

      // Handle role-based redirects
      if (currentPath === '/') {
        // If user is on the root path and authenticated, redirect to their role-specific route
        if (!isVerified) {
          router.push('/wait-for-approval');
        } else {
          router.push(defaultRoute);
        }
      } else if (isVerified && currentPath === '/wait-for-approval') {
        // If user is verified but hasn't completed onboarding, redirect to onboarding
        router.push('/onboarding');
      } else if (currentPath.startsWith('/admin') && userRole !== 'ADMIN') {
        // If user is trying to access admin page but is not admin, redirect to dashboard
        router.push('/dashboard');
      }
      // Removed the admin redirect to allow admins to access dashboard pages
    }
    }, 100); // Small delay to ensure session is fully established

    return () => clearTimeout(timeoutId);
  }, [session, status, router]);

  // Show loading while checking authentication or during session establishment
  if (status === 'loading' || (status === 'authenticated' && (!session?.user?.role || !session?.user?.id))) {
    return (
      <LoadingSpinner 
        message="Checking your account details..." 
        size="lg" 
        variant="auth" 
      />
    );
  }

  return <>{children}</>;
} 