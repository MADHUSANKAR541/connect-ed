'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Camera, 
  MapPin, 
  GraduationCap, 
  Building2, 
  Calendar,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Lock,
  Unlock,
  Star,
  Users,
  MessageSquare,
  Calendar as CalendarIcon,
  Settings,
  User,
  Briefcase,
  Award,
  BookOpen,
  Plus,
  Bell,
  UserPlus
} from 'lucide-react';
import '../../styles/profile.scss';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'education' | 'settings'>('overview');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const user = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@mit.edu',
    avatar: 'JD',
    role: 'Student',
    college: 'MIT',
    department: 'Computer Science',
    batch: '2024',
    location: 'Cambridge, MA',
    bio: 'Passionate computer science student with a keen interest in artificial intelligence and machine learning. Currently working on research projects in natural language processing.',
    phone: '+1 (555) 123-4567',
    website: 'https://johndoe.dev',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: '@johndoe',
    rating: 4.8,
    connections: 156,
    profileViews: 234,
    isVerified: true,
    isOnline: true,
    joined: '2023-09-01',
    lastActive: '2 minutes ago'
  };

  // Remove hardcoded experience, education, and skills
  const experience = [];
  const education = [];
  const skills = [];

  const achievements = [
    {
      id: 1,
      title: 'Dean\'s List',
      institution: 'MIT',
      date: '2023',
      description: 'Academic excellence award for maintaining 3.9+ GPA',
      isPublic: true
    },
    {
      id: 2,
      title: 'HackMIT Winner',
      institution: 'MIT',
      date: '2023',
      description: 'First place in MIT\'s annual hackathon for AI-powered education platform',
      isPublic: true
    },
    {
      id: 3,
      title: 'Research Fellowship',
      institution: 'MIT AI Lab',
      date: '2023',
      description: 'Selected for prestigious research fellowship in artificial intelligence',
      isPublic: false
    }
  ];

  const stats = [
    { label: 'Profile Views', value: user.profileViews, icon: Eye },
    { label: 'Connections', value: user.connections, icon: Users },
    { label: 'Messages', value: 89, icon: MessageSquare },
    { label: 'Calls', value: 23, icon: CalendarIcon }
  ];

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving profile changes...');
    setIsEditing(false);
  };

  const togglePrivacy = (itemId: number, type: 'experience' | 'education' | 'achievement') => {
    // TODO: Implement privacy toggle logic
    console.log('Toggling privacy for:', type, itemId);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="header-content">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your professional profile and privacy settings</p>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <button 
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                <X size={16} />
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-cover">
              <div className="profile-avatar">
                <span>{user.avatar}</span>
                {user.isOnline && <div className="online-indicator" />}
                {user.isVerified && <div className="verified-badge">✓</div>}
                {isEditing && (
                  <button className="avatar-edit-btn">
                    <Camera size={16} />
                  </button>
                )}
              </div>
              <div className="profile-info">
                <div className="profile-name-section">
                  <h2 className="profile-name">{user.name}</h2>
                  <div className="profile-badges">
                    <span className="role-badge">{user.role}</span>
                    <div className="rating-badge">
                      <Star size={14} />
                      <span>{user.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="profile-meta">
                  <div className="meta-item">
                    <GraduationCap size={16} />
                    <span>{user.college}</span>
                  </div>
                  <div className="meta-item">
                    <Building2 size={16} />
                    <span>{user.department}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>Class of {user.batch}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>{user.location}</span>
                  </div>
                </div>
                <div className="profile-bio">
                  <p>{user.bio}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="contact-section">
              <h3>Contact Information</h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                <div className="contact-item">
                  <Phone size={16} />
                  <span>{user.phone}</span>
                </div>
                <div className="contact-item">
                  <Globe size={16} />
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    {user.website}
                  </a>
                </div>
              </div>
              <div className="social-links">
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                  <Linkedin size={16} />
                </a>
                <a href={user.github} target="_blank" rel="noopener noreferrer" className="social-link">
                  <Github size={16} />
                </a>
                <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="social-link">
                  <Twitter size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="profile-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <User size={16} />
              <span>Overview</span>
            </button>
            <button 
              className={`tab ${activeTab === 'experience' ? 'active' : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              <Briefcase size={16} />
              <span>Experience</span>
            </button>
            <button 
              className={`tab ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <BookOpen size={16} />
              <span>Education</span>
            </button>
            <button 
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overview-content"
              >
                {/* Stats Grid */}
                <div className="stats-grid">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="stat-card">
                        <div className="stat-icon">
                          <Icon size={20} />
                        </div>
                        <div className="stat-info">
                          <span className="stat-value">{stat.value}</span>
                          <span className="stat-label">{stat.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Skills Section */}
                <div className="skills-section">
                  <h3>Skills</h3>
                  <div className="skills-grid">
                    {skills.map((skill, index) => (
                      <div key={index} className="skill-item">
                        <div className="skill-info">
                          <span className="skill-name">{skill.name}</span>
                          <span className="skill-level">{skill.level}</span>
                        </div>
                        <span className="skill-category">{skill.category}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements Section */}
                <div className="achievements-section">
                  <h3>Achievements</h3>
                  <div className="achievements-list">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="achievement-item">
                        <div className="achievement-header">
                          <div className="achievement-info">
                            <h4 className="achievement-title">{achievement.title}</h4>
                            <span className="achievement-institution">{achievement.institution}</span>
                            <span className="achievement-date">{achievement.date}</span>
                          </div>
                          <button 
                            className={`privacy-toggle ${achievement.isPublic ? 'public' : 'private'}`}
                            onClick={() => togglePrivacy(achievement.id, 'achievement')}
                          >
                            {achievement.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                        </div>
                        <p className="achievement-description">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'experience' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="experience-content"
              >
                <div className="section-header">
                  <h3>Work Experience</h3>
                  {isEditing && (
                    <button className="btn btn-primary">
                      <Plus size={16} />
                      Add Experience
                    </button>
                  )}
                </div>
                <div className="experience-list">
                  {experience.map((exp) => (
                    <div key={exp.id} className="experience-item">
                      <div className="experience-header">
                        <div className="experience-info">
                          <h4 className="experience-title">{exp.title}</h4>
                          <span className="experience-company">{exp.company}</span>
                          <span className="experience-location">{exp.location}</span>
                          <span className="experience-duration">{exp.duration}</span>
                        </div>
                        <button 
                          className={`privacy-toggle ${exp.isPublic ? 'public' : 'private'}`}
                          onClick={() => togglePrivacy(exp.id, 'experience')}
                        >
                          {exp.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                      <p className="experience-description">{exp.description}</p>
                      <div className="experience-skills">
                        {exp.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'education' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="education-content"
              >
                <div className="section-header">
                  <h3>Education</h3>
                  {isEditing && (
                    <button className="btn btn-primary">
                      <Plus size={16} />
                      Add Education
                    </button>
                  )}
                </div>
                <div className="education-list">
                  {education.map((edu) => (
                    <div key={edu.id} className="education-item">
                      <div className="education-header">
                        <div className="education-info">
                          <h4 className="education-degree">{edu.degree}</h4>
                          <span className="education-institution">{edu.institution}</span>
                          <span className="education-location">{edu.location}</span>
                          <span className="education-duration">{edu.duration}</span>
                          <span className="education-gpa">GPA: {edu.gpa}</span>
                        </div>
                        <button 
                          className={`privacy-toggle ${edu.isPublic ? 'public' : 'private'}`}
                          onClick={() => togglePrivacy(edu.id, 'education')}
                        >
                          {edu.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                      <p className="education-description">{edu.description}</p>
                      <div className="education-achievements">
                        <h5>Achievements:</h5>
                        <ul>
                          {edu.achievements.map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="settings-content"
              >
                <div className="settings-grid">
                  <div className="setting-card">
                    <div className="setting-header">
                      <div className="setting-icon">
                        <Eye size={20} />
                      </div>
                      <div className="setting-info">
                        <h3>Profile Visibility</h3>
                        <p>Control who can see your profile</p>
                      </div>
                    </div>
                    <div className="setting-controls">
                      <select className="visibility-select">
                        <option value="public">Public</option>
                        <option value="connections">Connections Only</option>
                        <option value="college">College Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="setting-card">
                    <div className="setting-header">
                      <div className="setting-icon">
                        <MessageSquare size={20} />
                      </div>
                      <div className="setting-info">
                        <h3>Message Privacy</h3>
                        <p>Who can send you messages</p>
                      </div>
                    </div>
                    <div className="setting-controls">
                      <select className="visibility-select">
                        <option value="connections">Connections Only</option>
                        <option value="college">College Members</option>
                        <option value="public">Everyone</option>
                      </select>
                    </div>
                  </div>

                  <div className="setting-card">
                    <div className="setting-header">
                      <div className="setting-icon">
                        <Calendar size={20} />
                      </div>
                      <div className="setting-info">
                        <h3>Call Requests</h3>
                        <p>Who can request calls with you</p>
                      </div>
                    </div>
                    <div className="setting-controls">
                      <select className="visibility-select">
                        <option value="connections">Connections Only</option>
                        <option value="college">College Members</option>
                        <option value="public">Everyone</option>
                      </select>
                    </div>
                  </div>

                  <div className="setting-card">
                    <div className="setting-header">
                      <div className="setting-icon">
                        <Bell size={20} />
                      </div>
                      <div className="setting-info">
                        <h3>Notifications</h3>
                        <p>Manage your notification preferences</p>
                      </div>
                    </div>
                    <div className="setting-controls">
                      <button className="btn btn-outline">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="profile-sidebar">
          <div className="sidebar-card">
            <h3>Profile Stats</h3>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-label">Profile Views</span>
                <span className="stat-value">{user.profileViews}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Connections</span>
                <span className="stat-value">{user.connections}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Messages</span>
                <span className="stat-value">89</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Calls</span>
                <span className="stat-value">23</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Quick Actions</h3>
            <div className="action-list">
              <button className="action-btn">
                <MessageSquare size={16} />
                <span>Send Message</span>
              </button>
              <button className="action-btn">
                <Calendar size={16} />
                <span>Schedule Call</span>
              </button>
              <button className="action-btn">
                <UserPlus size={16} />
                <span>Connect</span>
              </button>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Account Info</h3>
            <div className="account-info">
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">{user.joined}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Active</span>
                <span className="info-value">{user.lastActive}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value">
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 