'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, MapPin, Calendar, Briefcase, Globe, Save, Users, Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import '../../styles/onboarding.scss';

export default function OnboardingPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    skills: '',
    interests: '',
    bio: '',
    linkedin: '',
    github: '',
    // Student-specific fields
    currentYear: '',
    graduationYear: '',
    cgpa: '',
    // Alumni-specific fields
    currentCompany: '',
    jobTitle: '',
    experienceYears: '',
    // Professor-specific fields
    designation: '',
    teachingExperience: '',
    researchAreas: '',
    publications: ''
  });

  // Get user role from session
  const userRole = session?.user?.role || 'STUDENT';

  const roles = [
    { id: 'STUDENT', label: 'Student', icon: GraduationCap },
    { id: 'ALUMNI', label: 'Alumni', icon: Users },
    { id: 'PROFESSOR', label: 'Professor', icon: Shield }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (currentStep < 2) {
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
    if (currentStep === 1) {
      // Role-specific validation
      if (userRole === 'STUDENT' && (!formData.currentYear || !formData.graduationYear)) {
        alert('Please fill in your current year and expected graduation year');
        return;
      }
      if (userRole === 'ALUMNI' && (!formData.graduationYear || !formData.currentCompany || !formData.jobTitle || !formData.experienceYears)) {
        alert('Please fill in all required alumni fields');
        return;
      }
      if (userRole === 'PROFESSOR' && (!formData.designation || !formData.teachingExperience || !formData.researchAreas)) {
        alert('Please fill in all required professor fields');
        return;
      }
    }
    
    // Only submit if we're on the final step
    if (currentStep !== 2) {
      return;
    }
    
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          bio: formData.bio,
          role: userRole,
          linkedin: formData.linkedin,
          github: formData.github,
          // Student-specific fields
          currentYear: formData.currentYear,
          graduationYear: formData.graduationYear,
          cgpa: formData.cgpa,
          // Alumni-specific fields
          currentCompany: formData.currentCompany,
          jobTitle: formData.jobTitle,
          experienceYears: formData.experienceYears,
          // Professor-specific fields
          designation: formData.designation,
          teachingExperience: formData.teachingExperience,
          researchAreas: formData.researchAreas,
          publications: formData.publications
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

  const handleSkip = async () => {
    if (!session?.user?.id) {
      alert('Please log in to continue');
      return;
    }

    try {
      // Mark user as having incomplete profile
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          isIncomplete: true,
          role: userRole
        }),
      });

      if (response.ok) {
        // Redirect based on role
        if (userRole === 'ALUMNI') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to skip onboarding');
      }
    } catch (error) {
      console.error('Skip onboarding error:', error);
      alert('Failed to skip onboarding');
    }
  };

  const steps = [
    { number: 1, title: 'Academic & Professional', icon: GraduationCap },
    { number: 2, title: 'Personal & Social', icon: User }
  ];

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="header">
          <h1 className="title">Complete Your Profile</h1>
          <p className="subtitle">Help others discover and connect with you</p>
          <div className="user-info">
            <p><strong>Name:</strong> {session?.user?.name}</p>
            <p><strong>Role:</strong> {userRole}</p>
            <p><strong>Email:</strong> {session?.user?.email}</p>
          </div>
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
          if (e.key === 'Enter' && currentStep < 2) {
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
              {/* Student-specific questions */}
              {userRole === 'STUDENT' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Current Year</label>
                    <select
                      name="currentYear"
                      className="form-input"
                      value={formData.currentYear || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select your current year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                      <option value="5">5th Year</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Graduation Year</label>
                    <input
                      type="text"
                      name="graduationYear"
                      className="form-input"
                      placeholder="e.g., 2026, 2027"
                      value={formData.graduationYear || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CGPA</label>
                    <input
                      type="text"
                      name="cgpa"
                      className="form-input"
                      placeholder="e.g., 8.5, 9.2"
                      value={formData.cgpa || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skills (Technical & Soft Skills)</label>
                    <input
                      type="text"
                      name="skills"
                      className="form-input"
                      placeholder="e.g., React, Python, Leadership, Communication"
                      value={formData.skills}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Career Interests</label>
                    <input
                      type="text"
                      name="interests"
                      className="form-input"
                      placeholder="e.g., Software Development, Data Science, Research"
                      value={formData.interests}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {/* Alumni-specific questions */}
              {userRole === 'ALUMNI' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Graduation Year</label>
                    <input
                      type="text"
                      name="graduationYear"
                      className="form-input"
                      placeholder="e.g., 2020, 2021"
                      value={formData.graduationYear || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Company</label>
                    <input
                      type="text"
                      name="currentCompany"
                      className="form-input"
                      placeholder="e.g., Google, Microsoft, Self-employed"
                      value={formData.currentCompany || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      className="form-input"
                      placeholder="e.g., Software Engineer, Data Scientist, Entrepreneur"
                      value={formData.jobTitle || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <select
                      name="experienceYears"
                      className="form-input"
                      value={formData.experienceYears || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select years of experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="2-3">2-3 years</option>
                      <option value="4-5">4-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skills & Expertise</label>
                    <input
                      type="text"
                      name="skills"
                      className="form-input"
                      placeholder="e.g., Full-stack Development, Machine Learning, Project Management"
                      value={formData.skills}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {/* Professor-specific questions */}
              {userRole === 'PROFESSOR' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <select
                      name="designation"
                      className="form-input"
                      value={formData.designation || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select your designation</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor">Professor</option>
                      <option value="Head of Department">Head of Department</option>
                      <option value="Dean">Dean</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Years of Teaching Experience</label>
                    <select
                      name="teachingExperience"
                      className="form-input"
                      value={formData.teachingExperience || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select years of teaching experience</option>
                      <option value="0-2">0-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="11-15">11-15 years</option>
                      <option value="15+">15+ years</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Research Areas</label>
                    <input
                      type="text"
                      name="researchAreas"
                      className="form-input"
                      placeholder="e.g., Artificial Intelligence, Computer Networks, Data Science"
                      value={formData.researchAreas || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Publications</label>
                    <input
                      type="text"
                      name="publications"
                      className="form-input"
                      placeholder="e.g., 15 research papers, 3 books, 5 patents"
                      value={formData.publications || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Areas of Expertise</label>
                    <input
                      type="text"
                      name="skills"
                      className="form-input"
                      placeholder="e.g., Machine Learning, Computer Vision, Academic Writing"
                      value={formData.skills}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
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
            
            <motion.button
              type="button"
              className="btn btn-skip"
              onClick={handleSkip}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Skip for now
            </motion.button>
            
            {currentStep < 2 ? (
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