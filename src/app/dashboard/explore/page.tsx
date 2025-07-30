'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  GraduationCap, 
  Building2, 
  Users, 
  MessageSquare, 
  Calendar,
  Star,
  UserPlus,
  Eye,
  MoreVertical,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles
} from 'lucide-react';
import '../../../styles/explore.scss';
import { useSession } from 'next-auth/react';
//import styles from './page.module.scss';

interface User {
  id: string;
  name?: string;
  avatar?: string;
  role?: string;
  college?: string;
  colleges?: {
    id: string;
    name: string;
    domain: string;
  };
  department?: string;
  batch?: string;
  skills?: string[];
  bio?: string;
  location?: string;
  rating?: number;
  connections?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  connectionStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  score?: number;
  highlights?: any;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [connectMessage, setConnectMessage] = useState('');
  const { data: session } = useSession();
  const [alumniRecs, setAlumniRecs] = useState<any>(null);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [alumniError, setAlumniError] = useState<string | null>(null);

  // AI Recommendation Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [currentUserCollege, setCurrentUserCollege] = useState<string>('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showAiModal || showInviteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAiModal, showInviteModal]);

  // Function to clean AI output by removing asterisks
  const cleanAiOutput = (text: string) => {
    return text
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '') // Remove markdown asterisks
      .replace(/`/g, '') // Remove backticks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
      .replace(/^\s*[-*+]\s/gm, '') // Remove markdown list markers
      .replace(/^\s*\d+\.\s/gm, '') // Remove numbered list markers
      .trim();
  };

  const formatUsernames = (text: string) => {
    // Pattern to match names (words that start with capital letters, likely followed by more words)
    // This will match patterns like "Madhu Sankar", "Test User", "Kavinmathi V", etc.
    return text.replace(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, '<strong>$1</strong>');
  };

  // Function to get AI recommendation
  const getAiRecommendation = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiRecommendation('');
    
    try {
      // Use the current search context to generate recommendation
      const context = {
        query: searchQuery,
        role: selectedRole,
        college: selectedCollege,
        skills: selectedSkills
      };
      
      const response = await fetch('http://localhost:8000/alumni-referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          query: `Based on search for: ${searchQuery || 'general networking'}, role: ${selectedRole}, college: ${selectedCollege}, skills: ${selectedSkills.join(', ')}. Provide personalized networking and connection recommendations.`
        })
      });
      
      if (!response.ok) throw new Error('Failed to get AI recommendation');
      
      const data = await response.json();
      setAiRecommendation(cleanAiOutput(data.recommendation || 'No recommendation available.'));
    } catch (err: any) {
      setAiError(err.message || 'Failed to get AI recommendation');
    } finally {
      setAiLoading(false);
    }
  };


  const colleges = [
    'MIT', 'Harvard', 'Stanford', 'UC Berkeley', 'Yale', 'Princeton',
    'Columbia', 'Cornell', 'Dartmouth', 'Brown', 'UPenn', 'Duke'
  ];

  const skills = [
    'React', 'Node.js', 'Python', 'Java', 'JavaScript', 'Machine Learning',
    'Data Science', 'Marketing', 'Leadership', 'Research', 'Teaching',
    'IoT', 'AI', 'Robotics', 'Algorithms', 'Web Development'
  ];

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'STUDENT', label: 'Students' },
    { value: 'ALUMNI', label: 'Alumni' },
    { value: 'PROFESSOR', label: 'Professors' }
  ];



  // Search users with database
  const searchUsers = async (resetPage = true) => {
    if (!session?.user?.id) {
      console.log('No session available, skipping search');
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        role: selectedRole,
        collegeId: selectedCollege === 'all' ? '' : selectedCollege,
        page: resetPage ? '1' : page.toString(),
        limit: '20',
        currentUserId: session.user.id,
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotal(data.pagination.total);
        if (resetPage) setPage(1);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else if (searchQuery.length === 0) {
        searchUsers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedRole, selectedCollege]);

  // Fetch current user's college information
  useEffect(() => {
    const fetchCurrentUserCollege = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/profile?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user?.colleges?.name) {
            setCurrentUserCollege(data.user.colleges.name);
          } else if (data.user?.college) {
            setCurrentUserCollege(data.user.college);
          }
        }
      } catch (error) {
        console.error('Error fetching current user college:', error);
      }
    };

    fetchCurrentUserCollege();
  }, [session?.user?.id]);

  useEffect(() => {
    // Try to use user's domain/interest for recommendations
    // Fallback to a generic query if not available
    const userDomain = (session?.user && 'domain' in session.user && (session.user as any).domain) ? (session.user as any).domain : 'engineering';
    if (!userDomain) return;
    setAlumniLoading(true);
    setAlumniRecs(null);
    setAlumniError(null);
    const fetchRecs = async () => {
      try {
        const formData = new FormData();
        formData.append('query', userDomain);
        const res = await fetch('http://localhost:8000/alumni-referral', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Failed to get alumni recommendations');
        const data = await res.json();
        setAlumniRecs(data);
      } catch (err: any) {
        setAlumniError(err.message || 'Something went wrong');
      } finally {
        setAlumniLoading(false);
      }
    };
    fetchRecs();
  }, [session?.user]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSelectedRole('all');
    setSelectedCollege('all');
    setSelectedSkills([]);
    setSearchQuery('');
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    searchUsers(false);
  };

  const handleConnect = (user: User) => {
    setSelectedUser(user);
    setConnectMessage('');
    setShowConnectModal(true);
  };

  const sendConnectionRequest = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          message: connectMessage || 'I would like to connect with you!'
        }),
      });

      if (response.ok) {
        // Update the user's connection status in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id 
              ? { ...user, connectionStatus: 'PENDING' as const }
              : user
          )
        );
        setShowConnectModal(false);
        setSelectedUser(null);
        setConnectMessage('');
        alert('Connection request sent successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    }
  };

  const sendInvite = async () => {
    if (!inviteName.trim() || !invitePhone.trim()) {
      setInviteError('Name and phone number are required');
      return;
    }

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(false);

    try {
      const response = await fetch('/api/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteName.trim(),
          phoneNumber: invitePhone.trim(),
          message: inviteMessage.trim() || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteSuccess(true);
        setInviteName('');
        setInvitePhone('');
        setInviteMessage('');
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteSuccess(false);
        }, 2000);
      } else {
        setInviteError(data.error || 'Failed to send invite');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      setInviteError('Failed to send invite. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  const openInviteModal = () => {
    setShowInviteModal(true);
    setInviteName('');
    setInvitePhone('');
    
    // Create personalized invite message with college name
    const collegeText = currentUserCollege ? ` from ${currentUserCollege}` : '';
    const inviteMessageText = `Hi! I${collegeText} found you on ConnectED and thought you might be interested in joining our platform. It's a great place for students, alumni, and professors to connect and network. Check it out! link : https://connect-ed-dqf7.vercel.app/`;
    
    setInviteMessage(inviteMessageText);
    setInviteError(null);
    setInviteSuccess(false);
  };

