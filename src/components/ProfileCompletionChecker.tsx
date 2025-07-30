'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, AlertCircle, ArrowRight } from 'lucide-react';

interface ProfileCompletionCheckerProps {
  children: React.ReactNode;
  featureName?: string;
}

export default function ProfileCompletionChecker({ children, featureName }: ProfileCompletionCheckerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/profile/completion-status');
        const data = await response.json();

        if (response.ok) {
          setIsProfileComplete(data.isComplete);
          if (!data.isComplete) {
            setShowPopup(true);
          }
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileCompletion();
  }, [session]);

  const handleCompleteProfile = () => {
    router.push('/onboarding');
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {showPopup && (
        <div className="profile-completion-overlay">
          <div className="profile-completion-popup">
            <div className="popup-header">
              <AlertCircle size={24} className="alert-icon" />
              <h3>Complete Your Profile</h3>
            </div>
            
            <div className="popup-content">
              <p>
                {featureName 
                  ? `To use ${featureName}, you need to complete your profile first.`
                  : 'You need to complete your profile to access this feature.'
                }
              </p>
              <p>
                This helps other users discover and connect with you more effectively.
              </p>
            </div>
            
            <div className="popup-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleClosePopup}
              >
                Maybe Later
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCompleteProfile}
              >
                <User size={16} />
                Complete Profile
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 