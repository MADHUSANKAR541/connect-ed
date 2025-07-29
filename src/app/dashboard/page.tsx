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
  GraduationCap,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import '../../styles/dashboard-home.scss';

interface DashboardStats {
  connections: number;
  messages: number;
  calls: number;
  profileViews: number;
  connectionsChange: number;
  messagesChange: number;
  callsChange: number;
  viewsChange: number;
}

interface RecentConnection {
  id: string;
  name: string;
  role: string;
  company?: string;
  department?: string;
  avatar: string;
  time: string;
  isOnline?: boolean;
}

interface UpcomingCall {
  id: string;
  name: string;
  topic: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'pending' | 'completed';
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    connections: 0,
    messages: 0,
    calls: 0,
    profileViews: 0,
    connectionsChange: 0,
    messagesChange: 0,
    callsChange: 0,
    viewsChange: 0
  });
  const [recentConnections, setRecentConnections] = useState<RecentConnection[]>([]);
  const [upcomingCalls, setUpcomingCalls] = useState<UpcomingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    if (!session?.user?.id) return;
    
    try {
      setRefreshing(true);
      
      // Fetch user profile data
      const profileResponse = await fetch(`/api/profile?userId=${session.user.id}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserData(profileData.user);
      }

      // Fetch dashboard stats
      const statsResponse = await fetch(`/api/dashboard/stats?userId=${session.user.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDashboardStats(statsData);
      } else {
        // Fallback to mock data if API doesn't exist
        setDashboardStats({
          connections: 24,
          messages: 156,
          calls: 8,
          profileViews: 89,
          connectionsChange: 12,
          messagesChange: 8,
          callsChange: 3,
          viewsChange: 15
        });
      }

      // Fetch recent connections
      const connectionsResponse = await fetch(`/api/connections?status=accepted&limit=3`);
      if (connectionsResponse.ok) {
        const connectionsData = await connectionsResponse.json();
        console.log('Real connections data:', connectionsData);
        
        // Transform the API response to match our interface
        const transformedConnections = connectionsData.connections?.map((connection: any) => ({
          id: connection.id,
          name: connection.user.name,
          role: connection.user.role,
          company: connection.user.current_company,
          department: connection.user.department,
          avatar: connection.user.avatar || connection.user.name.charAt(0).toUpperCase(),
          time: new Date(connection.updatedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          isOnline: connection.user.isOnline || false
        })) || [];
        
        setRecentConnections(transformedConnections);
        console.log('Transformed connections:', transformedConnections);
      } else {
        console.log('Connections API failed, using fallback data');
        // Fallback to mock data
        setRecentConnections([
          {
            id: '1',
            name: 'Mega',
            role: 'Alumni',
            company: 'Google',
            avatar: 'M',
            time: '2 hours ago',
            isOnline: true
          },
          {
            id: '2',
            name: 'Kavin',
            role: 'Professor',
            department: 'Computer Science',
            avatar: 'K',
            time: '1 day ago',
            isOnline: false
          },
          {
            id: '3',
            name: 'Aravinth',
            role: 'Alumni',
            company: 'Microsoft',
            avatar: 'A',
            time: '2 days ago',
            isOnline: true
          }
        ]);
      }

      // Fetch upcoming calls
      const callsResponse = await fetch(`/api/calls?userId=${session.user.id}&status=scheduled&limit=2`);
      if (callsResponse.ok) {
        const callsData = await callsResponse.json();
        setUpcomingCalls(callsData.calls || []);
      } else {
        // Fallback to mock data
        setUpcomingCalls([
          {
            id: '1',
            name: 'Sankar',
            topic: 'Career Guidance',
            time: 'Today, 3:00 PM',
            duration: '30 min',
            status: 'scheduled'
          },
          {
            id: '2',
            name: 'Riya',
            topic: 'Project Discussion',
            time: 'Tomorrow, 10:00 AM',
            duration: '45 min',
            status: 'scheduled'
          }
        ]);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [session]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleViewAll = (section: string) => {
    // Navigate to respective pages
    switch (section) {
      case 'connections':
        window.location.href = '/dashboard/connections';
        break;
      case 'calls':
        window.location.href = '/dashboard/calls';
        break;
      case 'messages':
        window.location.href = '/dashboard/messages';
        break;
    }
  };

  const handleConnectionClick = (connectionId: string) => {
    // Navigate to connection profile or start chat
    window.location.href = `/dashboard/connections/${connectionId}`;
  };

  const handleCallClick = (callId: string) => {
    // Navigate to call details or join call
    window.location.href = `/dashboard/calls/${callId}`;
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="dashboard-home">
        <div className="loading">
          <RefreshCw className="animate-spin" size={24} />
          <p>Loading your dashboard...</p>
        </div>
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

  const userName = userData?.name || session?.user?.name || 'User';
  const userRole = userData?.role || session?.user?.role || 'Student';

  const stats = [
    { 
      title: 'Connections', 
      value: dashboardStats.connections.toString(), 
      icon: Users, 
      color: '#6366f1',
      change: `${dashboardStats.connectionsChange > 0 ? '+' : ''}${dashboardStats.connectionsChange}%`
    },
    { 
      title: 'Messages', 
      value: dashboardStats.messages.toString(), 
      icon: MessageSquare, 
      color: '#10b981',
      change: `${dashboardStats.messagesChange > 0 ? '+' : ''}${dashboardStats.messagesChange}%`
    },
    { 
      title: 'Calls', 
      value: dashboardStats.calls.toString(), 
      icon: Calendar, 
      color: '#f59e0b',
      change: `${dashboardStats.callsChange > 0 ? '+' : ''}${dashboardStats.callsChange}`
    },
    { 
      title: 'Profile Views', 
      value: dashboardStats.profileViews.toString(), 
      icon: TrendingUp, 
      color: '#ef4444',
      change: `${dashboardStats.viewsChange > 0 ? '+' : ''}${dashboardStats.viewsChange}%`
    }
  ];

  return (
    <div className="dashboard-home">
      <div className="header">
        <div className="header-content">
          <h1 className="title">Welcome back, {userName}!</h1>
          <p className="subtitle">Here's what's happening in your network</p>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh dashboard"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <span className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
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
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="stat-icon" style={{ backgroundColor: stat.color + '20' }}>
                <Icon size={24} style={{ color: stat.color }} />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
                <span className={`stat-change ${parseInt(stat.change) >= 0 ? 'positive' : 'negative'}`}>
                  {stat.change}
                </span>
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
            <button 
              className="view-all-btn"
              onClick={() => handleViewAll('connections')}
            >
              View All
              <ExternalLink size={14} />
            </button>
          </div>
          
          <div className="connections-list">
            {recentConnections.map((connection, index) => (
              <motion.div
                key={connection.id}
                className="connection-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleConnectionClick(connection.id)}
              >
                <div className="connection-avatar">
                  <span>{connection.avatar}</span>
                  {connection.isOnline && <div className="online-indicator" />}
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
              </motion.div>
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
            <button 
              className="view-all-btn"
              onClick={() => handleViewAll('calls')}
            >
              View All
              <ExternalLink size={14} />
            </button>
          </div>
          
          <div className="calls-list">
            {upcomingCalls.map((call, index) => (
              <motion.div
                key={call.id}
                className="call-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleCallClick(call.id)}
              >
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
                <div className={`call-status ${call.status}`}>
                  {call.status === 'scheduled' ? 'Scheduled' : call.status}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 