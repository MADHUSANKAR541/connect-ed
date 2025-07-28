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
  Loader2
} from 'lucide-react';
import '../../../styles/explore.scss';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  collegeName: string;
  department: string;
  batch: string;
  skills: string[];
  bio: string;
  location: string;
  rating: number;
  connections: number;
  isOnline: boolean;
  isVerified: boolean;
  score?: number;
  highlights?: any;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);

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

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Rating' },
    { value: 'recent', label: 'Recently Active' },
    { value: 'name', label: 'Name' }
  ];

  // Search users with Elasticsearch
  const searchUsers = async (resetPage = true) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        elastic: 'true',
        q: searchQuery,
        role: selectedRole,
        collegeId: selectedCollege,
        skills: selectedSkills.join(','),
        page: resetPage ? '1' : page.toString(),
        limit: '20',
        sortBy,
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

  // Get search suggestions
  const getSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Suggestions error:', error);
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
      getSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedRole, selectedCollege, selectedSkills, sortBy]);

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
    setSortBy('relevance');
    setSearchQuery('');
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    searchUsers(false);
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
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && searchQuery.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => {
                setSearchQuery(suggestion);
                setSuggestions([]);
              }}
            >
              <Search size={14} />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}

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
                  <span>{user.avatar}</span>
                  {user.isOnline && <div className="online-indicator" />}
                  {user.isVerified && <div className="verified-badge">✓</div>}
                </div>
                <div className="user-info">
                  <h3 className="user-name">{user.name}</h3>
                  <div className="user-meta">
                    <span className="user-role">{user.role}</span>
                    <span className="user-college">{user.collegeName}</span>
                  </div>
                  <div className="user-location">
                    <MapPin size={14} />
                    <span>{user.location}</span>
                  </div>
                </div>
                <div className="user-rating">
                  <Star size={16} />
                  <span>{user.rating}</span>
                </div>
              </div>

              <div className="user-bio">
                <p>{user.bio}</p>
              </div>

              <div className="user-skills">
                {user.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
                {user.skills.length > 3 && (
                  <span className="skill-tag more">
                    +{user.skills.length - 3} more
                  </span>
                )}
              </div>

              <div className="user-stats">
                <div className="stat">
                  <Users size={14} />
                  <span>{user.connections} connections</span>
                </div>
                <div className="stat">
                  <GraduationCap size={14} />
                  <span>{user.batch}</span>
                </div>
              </div>

              <div className="user-actions">
                <button className="btn btn-primary">
                  <UserPlus size={16} />
                  Connect
                </button>
                <button className="btn btn-outline">
                  <MessageSquare size={16} />
                  Message
                </button>
                <button className="btn btn-outline">
                  <Calendar size={16} />
                  Schedule Call
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
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
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
    </div>
  );
} 