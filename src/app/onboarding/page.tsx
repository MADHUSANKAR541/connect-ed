'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, MapPin, Calendar, Briefcase, Globe, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';
import '../../styles/onboarding.scss';

export default function OnboardingPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    department: '',
    batch: '',
    skills: '',
    interests: '',
    bio: '',
    linkedin: '',
    github: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      alert('Please log in to complete onboarding');
      return;
    }
    
    // Validate required fields for the current step
    if (currentStep === 1 && (!formData.name || !formData.college || !formData.department)) {
      alert('Please fill in all required fields in step 1');
      return;
    }
    
    if (currentStep === 2 && !formData.batch) {
      alert('Please fill in the batch year in step 2');
      return;
    }
    
    // Only submit if we're on the final step
    if (currentStep !== 3) {
      return;
    }
    
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          college: formData.college,
          department: formData.department,
          batch: formData.batch,
          bio: formData.bio
        }),
      });

      if (response.ok) {
        // Redirect to dashboard after successful onboarding
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to save profile');
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Academic', icon: GraduationCap },
    { number: 3, title: 'Professional', icon: Briefcase }
  ];

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="header">
          <h1 className="title">Complete Your Profile</h1>
          <p className="subtitle">Help others discover and connect with you</p>
        </div>

        <div className="progress">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className={`step ${currentStep >= step.number ? 'active' : ''}`}>
                <div className="step-icon">
                  <Icon size={20} />
                </div>
                <span className="step-title">{step.title}</span>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} onKeyDown={(e) => {
          if (e.key === 'Enter' && currentStep < 3) {
            e.preventDefault();
          }
        }}>
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">College</label>
                <input
                  type="text"
                  name="college"
                  className="form-input"
                  placeholder="Enter your college name"
                  value={formData.college}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  placeholder="Enter your department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <div className="form-group">
                <label className="form-label">Batch Year</label>
                <input
                  type="text"
                  name="batch"
                  className="form-input"
                  placeholder="e.g., 2023, 2024"
                  value={formData.batch}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills</label>
                <input
                  type="text"
                  name="skills"
                  className="form-input"
                  placeholder="e.g., React, Python, Machine Learning"
                  value={formData.skills}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interests</label>
                <input
                  type="text"
                  name="interests"
                  className="form-input"
                  placeholder="e.g., AI, Web Development, Research"
                  value={formData.interests}
                  onChange={handleInputChange}
                />
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  className="form-textarea"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  className="form-input"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Profile</label>
                <input
                  type="url"
                  name="github"
                  className="form-input"
                  placeholder="https://github.com/yourusername"
                  value={formData.github}
                  onChange={handleInputChange}
                />
              </div>
            </motion.div>
          )}

          <div className="actions">
            {currentStep > 1 && (
              <motion.button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
            )}
            
            {currentStep < 3 ? (
              <motion.button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                className="btn btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save size={20} />
                Complete Profile
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 