'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Send, 
  Clock, 
  Building, 
  MapPin, 
  Calendar,
  User,
  Star,
  Plus,
  X,
  Upload,
  FileText,
  Edit,
  Trash2,
  Check,
  Eye
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import '../../../styles/jobs.scss';

interface Job {
  id: string;
  title: string;
  company: string;
  job_link: string;
  domain: string;
  experience_level: string;
  is_open_for_referral: boolean;
  notes?: string;
  application_deadline?: string;
  posted_by: string;
  created_at: string;
  updated_at: string;
  alumni?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    company?: string;
    position?: string;
  };
}

interface ReferralRequest {
  id: string;
  job_id: string;
  student_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REFERRED';
  resume_url?: string;
  note?: string;
  created_at: string;
  job?: Job;
  student?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
}

export default function JobsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'Student';
  const isAlumni = userRole.toLowerCase() === 'alumni' || userRole.toLowerCase() === 'alumnus';
  
  // Debug logging
  console.log('Session:', session);
  console.log('User Role:', userRole);
  console.log('Is Alumni:', isAlumni);
  
  // Student state
  const [activeTab, setActiveTab] = useState<'available' | 'requests'>('available');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myRequests, setMyRequests] = useState<ReferralRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [requestNote, setRequestNote] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  // Alumni state
  const [alumniActiveTab, setAlumniActiveTab] = useState<'post' | 'my-jobs' | 'requests'>('post');
  const [myPostedJobs, setMyPostedJobs] = useState<Job[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ReferralRequest[]>([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  // Job form state
  const [jobFormData, setJobFormData] = useState({
    title: '',
    company: '',
    job_link: '',
    domain: '',
    experience_level: '',
    openings: '',
    description: '',
    eligibility: '',
    notes: '',
    application_deadline: '',
    is_open_for_referral: true
  });
  const [submittingJob, setSubmittingJob] = useState(false);
  
  // Shared state
  const [loading, setLoading] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAlumni) {
      loadAlumniData();
    } else {
      loadStudentData();
    }
  }, [isAlumni, alumniActiveTab, activeTab]);

  const loadStudentData = async () => {
    loadJobs();
    if (activeTab === 'requests') {
      loadMyRequests();
    }
  };

  const loadAlumniData = async () => {
    if (alumniActiveTab === 'my-jobs') {
      loadMyPostedJobs();
    } else if (alumniActiveTab === 'requests') {
      loadReceivedRequests();
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
      } else {
        setError(data.error || 'Failed to load jobs');
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      const response = await fetch('/api/jobs/requests?type=sent');
      const data = await response.json();

      if (response.ok) {
        setMyRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadMyPostedJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs/my-jobs');
      const data = await response.json();

      if (response.ok) {
        setMyPostedJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading my jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReceivedRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs/referral-requests');
      const data = await response.json();

      if (response.ok) {
        setReceivedRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading received requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !resumeFile) {
      alert('Please select a resume file');
      return;
    }

    setSubmittingRequest(true);
    try {
      const formData = new FormData();
      formData.append('jobId', selectedJob.id);
      formData.append('note', requestNote);
      formData.append('resume', resumeFile);

      const response = await fetch('/api/jobs/requests', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowRequestModal(false);
        setSelectedJob(null);
        setRequestNote('');
        setResumeFile(null);
        loadMyRequests();
        alert('Referral request sent successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: 'ACCEPTED' | 'DECLINED' | 'REFERRED') => {
    try {
      const response = await fetch(`/api/jobs/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        loadReceivedRequests();
        alert(`Request ${status.toLowerCase()} successfully`);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request');
    }
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobFormData.title || !jobFormData.company || !jobFormData.job_link) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmittingJob(true);
    try {
      const requestData = {
        ...jobFormData,
        openings: parseInt(jobFormData.openings) || 1
      };
      
      console.log('Submitting job data:', requestData);
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      console.log('Job submission response status:', response.status);
      const responseData = await response.json();
      console.log('Job submission response data:', responseData);

      if (response.ok) {
        setShowJobForm(false);
        setJobFormData({
          title: '',
          company: '',
          job_link: '',
          domain: '',
          experience_level: '',
          openings: '',
          description: '',
          eligibility: '',
          notes: '',
          application_deadline: '',
          is_open_for_referral: true
        });
        loadMyPostedJobs();
        alert('Job posted successfully!');
      } else {
        console.error('Job submission failed:', responseData);
        alert(responseData.error || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job');
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleJobFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setJobFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'var(--success)';
      case 'PENDING': return 'var(--warning)';
      case 'REFERRED': return 'var(--primary)';
      case 'DECLINED': return 'var(--destructive)';
      default: return 'var(--muted)';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.domain.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'referral' && job.is_open_for_referral) ||
                         (selectedFilter === 'recent' && new Date(job.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesFilter;
  });

  // Student Interface
  if (!isAlumni) {
    return (
      <div className="jobs-page">
        <div className="jobs-header">
          <div className="header-content">
            <h1 className="page-title">Job Board</h1>
            <p className="page-subtitle">Find opportunities and request referrals from alumni</p>
          </div>
          <div className="header-actions">
            <button 
              className={`action-btn ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
              <Briefcase size={20} />
              <span>Available Jobs</span>
            </button>
            <button 
              className={`action-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <Send size={20} />
              <span>My Requests</span>
            </button>
          </div>
        </div>

        {activeTab === 'available' && (
          <>
            <div className="search-filters">
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('all')}
                >
                  <Filter size={16} />
                  All Jobs
                </button>
                <button
                  className={`filter-btn ${selectedFilter === 'referral' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('referral')}
                >
                  <User size={16} />
                  Open for Referral
                </button>
                <button
                  className={`filter-btn ${selectedFilter === 'recent' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('recent')}
                >
                  <Clock size={16} />
                  Recent
                </button>
              </div>
            </div>

            <div className="jobs-content">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading jobs...</p>
                </div>
              ) : (
                <div className="jobs-grid">
                  {filteredJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      className="job-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="job-header">
                        <div className="job-title-section">
                          <h3 className="job-title">{job.title}</h3>
                          <div className="company-info">
                            <Building size={16} />
                            <span>{job.company}</span>
                          </div>
                        </div>
                        {job.is_open_for_referral && (
                          <div className="referral-badge">
                            <User size={14} />
                            <span>Referral Available</span>
                          </div>
                        )}
                      </div>

                      <div className="job-details">
                        <div className="detail-item">
                          <MapPin size={14} />
                          <span>{job.domain}</span>
                        </div>
                        <div className="detail-item">
                          <Star size={14} />
                          <span>{job.experience_level}</span>
                        </div>
                        {job.application_deadline && (
                          <div className="detail-item">
                            <Calendar size={14} />
                            <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {job.notes && (
                        <div className="job-notes">
                          <p>{job.notes}</p>
                        </div>
                      )}

                      <div className="job-actions">
                        <a
                          href={job.job_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                        >
                          <FileText size={16} />
                          View Job
                        </a>
                        {job.is_open_for_referral && (
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              setSelectedJob(job);
                              setShowRequestModal(true);
                            }}
                          >
                            <Send size={16} />
                            Request Referral
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredJobs.length === 0 && !loading && (
                <div className="no-jobs">
                  <div className="no-jobs-content">
                    <h3>No jobs found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'requests' && (
          <div className="requests-content">
            <div className="requests-grid">
              {myRequests.map((request) => (
                <motion.div
                  key={request.id}
                  className="request-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="request-header">
                    <div className="request-job">
                      <h4>{request.job?.title}</h4>
                      <span className="company">{request.job?.company}</span>
                    </div>
                    <div className="request-status" style={{ color: getStatusColor(request.status) }}>
                      {request.status}
                    </div>
                  </div>

                  <div className="request-details">
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    {request.note && (
                      <div className="request-note">
                        <p><strong>Your Note:</strong> {request.note}</p>
                      </div>
                    )}
                  </div>

                  <div className="request-actions">
                    <a
                      href={request.job?.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      <FileText size={16} />
                      View Job
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {myRequests.length === 0 && (
              <div className="no-requests">
                <div className="no-requests-content">
                  <h3>No referral requests</h3>
                  <p>You haven't sent any referral requests yet</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Request Referral Modal */}
        {showRequestModal && selectedJob && (
          <div className="modal-overlay">
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="modal-header">
                <h2>Request Referral</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowRequestModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-job-info">
                <h3>{selectedJob.title}</h3>
                <p>{selectedJob.company}</p>
              </div>

              <form onSubmit={handleRequestReferral} className="modal-form">
                <div className="form-group">
                  <label>Resume/CV</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      required
                    />
                    <div className="upload-placeholder">
                      <Upload size={20} />
                      <span>Click to upload resume (PDF, DOC, DOCX)</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Note to Alumni (Optional)</label>
                  <textarea
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="Why are you interested in this role? What makes you a good fit?"
                    rows={4}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowRequestModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingRequest}
                  >
                    {submittingRequest ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Alumni Interface
  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <div className="header-content">
          <h1 className="page-title">Job Management</h1>
          <p className="page-subtitle">Post jobs and manage referral requests from students</p>
        </div>
        <div className="header-actions">
          <button 
            className={`action-btn ${alumniActiveTab === 'post' ? 'active' : ''}`}
            onClick={() => setAlumniActiveTab('post')}
          >
            <Plus size={20} />
            <span>Post Job</span>
          </button>
          <button 
            className={`action-btn ${alumniActiveTab === 'my-jobs' ? 'active' : ''}`}
            onClick={() => setAlumniActiveTab('my-jobs')}
          >
            <Briefcase size={20} />
            <span>My Jobs</span>
          </button>
          <button 
            className={`action-btn ${alumniActiveTab === 'requests' ? 'active' : ''}`}
            onClick={() => setAlumniActiveTab('requests')}
          >
            <Send size={20} />
            <span>Referral Requests</span>
            {receivedRequests.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="badge">{receivedRequests.filter(r => r.status === 'PENDING').length}</span>
            )}
          </button>
        </div>
      </div>

      {alumniActiveTab === 'post' && (
        <div className="post-job-content">
          <div className="post-job-guide">
            <h2>Post a New Job</h2>
            <p>Share job opportunities with students and help them get referrals</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowJobForm(true)}
            >
              <Plus size={16} />
              Create New Job Post
            </button>
          </div>
        </div>
      )}

      {alumniActiveTab === 'my-jobs' && (
        <div className="my-jobs-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your jobs...</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {myPostedJobs.map((job) => (
                <motion.div
                  key={job.id}
                  className="job-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="job-header">
                    <div className="job-title-section">
                      <h3 className="job-title">{job.title}</h3>
                      <div className="company-info">
                        <Building size={16} />
                        <span>{job.company}</span>
                      </div>
                    </div>
                    <div className="job-actions">
                      <button className="btn btn-outline" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-outline" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="job-details">
                    <div className="detail-item">
                      <MapPin size={14} />
                      <span>{job.domain}</span>
                    </div>
                    <div className="detail-item">
                      <Star size={14} />
                      <span>{job.experience_level}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {job.notes && (
                    <div className="job-notes">
                      <p>{job.notes}</p>
                    </div>
                  )}

                  <div className="job-footer">
                    <div className="job-status">
                      <span className={`status-badge ${job.is_open_for_referral ? 'active' : 'closed'}`}>
                        {job.is_open_for_referral ? 'Open for Referrals' : 'Closed'}
                      </span>
                    </div>
                    <a
                      href={job.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      <Eye size={16} />
                      View
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {myPostedJobs.length === 0 && !loading && (
            <div className="no-jobs">
              <div className="no-jobs-content">
                <h3>No jobs posted yet</h3>
                <p>Start by posting your first job opportunity</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setAlumniActiveTab('post')}
                >
                  Post Your First Job
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {alumniActiveTab === 'requests' && (
        <div className="requests-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading requests...</p>
            </div>
          ) : (
            <div className="requests-grid">
              {receivedRequests.map((request) => (
                <motion.div
                  key={request.id}
                  className="request-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="request-header">
                    <div className="request-job">
                      <h4>{request.job?.title}</h4>
                      <span className="company">{request.job?.company}</span>
                    </div>
                    <div className="request-status" style={{ color: getStatusColor(request.status) }}>
                      {request.status}
                    </div>
                  </div>

                  <div className="student-info">
                    <div className="student-avatar">
                      <span>{request.student?.name?.charAt(0) || 'S'}</span>
                    </div>
                    <div className="student-details">
                      <h5>{request.student?.name}</h5>
                      <p>{request.student?.role}</p>
                    </div>
                  </div>

                  <div className="request-details">
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    {request.note && (
                      <div className="request-note">
                        <p><strong>Student's Note:</strong> {request.note}</p>
                      </div>
                    )}
                    {request.resume_url && (
                      <div className="resume-link">
                        <a href={request.resume_url} target="_blank" rel="noopener noreferrer">
                          <FileText size={14} />
                          View Resume
                        </a>
                      </div>
                    )}
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="request-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => handleUpdateRequestStatus(request.id, 'ACCEPTED')}
                      >
                        <Check size={16} />
                        Accept
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleUpdateRequestStatus(request.id, 'REFERRED')}
                      >
                        <Send size={16} />
                        Refer
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleUpdateRequestStatus(request.id, 'DECLINED')}
                      >
                        <X size={16} />
                        Decline
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {receivedRequests.length === 0 && !loading && (
            <div className="no-requests">
              <div className="no-requests-content">
                <h3>No referral requests</h3>
                <p>Students haven't requested referrals for your jobs yet</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Job Posting Modal */}
      {showJobForm && (
        <div className="modal-overlay">
          <motion.div
            className="modal large-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="modal-header">
              <h2>Post New Job Opening</h2>
              <button
                className="close-btn"
                onClick={() => setShowJobForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={jobFormData.title}
                    onChange={handleJobFormChange}
                    placeholder="e.g., Software Engineer, Data Analyst"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="company"
                    value={jobFormData.company}
                    onChange={handleJobFormChange}
                    placeholder="e.g., Google, Microsoft"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Job Link *</label>
                  <input
                    type="url"
                    name="job_link"
                    value={jobFormData.job_link}
                    onChange={handleJobFormChange}
                    placeholder="https://company.com/careers/job-id"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Domain</label>
                  <select
                    name="domain"
                    value={jobFormData.domain}
                    onChange={handleJobFormChange}
                  >
                    <option value="">Select Domain</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    name="experience_level"
                    value={jobFormData.experience_level}
                    onChange={handleJobFormChange}
                  >
                    <option value="">Select Experience Level</option>
                    <option value="Entry Level">Entry Level (0-2 years)</option>
                    <option value="Mid Level">Mid Level (3-5 years)</option>
                    <option value="Senior">Senior (5+ years)</option>
                    <option value="Lead">Lead</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Openings</label>
                  <input
                    type="number"
                    name="openings"
                    value={jobFormData.openings}
                    onChange={handleJobFormChange}
                    placeholder="1"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={jobFormData.application_deadline}
                    onChange={handleJobFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  name="description"
                  value={jobFormData.description}
                  onChange={handleJobFormChange}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Eligibility Criteria</label>
                <textarea
                  name="eligibility"
                  value={jobFormData.eligibility}
                  onChange={handleJobFormChange}
                  placeholder="e.g., B.Tech in Computer Science, 7+ CGPA, 2024/2025 batch"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  value={jobFormData.notes}
                  onChange={handleJobFormChange}
                  placeholder="Any additional information for students..."
                  rows={3}
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_open_for_referral"
                    checked={jobFormData.is_open_for_referral}
                    onChange={handleJobFormChange}
                  />
                  <span className="checkbox-custom"></span>
                  Open for Referrals
                </label>
                <p className="help-text">Allow students to request referrals for this position</p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowJobForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingJob}
                >
                  {submittingJob ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}