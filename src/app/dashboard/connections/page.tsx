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
  Loader2,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import '../../../styles/connections.scss';
import { useSession } from 'next-auth/react';
import { Plus, Video, Phone } from 'lucide-react';

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
  const [scheduleConnection, setScheduleConnection] = useState<Connection | null>(null);
  const { data: session } = useSession();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleReceiver, setScheduleReceiver] = useState('');
  const [callTitle, setCallTitle] = useState('');
  const [callDescription, setCallDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [selectedType, setSelectedType] = useState<'VIDEO' | 'AUDIO'>('VIDEO');
  const [scheduling, setScheduling] = useState(false);

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

  const handleScheduleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleReceiver || !callTitle || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields');
      return;
    }
    setScheduling(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: session?.user?.id,
          receiverId: scheduleReceiver,
          title: callTitle,
          description: callDescription,
          scheduledAt: scheduledAt.toISOString(),
          duration: parseInt(selectedDuration),
          type: selectedType,
        }),
      });
      if (response.ok) {
        setShowScheduleModal(false);
        setCallTitle('');
        setCallDescription('');
        setSelectedDate('');
        setSelectedTime('');
        setSelectedDuration('30');
        setSelectedType('VIDEO');
        setScheduleReceiver('');
        // Optionally, show a success message or refresh calls
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to schedule call');
      }
    } catch (error) {
      alert('Failed to schedule call');
    } finally {
      setScheduling(false);
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
                        <button className="btn btn-outline" onClick={() => { setShowScheduleModal(true); setScheduleReceiver(connection.user.id); }}>
                          <CalendarIcon size={16} />
                          Schedule Call
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          )}
        </div>
        {scheduleConnection && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Schedule Call</h2>
              <p>Schedule a call with <strong>{scheduleConnection.user.name}</strong></p>
              <button className="btn btn-primary" onClick={() => setScheduleConnection(null)}>Close</button>
            </div>
          </div>
        )}
        {/* New Call Modal */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="modal-header">
              <h2>Schedule New Call</h2>
              <button
                className="close-btn"
                onClick={() => setShowScheduleModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleCall} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={callTitle}
                  onChange={(e) => setCallTitle(e.target.value)}
                  placeholder="Call title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={callDescription}
                  onChange={(e) => setCallDescription(e.target.value)}
                  placeholder="Call description"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as 'VIDEO' | 'AUDIO')}
                  >
                    <option value="VIDEO">Video Call</option>
                    <option value="AUDIO">Audio Call</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Select Recipient</label>
                <select
                  value={scheduleReceiver} 
                  onChange={(e) => setScheduleReceiver(e.target.value)}
                  required
                >
                  <option value="">Choose a connection...</option>
                  {connections.map((connection) => (
                    <option key={connection.id} value={connection.user.id}>
                      {connection.user.name} ({connection.user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Scheduling...' : 'Schedule Call'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </div>
  );
} 