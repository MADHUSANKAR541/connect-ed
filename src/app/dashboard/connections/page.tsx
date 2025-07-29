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

interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  college?: string;
  department?: string;
  location?: string;
  bio?: string;
  rating: number;
  isOnline: boolean;
  connectionStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  isSender?: boolean;
}

interface Connection {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  user: User;
  isSender: boolean;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConnections();
  }, [activeTab]);



  const loadConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        status: activeTab === 'all' ? 'accepted' : activeTab, // 'all' should show only accepted connections
        limit: '50',
      });

      const response = await fetch(`/api/connections?${params}`);
      const data = await response.json();

      if (response.ok) {
        setConnections(data.connections || []);
      } else {
        setError(data.error || 'Failed to load connections');
      }
    } catch (error) {
      console.error('Error loading connections:', error);
      setError('Failed to load connections');
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
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update connection');
      }
    } catch (error) {
      console.error('Error updating connection:', error);
      alert('Failed to update connection');
    }
  };

  // Removed filteredConnections since we're now showing all users

  // Connection counts for tabs (if needed in the future)
  const pendingConnections = connections.filter(c => c.status === 'PENDING');
  const acceptedConnections = connections.filter(c => c.status === 'ACCEPTED');

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
          My Connections
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
        {error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={loadConnections} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="loading-state">
            <Loader2 size={24} className="spinner" />
            <p>Loading connections...</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No connections found</h3>
            <p>
              {activeTab === 'pending' 
                ? 'No pending connection requests'
                : activeTab === 'accepted'
                ? 'No accepted connections yet'
                : 'No connections available at the moment'
              }
            </p>
          </div>
        ) : (
          <div className="connections-grid">
            {connections
              .filter(connection => 
                connection.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (connection.user.college || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                connection.user.department?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((connection) => (
                <motion.div
                  key={connection.id}
                  className="connection-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="connection-header">
                    <div className="user-avatar">
                      <span>{connection.user.avatar || 'U'}</span>
                      {connection.user.isOnline && <div className="online-indicator" />}
                    </div>
                    <div className="user-info">
                      <h3 className="user-name">{connection.user.name || 'Unknown User'}</h3>
                      <div className="user-role">{connection.user.role || 'Unknown'}</div>
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
                      <span>{connection.user.rating || 0}</span>
                    </div>
                  </div>

                  <div className="user-college-section">
                    <Building2 size={16} />
                    <span className="user-college-name">{connection.user.college || 'Unknown College'}</span>
                  </div>

                  <div className="connection-status">
                    <span className={`status-badge ${connection.status.toLowerCase()}`}>
                      {connection.status}
                    </span>
                    {connection.isSender && (
                      <span className="sender-badge">You sent this request</span>
                    )}
                  </div>

                  {connection.status === 'PENDING' && !connection.isSender && (
                    <div className="pending-actions">
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
                    </div>
                  )}

                  {connection.status === 'ACCEPTED' && (
                    <div className="connection-actions">
                      <button className="btn btn-outline">
                        <MessageSquare size={16} />
                        Message
                      </button>
                      <button className="btn btn-outline">
                        <Calendar size={16} />
                        Schedule Call
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
} 