'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Calendar,
  Eye,
  Star,
  MapPin,
  Building2,
  GraduationCap,
  Activity,
  Target,
  Award,
  Clock,
  Filter,
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import '../../styles/insights.scss';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface TopConnection {
  id: string;
  avatar: string;
  name: string;
  college: string;
  role: string;
  mutualConnections: number;
  lastInteraction: string;
  rating: number;
}

interface CollegeStat {
  name: string;
  connections: number;
  views: number;
  messages: number;
  growth: string;
}

interface SkillTrend {
  skill: string;
  connections: number;
  growth: string;
}

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('connections');

  const overviewStats = [
    {
      title: 'Total Connections',
      value: '156',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'var(--primary)'
    },
    {
      title: 'Profile Views',
      value: '2,847',
      change: '+8%',
      trend: 'up',
      icon: Eye,
      color: 'var(--success)'
    },
    {
      title: 'Messages Sent',
      value: '89',
      change: '+23%',
      trend: 'up',
      icon: MessageSquare,
      color: 'var(--info)'
    },
    {
      title: 'Calls Scheduled',
      value: '23',
      change: '-5%',
      trend: 'down',
      icon: Calendar,
      color: 'var(--warning)'
    }
  ];

  const activityData = [
    { day: 'Mon', connections: 12, views: 45, messages: 8 },
    { day: 'Tue', connections: 8, views: 38, messages: 12 },
    { day: 'Wed', connections: 15, views: 52, messages: 6 },
    { day: 'Thu', connections: 10, views: 41, messages: 15 },
    { day: 'Fri', connections: 18, views: 67, messages: 9 },
    { day: 'Sat', connections: 6, views: 28, messages: 4 },
    { day: 'Sun', connections: 4, views: 22, messages: 3 }
  ];

  // Remove hardcoded demo data
  const topConnections: TopConnection[] = [];
  const collegeStats: CollegeStat[] = [];
  const skillTrends: SkillTrend[] = [];

  const recentActivity = [
    {
      id: 1,
      type: 'connection',
      user: 'Sarah Wilson',
      action: 'connected with you',
      time: '2 hours ago',
      icon: Users
    },
    {
      id: 2,
      type: 'message',
      user: 'Mike Johnson',
      action: 'sent you a message',
      time: '4 hours ago',
      icon: MessageSquare
    },
    {
      id: 3,
      type: 'call',
      user: 'Emily Brown',
      action: 'scheduled a call',
      time: '1 day ago',
      icon: Calendar
    },
    {
      id: 4,
      type: 'view',
      user: 'Alex Chen',
      action: 'viewed your profile',
      time: '2 days ago',
      icon: Eye
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp size={16} />;
      case 'down': return <ArrowDown size={16} />;
      default: return <Minus size={16} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'var(--success)';
      case 'down': return 'var(--destructive)';
      default: return 'var(--muted)';
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="insights-page">
      <div className="insights-header">
        <div className="header-content">
          <h1 className="page-title">Analytics & Insights</h1>
          <p className="page-subtitle">Track your networking progress and discover opportunities</p>
        </div>
        <div className="header-actions">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="btn btn-outline">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="overview-stats">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-info">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
                <div className="stat-change" style={{ color: getTrendColor(stat.trend) }}>
                  {getTrendIcon(stat.trend)}
                  <span>{stat.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="insights-content">
        <div className="main-content">
          {/* Activity Chart */}
          <div className="chart-section">
            <div className="section-header">
              <h2>Activity Overview</h2>
              <div className="chart-controls">
                <button 
                  className={`metric-btn ${selectedMetric === 'connections' ? 'active' : ''}`}
                  onClick={() => setSelectedMetric('connections')}
                >
                  Connections
                </button>
                <button 
                  className={`metric-btn ${selectedMetric === 'views' ? 'active' : ''}`}
                  onClick={() => setSelectedMetric('views')}
                >
                  Views
                </button>
                <button 
                  className={`metric-btn ${selectedMetric === 'messages' ? 'active' : ''}`}
                  onClick={() => setSelectedMetric('messages')}
                >
                  Messages
                </button>
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-placeholder">
                <LineChart size={48} />
                <h3>Activity Chart</h3>
                <p>Visual representation of your {selectedMetric} over time</p>
                <div className="chart-data">
                  {activityData.map((day, index) => {
                    const value = day[selectedMetric as keyof typeof day] as number;
                    return (
                      <div key={index} className="data-point">
                        <div className="data-bar" style={{ 
                          height: `${(value / 70) * 100}%` 
                        }}></div>
                        <span className="data-label">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Top Connections */}
          <div className="connections-section">
            <div className="section-header">
              <h2>Top Connections</h2>
              <button className="btn btn-outline">View All</button>
            </div>
            <div className="connections-list">
              {topConnections.map((connection, index) => (
                <motion.div
                  key={connection.id}
                  className="connection-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="connection-avatar">
                    <span>{connection.avatar}</span>
                  </div>
                  <div className="connection-info">
                    <h4 className="connection-name">{connection.name}</h4>
                    <div className="connection-meta">
                      <span className="connection-college">{connection.college}</span>
                      <span className="connection-role">{connection.role}</span>
                    </div>
                    <div className="connection-stats">
                      <span className="mutual-connections">
                        {connection.mutualConnections} mutual connections
                      </span>
                      <span className="last-interaction">
                        {connection.lastInteraction}
                      </span>
                    </div>
                  </div>
                  <div className="connection-rating">
                    <Star size={16} />
                    <span>{connection.rating}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          {/* College Performance */}
          <div className="sidebar-card">
            <div className="card-header">
              <h3>College Performance</h3>
              <Building2 size={20} />
            </div>
            <div className="college-stats-list">
              {collegeStats.map((college, index) => (
                <div key={index} className="college-stat">
                  <div className="college-info">
                    <h4 className="college-name">{college.name}</h4>
                    <div className="college-metrics">
                      <span>{college.connections} connections</span>
                      <span>{college.views} views</span>
                      <span>{college.messages} messages</span>
                    </div>
                  </div>
                  <div className="college-growth">
                    <span className="growth-value">{college.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Trends */}
          <div className="sidebar-card">
            <div className="card-header">
              <h3>Skill Trends</h3>
              <TrendingUp size={20} />
            </div>
            <div className="skill-trends-list">
              {skillTrends.map((skill, index) => (
                <div key={index} className="skill-trend">
                  <div className="skill-info">
                    <h4 className="skill-name">{skill.skill}</h4>
                    <span className="skill-connections">{skill.connections} connections</span>
                  </div>
                  <div className="skill-growth">
                    <span className="growth-value">{skill.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="sidebar-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <Activity size={20} />
            </div>
            <div className="activity-list">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      <Icon size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <span className="activity-user">{activity.user}</span>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                      <p className="activity-action">{activity.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goals & Targets */}
          <div className="sidebar-card">
            <div className="card-header">
              <h3>Goals & Targets</h3>
              <Target size={20} />
            </div>
            <div className="goals-list">
              <div className="goal-item">
                <div className="goal-info">
                  <h4 className="goal-title">Monthly Connections</h4>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <span className="progress-text">75% (15/20)</span>
                  </div>
                </div>
              </div>
              <div className="goal-item">
                <div className="goal-info">
                  <h4 className="goal-title">Profile Views</h4>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '60%' }}></div>
                    </div>
                    <span className="progress-text">60% (120/200)</span>
                  </div>
                </div>
              </div>
              <div className="goal-item">
                <div className="goal-info">
                  <h4 className="goal-title">Messages Sent</h4>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '90%' }}></div>
                    </div>
                    <span className="progress-text">90% (18/20)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AuthenticatedLayout>
  );
} 