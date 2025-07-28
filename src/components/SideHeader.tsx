'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Search, 
  Users, 
  MessageSquare, 
  Calendar,
  BarChart3,
  BookOpen,
  Briefcase,
  MapPin,
  Star,
  ChevronRight,
  Plus,
  Mail,
  Phone,
  Video
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import '../styles/side-header.module.scss';

interface SideHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SideHeader({ isOpen, onToggle }: SideHeaderProps) {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<'profile' | 'quick-actions' | 'recent'>('profile');

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth' });
  };

  const quickActions = [
    { icon: Search, label: 'Find People', href: '/dashboard/explore', color: 'var(--primary)' },
    { icon: Users, label: 'Connections', href: '/dashboard/connections', color: 'var(--success)' },
    { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages', color: 'var(--info)' },
    { icon: Calendar, label: 'Schedule Call', href: '/dashboard/calls', color: 'var(--warning)' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/insights', color: 'var(--accent)' },
  ];

  const recentActivities = [
    { type: 'connection', text: 'New connection request from Sarah', time: '2m ago', icon: Users },
    { type: 'message', text: 'Message from John about project', time: '15m ago', icon: MessageSquare },
    { type: 'call', text: 'Upcoming call with Prof. Smith', time: '1h ago', icon: Calendar },
    { type: 'profile', text: 'Someone viewed your profile', time: '2h ago', icon: User },
  ];

  return (
    <motion.div
      className={`side-header ${isOpen ? 'open' : ''}`}
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...({} as any)}
    >
      <div className="side-header-content">
        {/* User Profile Section */}
        <div className="user-section">
          <div className="user-avatar">
            <span>{session?.user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div className="user-info">
            <h3 className="user-name">{session?.user?.name || 'User'}</h3>
            <p className="user-role">Student</p>
            <div className="user-status">
              <div className="status-indicator online"></div>
              <span>Online</span>
            </div>
          </div>
          <button className="toggle-btn" onClick={onToggle}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={16} />
            <span>Profile</span>
          </button>
          <button
            className={`nav-tab ${activeSection === 'quick-actions' ? 'active' : ''}`}
            onClick={() => setActiveSection('quick-actions')}
          >
            <Plus size={16} />
            <span>Quick Actions</span>
          </button>
          <button
            className={`nav-tab ${activeSection === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveSection('recent')}
          >
            <Bell size={16} />
            <span>Recent</span>
          </button>
        </div>

        {/* Content Sections */}
        <div className="content-section">
          {activeSection === 'profile' && (
            <motion.div
              className="profile-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              {...({} as any)}
            >
              <div className="profile-stats">
                <div className="stat-item">
                  <Users size={16} />
                  <div>
                    <span className="stat-value">24</span>
                    <span className="stat-label">Connections</span>
                  </div>
                </div>
                <div className="stat-item">
                  <MessageSquare size={16} />
                  <div>
                    <span className="stat-value">12</span>
                    <span className="stat-label">Messages</span>
                  </div>
                </div>
                <div className="stat-item">
                  <Calendar size={16} />
                  <div>
                    <span className="stat-value">3</span>
                    <span className="stat-label">Upcoming Calls</span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <a href="/dashboard/profile" className="action-btn">
                  <User size={16} />
                  <span>View Profile</span>
                </a>
                <a href="/dashboard/settings" className="action-btn">
                  <Settings size={16} />
                  <span>Settings</span>
                </a>
              </div>
            </motion.div>
          )}

          {activeSection === 'quick-actions' && (
            <motion.div
              className="quick-actions-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              {...({} as any)}
            >
              <h4 className="section-title">Quick Actions</h4>
              <div className="actions-grid">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className="action-card"
                      style={{ '--action-color': action.color } as any}
                    >
                      <div className="action-icon">
                        <Icon size={20} />
                      </div>
                      <span className="action-label">{action.label}</span>
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeSection === 'recent' && (
            <motion.div
              className="recent-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              {...({} as any)}
            >
              <h4 className="section-title">Recent Activity</h4>
              <div className="activity-list">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        <Icon size={16} />
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">{activity.text}</p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="footer-actions">
          <button className="logout-btn" onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
} 