  return (
    <div className="explore-page">
      <div className="explore-header">
        <div className="header-content">
          <h1 className="page-title">Explore & Connect</h1>
          <p className="page-subtitle">Discover and connect with students, alumni, and professors</p>
        </div>
      </div>

      <div className="search-section">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, skills, or interests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {loading && <Loader2 size={16} className="search-loader" />}
        </div>
        
        <div className="search-actions">
          <button 
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          

          
          <button 
            className='ai-recommendation-btn'
            onClick={() => {
              setShowAiModal(true);
              getAiRecommendation();
            }}
          >
            <Sparkles size={16} />
            Get AI Recommendation
          </button>
        </div>
      </div>



      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="filters-panel"
        >
          <div className="filters-content">
            <div className="filter-group">
              <label className="filter-label">Role</label>
              <div className="filter-options">
                {roles.map(role => (
                  <button
                    key={role.value}
                    className={`filter-option ${selectedRole === role.value ? 'active' : ''}`}
                    onClick={() => setSelectedRole(role.value)}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">College</label>
              <div className="filter-options">
                <button
                  className={`filter-option ${selectedCollege === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCollege('all')}
                >
                  All Colleges
                </button>
                {colleges.map(college => (
                  <button
                    key={college}
                    className={`filter-option ${selectedCollege === college ? 'active' : ''}`}
                    onClick={() => setSelectedCollege(college)}
                  >
                    {college}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Skills</label>
              <div className="skills-grid">
                {skills.map(skill => (
                  <button
                    key={skill}
                    className={`skill-option ${selectedSkills.includes(skill) ? 'active' : ''}`}
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn btn-outline" onClick={clearFilters}>
                <X size={16} />
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="results-section">
        <div className="results-header">
          <h2>Found {total} people</h2>
          {selectedRole !== 'all' || selectedCollege !== 'all' || selectedSkills.length > 0 ? (
            <div className="active-filters">
              {selectedRole !== 'all' && (
                <span className="filter-tag">
                  {roles.find(r => r.value === selectedRole)?.label}
                  <button onClick={() => setSelectedRole('all')}>×</button>
                </span>
              )}
              {selectedCollege !== 'all' && (
                <span className="filter-tag">
                  {selectedCollege}
                  <button onClick={() => setSelectedCollege('all')}>×</button>
                </span>
              )}
              {selectedSkills.map(skill => (
                <span key={skill} className="filter-tag">
                  {skill}
                  <button onClick={() => handleSkillToggle(skill)}>×</button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="users-grid">
          {users.map((user) => (
            <motion.div
              key={user.id}
              className="user-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="user-header">
                <div className="user-avatar">
                  <span>{user.avatar || 'U'}</span>
                </div>
                <div className="user-info">
                  <h3 className="user-name">{user.name || 'Unknown User'}</h3>
                  <span className="user-role">{user.role || 'Unknown'}</span>
                </div>
              </div>

              <div className="user-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleConnect(user)}
                  disabled={user.connectionStatus === 'PENDING' || user.connectionStatus === 'ACCEPTED'}
                >
                  <UserPlus size={16} />
                  {user.connectionStatus === 'PENDING' ? 'Request Sent' : 
                   user.connectionStatus === 'ACCEPTED' ? 'Connected' : 'Connect'}
                </button>
                <button className="btn btn-outline">
                  <Eye size={16} />
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="loading-state">
            <Loader2 size={24} className="spinner" />
            <p>Searching...</p>
          </div>
        )}

        {users.length === 0 && !loading && (
          <div className="no-results">
            <div className="no-results-content">
              <h3>No results found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <div className="no-results-actions">
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear Filters
                </button>
                <button className="btn btn-outline invite-btn" onClick={openInviteModal}>
                  <UserPlus size={16} />
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        )}

        {users.length > 0 && users.length < total && !loading && (
          <div className="load-more">
            <button className="btn btn-outline" onClick={loadMore}>
              Load More
            </button>
          </div>
        )}
      </div>



      {/* Connection Modal */}
      {showConnectModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowConnectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Connection Request</h3>
              <button 
                className="modal-close"
                onClick={() => setShowConnectModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="user-preview">
                <div className="user-avatar">
                  <span>{selectedUser.avatar}</span>
                </div>
                <div className="user-info">
                  <h4>{selectedUser.name}</h4>
                  <p>{selectedUser.role} • {selectedUser.college}</p>
                </div>
              </div>
              <div className="message-section">
                <label htmlFor="connect-message">Message (optional):</label>
                <textarea
                  id="connect-message"
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="Add a personal message to your connection request..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowConnectModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={sendConnectionRequest}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendation Modal */}
      {showAiModal && (
        <div className="modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Sparkles size={20} />
                AI Networking Recommendation
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowAiModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="ai-recommendation-content">
                {aiLoading && (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Loader2 size={32} className="spinner" />
                    <p style={{ marginTop: '16px', color: '#6b7280' }}>
                      Generating personalized recommendation...
                    </p>
                  </div>
                )}
                {aiError && (
                  <div className='error'>
                    <span>⚠️</span>
                    {aiError}
                  </div>
                )}
                {aiRecommendation && (
                  <div className="recommendation-text">
                    <div className="sparkles-icon">
                      <Sparkles size={20} />
                      <span>AI Recommendation</span>
                    </div>
                    <div style={{ 
                      maxHeight: 'none', 
                      overflow: 'visible',
                      width: '100%'
                    }}>
                      <p style={{
                        fontSize: '15px',
                        lineHeight: '1.7',
                        color: '#1f2937',
                        margin: '0',
                        padding: '16px',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        borderLeft: '4px solid #3b82f6',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        maxHeight: 'calc(75vh - 250px)', // Ensure it doesn't exceed viewport
                        overflowY: 'auto' // Allow scrolling within the paragraph if needed
                      }}
                      dangerouslySetInnerHTML={{ __html: formatUsernames(aiRecommendation) }}
                      />
                    </div>
                  </div>
                )}
                {!aiLoading && !aiError && !aiRecommendation && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                    <Sparkles size={32} style={{ marginBottom: '16px' }} />
                    <p>Click "Get New Recommendation" to start</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowAiModal(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={getAiRecommendation}
                disabled={aiLoading}
              >
                {aiLoading ? 'Generating...' : 'Get New Recommendation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content invite-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <UserPlus size={20} />
                Send Invite
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowInviteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {inviteSuccess ? (
                <div className="invite-success">
                  <div className="success-icon">✓</div>
                  <h4>Invite Sent Successfully!</h4>
                  <p>Your invite has been sent via SMS. The person will receive a message to join CampusConnect.</p>
                </div>
              ) : (
                <>
                  <div className="invite-form">
                    <div className="form-group">
                      <label htmlFor="invite-name">Name *</label>
                      <input
                        id="invite-name"
                        type="text"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="Enter the person's name"
                        className="form-input"
                        disabled={inviteLoading}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="invite-phone">Phone Number *</label>
                      <input
                        id="invite-phone"
                        type="tel"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        placeholder="Enter phone number (e.g., +1234567890)"
                        className="form-input"
                        disabled={inviteLoading}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="invite-message">Personal Message (Optional)</label>
                      <textarea
                        id="invite-message"
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        placeholder="Add a personal message to your invite..."
                        className="form-textarea"
                        rows={3}
                        disabled={inviteLoading}
                      />
                    </div>
                  </div>
                  
                  {inviteError && (
                    <div className="invite-error">
                      <span>⚠️</span>
                      {inviteError}
                    </div>
                  )}
                </>
              )}
            </div>
            {!inviteSuccess && (
              <div className="modal-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviteLoading}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={sendInvite}
                  disabled={inviteLoading || !inviteName.trim() || !invitePhone.trim()}
                >
                  {inviteLoading ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Send Invite
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}