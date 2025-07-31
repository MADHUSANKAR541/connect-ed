'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Clock, RefreshCw, Mail, Shield, Users, Building2 } from 'lucide-react';
import '../../styles/wait-for-approval.scss';

export default function WaitForApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Auto-refresh function
  const checkStatus = async () => {
    if (isChecking) return; // Prevent multiple simultaneous requests
    
    setIsChecking(true);
    try {
      const response = await fetch('/api/auth/check-status');
      const data = await response.json();

      if (response.ok) {
        if (data.isVerified) {
          // User is verified, redirect to onboarding
          router.push('/onboarding');
          return;
        }
        // Update last checked time
        setLastChecked(new Date());
      } else {
        console.error('Error checking status:', data.error);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Manual check function
  const handleCheckStatus = async () => {
    await checkStatus();
  };

  // Auto-refresh effect - check every 5 seconds
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      checkStatus();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, isChecking]);

  // Initial check when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      checkStatus();
    }
  }, [status]);

  // Redirect if already verified
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isVerified) {
      router.push('/onboarding');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="wait-approval-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wait-approval-container">
      <motion.div 
        className="wait-approval-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="approval-icon">
          <Clock size={48} />
        </div>
        
        <h1 className="approval-title">⏳ Wait for Approval</h1>
        
        <p className="approval-description">
          Your account is pending approval by an administrator.<br />
          You will receive an email at your given email ID once the admin approves your account.
        </p>

        <div className="approval-info">
          <div className="info-item">
            <Shield size={20} />
            <span>Your account is being reviewed for verification</span>
          </div>
          <div className="info-item">
            <Mail size={20} />
            <span>You'll receive an email notification when approved</span>
          </div>
          <div className="info-item">
            <Users size={20} />
            <span>This process typically takes 24-48 hours</span>
          </div>
          <div className="info-item">
            <RefreshCw size={20} />
            <span>Status automatically checks every 5 seconds</span>
          </div>
        </div>

        

        <div className="approval-actions">
          <button 
            className="check-status-btn"
            onClick={handleCheckStatus}
            disabled={isChecking}
          >
            <RefreshCw size={16} className={isChecking ? 'spinning' : ''} />
            {isChecking ? 'Checking...' : 'Check Now'}
          </button>
      
          
          
          <button 
            className="logout-btn"
            onClick={() => router.push('/auth')}
          >
            Back to Login
          </button>
        </div>

        
      </motion.div>
    </div>
  );
} 