'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function TestPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="landing-container">
        <div className="landing-content">
          <h1 className="landing-title">Not Authenticated</h1>
          <p className="landing-subtitle">Please sign in to see the side header</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="page-title">Test Page</h1>
        <p className="page-subtitle">
          This page should show the side header if you're authenticated.
        </p>
        
        <div className="test-content">
          <h2>User Information</h2>
          <p><strong>Name:</strong> {session?.user?.name}</p>
          <p><strong>Email:</strong> {session?.user?.email}</p>
          <p><strong>Role:</strong> {session?.user?.role}</p>
          
          <h2>Side Header Test</h2>
          <p>
            If you can see a side header on the left side of the screen, 
            the implementation is working correctly!
          </p>
          
          <div className="test-features">
            <h3>Features to Test:</h3>
            <ul>
              <li>Side header should be visible on the left</li>
              <li>Side header should NOT appear on landing page (/)</li>
              <li>Side header should NOT appear on auth pages (/auth)</li>
              <li>Side header should be collapsible</li>
              <li>Side header should show user information</li>
              <li>Quick actions should work</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 