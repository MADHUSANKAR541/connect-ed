'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SideHeader from './SideHeader';

export default function SideHeaderWrapper() {
  const [sideHeaderOpen, setSideHeaderOpen] = useState(true);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Pages where side header should NOT be shown
  const excludedPages = [
    '/',                    // Landing page
    '/auth',               // Auth pages
    '/signin',             // Sign in
    '/signup',             // Sign up
    '/login',              // Login
    '/register',           // Register
    '/onboarding',         // Onboarding (optional - can be included if needed)
    '/wait-for-approval',  // Wait for approval page
    '/admin',              // Admin page
    '/dashboard',          // Dashboard pages
    '/dashboard/connections',
    '/dashboard/explore',
    '/dashboard/messages',
    '/dashboard/calls',
    '/dashboard/notifications',
    '/dashboard/settings'
  ];

  // Check if current page should show side header
  const shouldShowSideHeader = () => {
    // Don't show if not authenticated
    if (status !== 'authenticated' || !session) {
      return false;
    }

    // Don't show on excluded pages
    return !excludedPages.some(page => pathname === page);
  };

  const isVisible = shouldShowSideHeader();

  // Reset side header state when navigating to excluded pages
  useEffect(() => {
    if (!isVisible) {
      setSideHeaderOpen(false);
    } else {
      setSideHeaderOpen(true);
    }
  }, [isVisible, pathname]);

  if (!isVisible) {
    return null;
  }

  return (
    <SideHeader 
      isOpen={sideHeaderOpen} 
      onToggle={() => setSideHeaderOpen(!sideHeaderOpen)} 
    />
  );
} 