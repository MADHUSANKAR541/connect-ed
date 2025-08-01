'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Phone, 
  MessageSquare, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Check,
  X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import VideoCall from '@/components/VideoCall';

import '../../../styles/calls.scss';
import '../../../styles/video-call.scss';

interface Call {
  id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration: number;
  type: 'VIDEO' | 'AUDIO';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  sender_id: string;
  receiver_id: string;
  sender?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  receiver?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  isSender?: boolean;
}

interface Connection {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
}

export default function CallsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'requests'>('upcoming');
  const [showNewCall, setShowNewCall] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [selectedType, setSelectedType] = useState<'VIDEO' | 'AUDIO'>('VIDEO');
  const [callTitle, setCallTitle] = useState('');
  const [callDescription, setCallDescription] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCalls();
    loadConnections();
  }, [activeTab]);

  const loadCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/calls');
      const data = await response.json();

      if (response.ok) {
        // Transform the calls to add isSender property
        const transformedCalls = data.calls?.map((call: Call) => ({
          ...call,
          isSender: call.sender_id === session?.user?.id
        })) || [];
        setCalls(transformedCalls);
      } else {
        setError(data.error || 'Failed to load calls');
      }
    } catch (error) {
      console.error('Error loading calls:', error);
      setError('Failed to load calls');
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    try {
      const response = await fetch('/api/connections?status=accepted');
      const data = await response.json();

      if (response.ok) {
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const handleNewCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceiver || !callTitle || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);
      
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: session?.user?.id,
          receiverId: selectedReceiver,
          title: callTitle,
          description: callDescription,
          scheduledAt: scheduledAt.toISOString(),
          duration: parseInt(selectedDuration),
          type: selectedType,
        }),
      });

      if (response.ok) {
        setShowNewCall(false);
        setCallTitle('');
        setCallDescription('');
        setSelectedReceiver('');
        setSelectedDate('');
        setSelectedTime('');
        setSelectedDuration('30');
        setSelectedType('VIDEO');
        loadCalls(); // Refresh the calls list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to schedule call');
      }
    } catch (error) {
      console.error('Error scheduling call:', error);
      alert('Failed to schedule call');
    } finally {
      setLoading(false);
    }
  };

  const handleCallAction = async (callId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/calls/${callId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }),
      });

      if (response.ok) {
        loadCalls(); // Refresh the calls list
      }
    } catch (error) {
      console.error('Error updating call:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'var(--success)';
      case 'PENDING': return 'var(--warning)';
      case 'COMPLETED': return 'var(--muted)';
      case 'CANCELLED': return 'var(--destructive)';
      case 'REJECTED': return 'var(--destructive)';
      default: return 'var(--muted)';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'VIDEO' ? <Video size={16} /> : <Phone size={16} />;
  };

  const getCurrentCalls = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return calls.filter(call => {
          const scheduledDate = new Date(call.scheduled_at);
          return scheduledDate > now && call.status === 'ACCEPTED';
        });
      case 'past':
        return calls.filter(call => {
          const scheduledDate = new Date(call.scheduled_at);
          return scheduledDate < now && (call.status === 'COMPLETED' || call.status === 'CANCELLED');
        });
      case 'requests':
        return calls.filter(call => call.status === 'PENDING' && !call.isSender);
      default:
        return [];
    }
  };

  return (
    <div className="calls-page">
      <div className="calls-header">
        <div className="header-content">
          <h1 className="page-title">Calls & Meetings</h1>
          <p className="page-subtitle">Schedule and manage your video calls</p>
        </div>
        <button 
          className="new-call-btn"
          onClick={() => setShowNewCall(true)}
        >
          <Plus size={20} />
          <span>New Call</span>
        </button>
      </div>

      <div className="calls-tabs">
        <button
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
        <button
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
      </div>

      <div className="calls-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading calls...</p>
          </div>
        ) : (
          <div className="calls-grid">
            {getCurrentCalls().map((call) => (
              <motion.div
                key={call.id}
                className="call-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="call-header">
                  <div className="call-type">
                    {getTypeIcon(call.type)}
                    <span className="call-title">{call.title}</span>
                  </div>
                  <div className="call-status" style={{ color: getStatusColor(call.status) }}>
                    {call.status}
                  </div>
                </div>

                <div className="call-details">
                  <div className="call-info">
                    <div className="info-item">
                      <Calendar size={14} />
                      <span>{new Date(call.scheduled_at).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <Clock size={14} />
                      <span>{new Date(call.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({call.duration} min)</span>
                    </div>
                    <div className="info-item">
                      <Users size={14} />
                      <span>{call.isSender ? call.receiver?.name : call.sender?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="call-actions">
                  {activeTab === 'requests' && call.status === 'PENDING' && (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={() => handleCallAction(call.id, 'accept')}
                      >
                        <Check size={16} />
                        Accept
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleCallAction(call.id, 'reject')}
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  {call.status === 'ACCEPTED' && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        console.log('Joining call:', call);
                        console.log('Current user:', session?.user);
                        console.log('Call participants:', {
                          sender: call.sender,
                          receiver: call.receiver,
                          isSender: call.isSender
                        });
                        setCurrentCall(call);
                        setShowVideoCall(true);
                      }}
                    >
                      <Video size={16} />
                      Join Call
                    </button>
                  )}
                  <button className="btn btn-outline">
                    <MessageSquare size={16} />
                    Message
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {getCurrentCalls().length === 0 && !loading && (
          <div className="no-calls">
            <div className="no-calls-content">
              <h3>No calls found</h3>
              <p>You don't have any {activeTab} calls</p>
            </div>
          </div>
        )}
      </div>

      {/* New Call Modal */}
      {showNewCall && (
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
                onClick={() => setShowNewCall(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleNewCall} className="modal-form">
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
                  value={selectedReceiver}
                  onChange={(e) => setSelectedReceiver(e.target.value)}
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
                  onClick={() => setShowNewCall(false)}
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

      {/* Video Call Component */}
      {showVideoCall && currentCall && (
        <VideoCall
          roomName={`connected-call-${currentCall.id}`}
          userName={session?.user?.name || 'User'}
          onClose={() => setShowVideoCall(false)}
          isOpen={showVideoCall}
        />
      )}
    </div>
  );
} 