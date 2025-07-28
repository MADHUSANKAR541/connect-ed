'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  Shield, 
  Settings, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  MessageSquare,
  Video,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import '../../styles/admin.scss';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'colleges' | 'settings'>('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'var(--primary)'
    },
    {
      title: 'Active Colleges',
      value: '156',
      change: '+3%',
      trend: 'up',
      icon: Building2,
      color: 'var(--success)'
    },
    {
      title: 'Pending Approvals',
      value: '23',
      change: '-8%',
      trend: 'down',
      icon: Shield,
      color: 'var(--warning)'
    },
    {
      title: 'Platform Health',
      value: '98.5%',
      change: '+0.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'var(--info)'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'user_registered',
      user: 'Sarah Wilson',
      college: 'MIT',
      role: 'Student',
      time: '2 minutes ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'college_approved',
      user: 'Admin',
      college: 'Stanford University',
      time: '15 minutes ago',
      status: 'approved'
    },
    {
      id: 3,
      type: 'user_suspended',
      user: 'Mike Johnson',
      college: 'Harvard',
      role: 'Student',
      time: '1 hour ago',
      status: 'suspended'
    },
    {
      id: 4,
      type: 'system_update',
      user: 'System',
      description: 'Platform maintenance completed',
      time: '2 hours ago',
      status: 'completed'
    }
  ];

  const users = [
    {
      id: 1,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@mit.edu',
      college: 'MIT',
      role: 'Student',
      status: 'active',
      joined: '2024-01-10',
      lastActive: '2 minutes ago'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      email: 'mike.johnson@harvard.edu',
      college: 'Harvard',
      role: 'Student',
      status: 'suspended',
      joined: '2024-01-08',
      lastActive: '1 hour ago'
    },
    {
      id: 3,
      name: 'Emily Brown',
      email: 'emily.brown@stanford.edu',
      college: 'Stanford',
      role: 'Professor',
      status: 'active',
      joined: '2024-01-05',
      lastActive: '30 minutes ago'
    },
    {
      id: 4,
      name: 'Alex Chen',
      email: 'alex.chen@berkeley.edu',
      college: 'UC Berkeley',
      role: 'Alumni',
      status: 'pending',
      joined: '2024-01-12',
      lastActive: 'Never'
    }
  ];

  const colleges = [
    {
      id: 1,
      name: 'MIT',
      domain: 'mit.edu',
      status: 'active',
      users: 847,
      admins: 3,
      joined: '2023-12-01'
    },
    {
      id: 2,
      name: 'Harvard University',
      domain: 'harvard.edu',
      status: 'active',
      users: 623,
      admins: 2,
      joined: '2023-11-15'
    },
    {
      id: 3,
      name: 'Stanford University',
      domain: 'stanford.edu',
      status: 'pending',
      users: 0,
      admins: 1,
      joined: '2024-01-10'
    },
    {
      id: 4,
      name: 'UC Berkeley',
      domain: 'berkeley.edu',
      status: 'active',
      users: 456,
      admins: 2,
      joined: '2023-10-20'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return <UserCheck size={16} />;
      case 'college_approved': return <Building2 size={16} />;
      case 'user_suspended': return <UserX size={16} />;
      case 'system_update': return <Settings size={16} />;
      default: return <Eye size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--success)';
      case 'pending': return 'var(--warning)';
      case 'suspended': return 'var(--destructive)';
      case 'approved': return 'var(--success)';
      case 'completed': return 'var(--info)';
      default: return 'var(--muted)';
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="admin-page">
        <div className="admin-header">
        <div className="header-content">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage users, colleges, and platform settings</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Data
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            Add College
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={18} />
          <span>Overview</span>
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          <span>Users</span>
        </button>
        <button 
          className={`tab ${activeTab === 'colleges' ? 'active' : ''}`}
          onClick={() => setActiveTab('colleges')}
        >
          <Building2 size={18} />
          <span>Colleges</span>
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>

      <div className="admin-content">
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
                    <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                      <Icon size={24} />
                    </div>
                    <div className="stat-info">
                      <h3 className="stat-value">{stat.value}</h3>
                      <p className="stat-title">{stat.title}</p>
                      <span className={`stat-change ${stat.trend}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
                <button className="btn btn-outline">View All</button>
              </div>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <span className="activity-user">{activity.user}</span>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                      <p className="activity-description">
                        {activity.type === 'user_registered' && `${activity.user} registered as ${activity.role} from ${activity.college}`}
                        {activity.type === 'college_approved' && `${activity.college} was approved`}
                        {activity.type === 'user_suspended' && `${activity.user} was suspended`}
                        {activity.type === 'system_update' && activity.description}
                      </p>
                      <span 
                        className="activity-status"
                        style={{ backgroundColor: getStatusColor(activity.status) }}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="users-content"
          >
            <div className="content-header">
              <div className="search-filters">
                <div className="search-container">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="search-input"
                  />
                </div>
                <button className="btn btn-outline">
                  <Filter size={16} />
                  Filters
                </button>
              </div>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add User
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>College</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{user.college}</td>
                      <td>
                        <span className="role-badge">{user.role}</span>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(user.status) }}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>{user.joined}</td>
                      <td>{user.lastActive}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn">
                            <Eye size={16} />
                          </button>
                          <button className="action-btn">
                            <Edit size={16} />
                          </button>
                          <button className="action-btn">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'colleges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="colleges-content"
          >
            <div className="content-header">
              <div className="search-filters">
                <div className="search-container">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search colleges..."
                    className="search-input"
                  />
                </div>
                <button className="btn btn-outline">
                  <Filter size={16} />
                  Filters
                </button>
              </div>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add College
              </button>
            </div>

            <div className="colleges-grid">
              {colleges.map((college) => (
                <div key={college.id} className="college-card">
                  <div className="college-header">
                    <div className="college-info">
                      <h3 className="college-name">{college.name}</h3>
                      <span className="college-domain">{college.domain}</span>
                    </div>
                    <div className="college-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(college.status) }}
                      >
                        {college.status}
                      </span>
                    </div>
                  </div>
                  <div className="college-stats">
                    <div className="stat">
                      <span className="stat-label">Users</span>
                      <span className="stat-value">{college.users}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Admins</span>
                      <span className="stat-value">{college.admins}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Joined</span>
                      <span className="stat-value">{college.joined}</span>
                    </div>
                  </div>
                  <div className="college-actions">
                    <button className="btn btn-outline">
                      <Eye size={16} />
                      View
                    </button>
                    <button className="btn btn-secondary">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button className="btn btn-destructive">
                      <Trash2 size={16} />
                    </button>
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
                    <Globe size={20} />
                  </div>
                  <div className="setting-info">
                    <h3>Platform Access</h3>
                    <p>Control who can access the platform</p>
                  </div>
                </div>
                <div className="setting-controls">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="setting-status">Global access enabled</span>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon">
                    <Lock size={20} />
                  </div>
                  <div className="setting-info">
                    <h3>College Verification</h3>
                    <p>Require email domain verification</p>
                  </div>
                </div>
                <div className="setting-controls">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="setting-status">Domain verification enabled</span>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon">
                    <MessageSquare size={20} />
                  </div>
                  <div className="setting-info">
                    <h3>Messaging</h3>
                    <p>Allow direct messaging between users</p>
                  </div>
                </div>
                <div className="setting-controls">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="setting-status">Messaging enabled</span>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <div className="setting-icon">
                    <Video size={20} />
                  </div>
                  <div className="setting-info">
                    <h3>Video Calls</h3>
                    <p>Enable video calling features</p>
                  </div>
                </div>
                <div className="setting-controls">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="setting-status">Video calls enabled</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      </div>
    </AuthenticatedLayout>
  );
} 