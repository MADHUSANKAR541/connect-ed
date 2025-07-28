'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  UserPlus,
  Clock,
  MapPin,
  GraduationCap
} from 'lucide-react';
import '../../styles/dashboard-home.scss';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  type UserData = {
    name?: string;
    role?: string;
    [key: string]: any;
  };
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
    if (session?.user?.id) {
      console.log('Fetching user data for ID:', session.user.id);
      fetchUserData();
    } else {
      console.log('No session user ID found');
      setLoading(false);
    }
  }, [session]);

  const fetchUserData = async () => {
    if (!session || !session.user || !session.user.id) {
      console.log('No session or user ID available for fetchUserData');
      setLoading(false);
      return;
    }
    try {
      console.log('Making API call to fetch user data...');
      const response = await fetch(`/api/profile?userId=${session.user.id}`);
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        setUserData(data.user);
      } else {
        console.log('API call failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="dashboard-home">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="dashboard-home">
        <div className="header">
          <h1 className="title">Please log in</h1>
          <p className="subtitle">You need to be logged in to view your dashboard</p>
        </div>
      </div>
    );
  }

  const userName = (userData as UserData | null)?.name || session?.user?.name || 'User';
  const userRole = (userData as UserData | null)?.role || session?.user?.role || 'Student';

  const stats = [
    { 
      title: 'Connections', 
      value: '24', 
      icon: Users, 
      color: '#6366f1',
      change: '+12%'
    },
    { 
      title: 'Messages', 
      value: '156', 
      icon: MessageSquare, 
      color: '#10b981',
      change: '+8%'
    },
    { 
      title: 'Calls', 
      value: '8', 
      icon: Calendar, 
      color: '#f59e0b',
      change: '+3'
    },
    { 
      title: 'Profile Views', 
      value: '89', 
      icon: TrendingUp, 
      color: '#ef4444',
      change: '+15%'
    }
  ];

  const recentConnections = [
    {
      name: 'Sarah Johnson',
      role: 'Alumni',
      company: 'Google',
      avatar: 'SJ',
      time: '2 hours ago'
    },
    {
      name: 'Mike Chen',
      role: 'Professor',
      department: 'Computer Science',
      avatar: 'MC',
      time: '1 day ago'
    },
    {
      name: 'Emily Davis',
      role: 'Alumni',
      company: 'Microsoft',
      avatar: 'ED',
      time: '2 days ago'
    }
  ];

  const upcomingCalls = [
    {
      name: 'Dr. Robert Wilson',
      topic: 'Career Guidance',
      time: 'Today, 3:00 PM',
      duration: '30 min'
    },
    {
      name: 'Lisa Thompson',
      topic: 'Project Discussion',
      time: 'Tomorrow, 10:00 AM',
      duration: '45 min'
    }
  ];

  return (
    <div className="dashboard-home">
      <div className="header">
        <h1 className="title">Welcome back, {userName}!</h1>
        <p className="subtitle">Here's what's happening in your network</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="stat-icon" style={{ backgroundColor: stat.color + '20' }}>
                <Icon size={24} style={{ color: stat.color }} />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
                <span className="stat-change">{stat.change}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="content-grid">
        {/* Recent Connections */}
        <motion.div 
          className="section-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-header">
            <h2 className="section-title">Recent Connections</h2>
            <button className="view-all">View All</button>
          </div>
          
          <div className="connections-list">
            {recentConnections.map((connection, index) => (
              <div key={index} className="connection-item">
                <div className="connection-avatar">
                  <span>{connection.avatar}</span>
                </div>
                <div className="connection-info">
                  <h4 className="connection-name">{connection.name}</h4>
                  <p className="connection-role">
                    {connection.role}
                    {connection.company && ` • ${connection.company}`}
                    {connection.department && ` • ${connection.department}`}
                  </p>
                </div>
                <span className="connection-time">{connection.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Calls */}
        <motion.div 
          className="section-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <h2 className="section-title">Upcoming Calls</h2>
            <button className="view-all">View All</button>
          </div>
          
          <div className="calls-list">
            {upcomingCalls.map((call, index) => (
              <div key={index} className="call-item">
                <div className="call-icon">
                  <Calendar size={20} />
                </div>
                <div className="call-info">
                  <h4 className="call-name">{call.name}</h4>
                  <p className="call-topic">{call.topic}</p>
                  <div className="call-meta">
                    <span className="call-time">
                      <Clock size={14} />
                      {call.time}
                    </span>
                    <span className="call-duration">{call.duration}</span>
                  </div>
                </div>
                <button className="join-btn">Join</button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="quick-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn">
            <UserPlus size={20} />
            <span>Find Connections</span>
          </button>
          <button className="action-btn">
            <MessageSquare size={20} />
            <span>Send Message</span>
          </button>
          <button className="action-btn">
            <Calendar size={20} />
            <span>Schedule Call</span>
          </button>
          <button className="action-btn">
            <GraduationCap size={20} />
            <span>Update Profile</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
} 