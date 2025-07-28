'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  MessageSquare, 
  Calendar,
  MapPin,
  GraduationCap,
  Building2,
  Star,
  MoreVertical,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import '../../../styles/connections.scss';

interface Connection {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    college: {
      name: string;
    };
    department?: string;
    location?: string;
    rating: number;
    isOnline: boolean;
  };
  isSender: boolean;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConnections();
  }, [activeTab]);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: activeTab === 'all' ? 'all' : activeTab,
        limit: '50',
      });

      const response = await fetch(`/api/connections?${params}`);
      const data = await response.json();

      if (response.ok) {
        setConnections(data.connections);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionAction = async (connectionId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }),
      });

      if (response.ok) {
        loadConnections(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating connection:', error);
    }
  };

  const filteredConnections = connections.filter(connection =>
    connection.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.user.college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingConnections = filteredConnections.filter(c => c.status === 'PENDING');
  const acceptedConnections = filteredConnections.filter(c => c.status === 'ACCEPTED');

  return (
    <div className="connections-page">
      <div className="connections-header">
        <div className="header-content">
          <h1 className="page-title">Connections</h1>
          <p className="page-subtitle">Manage your professional network</p>
        </div>
      </div>

      <div className="connections-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Connections
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
          {pendingConnections.length > 0 && (
            <span className="badge">{pendingConnections.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          Accepted
        </button>
      </div>

      <div className="search-section">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="connections-content">
        {loading ? (
          <div className="loading-state">
            <Loader2 size={24} className="spinner" />
            <p>Loading connections...</p>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No connections found</h3>
            <p>
              {activeTab === 'pending' 
                ? 'You don\'t have any pending connection requests'
                : activeTab === 'accepted'
                ? 'You don\'t have any accepted connections yet'
                : 'Start connecting with other students, alumni, and professors'
              }
            </p>
          </div>
        ) : (
          <div className="connections-grid">
            {filteredConnections.map((connection) => (
              <motion.div
                key={connection.id}
                className="connection-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="connection-header">
                  <div className="user-avatar">
                    <span>{connection.user.avatar}</span>
                    {connection.user.isOnline && <div className="online-indicator" />}
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{connection.user.name}</h3>
                    <div className="user-meta">
                      <span className="user-role">{connection.user.role}</span>
                      <span className="user-college">{connection.user.college.name}</span>
                    </div>
                    {connection.user.department && (
                      <div className="user-department">
                        <GraduationCap size={14} />
                        <span>{connection.user.department}</span>
                      </div>
                    )}
                    {connection.user.location && (
                      <div className="user-location">
                        <MapPin size={14} />
                        <span>{connection.user.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="user-rating">
                    <Star size={16} />
                    <span>{connection.user.rating}</span>
                  </div>
                </div>

                {connection.message && (
                  <div className="connection-message">
                    <p>"{connection.message}"</p>
                  </div>
                )}

                <div className="connection-status">
                  <span className={`status-badge ${connection.status.toLowerCase()}`}>
                    {connection.status}
                  </span>
                  <span className="connection-date">
                    {new Date(connection.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="connection-actions">
                  {connection.status === 'PENDING' && !connection.isSender && (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={() => handleConnectionAction(connection.id, 'accept')}
                      >
                        <Check size={16} />
                        Accept
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleConnectionAction(connection.id, 'reject')}
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  {connection.status === 'ACCEPTED' && (
                    <>
                      <button className="btn btn-primary">
                        <MessageSquare size={16} />
                        Message
                      </button>
                      <button className="btn btn-outline">
                        <Calendar size={16} />
                        Schedule Call
                      </button>
                    </>
                  )}
                  {connection.isSender && connection.status === 'PENDING' && (
                    <span className="pending-status">Request sent</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 