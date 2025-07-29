'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Link, 
  FileText, 
  Users, 
  Calendar,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  CheckCircle,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import '../../../../styles/jobs.scss';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_link: string;
  description: string;
  eligibility: string;
  notes: string;
  is_open_for_referral: boolean;
  domain: string;
  experience_level: string;
  salary?: string;
  application_deadline?: string;
  created_at: string;
  status: 'ACTIVE' | 'CLOSED';
}

interface ReferralRequest {
  id: string;
  job_id: string;
  student_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REFERRED';
  resume_url?: string;
  note: string;
  created_at: string;
  updated_at: string;
  student: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    college: string;
    department: string;
    current_year?: string;
    graduation_year?: string;
    cgpa?: string;
  };
}

export default function PostJobPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'post' | 'my-jobs' | 'requests'>('post');
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [referralRequests, setReferralRequests] = useState<ReferralRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ReferralRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobLink: '',
    description: '',
    eligibility: '',
    notes: '',
    isOpenForReferral: true,
    domain: '',
    experienceLevel: '',
    salary: '',
    applicationDeadline: ''
  });

  const domains = [
    'Software Engineering',
    'Data Science',
    'Product Management',
    'Design',
    'Marketing',
    'Sales',
    'Finance',
    'Human Resources',
    'Operations',
    'Research',
    'Other'
  ];

  const experienceLevels = [
    'Entry Level',
    'Mid Level',
    'Senior',
    'Lead',
    'Manager',
    'Director',
    'Executive'
  ];

  useEffect(() => {
    if (session?.user?.id) {
      loadMyJobs();
      loadReferralRequests();
    }
  }, [session]);

  const loadMyJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs/my-jobs');
      const data = await response.json();

      if (response.ok) {
        setMyJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferralRequests = async () => {
    try {
      const response = await fetch('/api/jobs/referral-requests');
      const data = await response.json();

      if (response.ok) {
        setReferralRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      alert('Please log in to post a job');
      return;
    }

    if (!formData.title || !formData.company || !formData.jobLink) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowJobModal(false);
        setEditingJob(null);
        resetForm();
        loadMyJobs();
        alert(editingJob ? 'Job updated successfully!' : 'Job posted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      jobLink: '',
      description: '',
      eligibility: '',
      notes: '',
      isOpenForReferral: true,
      domain: '',
      experienceLevel: '',
      salary: '',
      applicationDeadline: ''
    });
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      jobLink: job.job_link,
      description: job.description,
      eligibility: job.eligibility,
      notes: job.notes,
      isOpenForReferral: job.is_open_for_referral,
      domain: job.domain,
      experienceLevel: job.experience_level,
      salary: job.salary || '',
      applicationDeadline: job.application_deadline || ''
    });
    setShowJobModal(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadMyJobs();
        alert('Job deleted successfully!');
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/jobs/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: action === 'accept' ? 'ACCEPTED' : 'DECLINED' 
        }),
      });

      if (response.ok) {
        loadReferralRequests();
        alert(`Request ${action}ed successfully!`);
      } else {
        alert(`Failed to ${action} request`);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert(`Failed to ${action} request`);
    }
  };

  const handleViewRequest = (request: ReferralRequest) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'var(--warning)';
      case 'ACCEPTED': return 'var(--success)';
      case 'DECLINED': return 'var(--destructive)';
      case 'REFERRED': return 'var(--primary)';
      default: return 'var(--muted)';
    }
  };

  const pendingRequests = referralRequests.filter(r => r.status === 'PENDING');
  const acceptedRequests = referralRequests.filter(r => r.status === 'ACCEPTED');
  const referredRequests = referralRequests.filter(r => r.status === 'REFERRED');

  return (
    <div className="post-job-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Job Management</h1>
          <p className="page-subtitle">Post jobs and manage referral requests</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setEditingJob(null);
            setShowJobModal(true);
          }}
        >
          <Plus size={16} />
          Post New Job
        </button>
      </div>

      <div className="page-tabs">
        <button
          className={`tab ${activeTab === 'post' ? 'active' : ''}`}
          onClick={() => setActiveTab('post')}
        >
          <Briefcase size={18} />
          <span>Post Job</span>
        </button>
        <button
          className={`tab ${activeTab === 'my-jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-jobs')}
        >
          <Building2 size={18} />
          <span>My Jobs</span>
          <span className="badge">{myJobs.length}</span>
        </button>
        <button
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <Users size={18} />
          <span>Referral Requests</span>
          {pendingRequests.length > 0 && (
            <span className="badge warning">{pendingRequests.length}</span>
          )}
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'post' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="post-content"
          >
            <div className="post-guide">
              <h2>How to Post a Job</h2>
              <div className="guide-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Fill Job Details</h3>
                    <p>Provide comprehensive information about the position</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Enable Referrals</h3>
                    <p>Choose whether to accept referral requests from students</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Review Requests</h3>
                    <p>Review and respond to referral requests from qualified candidates</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="quick-stats">
              <div className="stat-card">
                <Briefcase size={24} />
                <div className="stat-info">
                  <h3>{myJobs.length}</h3>
                  <p>Jobs Posted</p>
                </div>
              </div>
              <div className="stat-card">
                <Users size={24} />
                <div className="stat-info">
                  <h3>{referralRequests.length}</h3>
                  <p>Total Requests</p>
                </div>
              </div>
              <div className="stat-card">
                <CheckCircle size={24} />
                <div className="stat-info">
                  <h3>{referredRequests.length}</h3>
                  <p>Referrals Made</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'my-jobs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-jobs-content"
          >
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your jobs...</p>
              </div>
            ) : myJobs.length === 0 ? (
              <div className="empty-state">
                <Briefcase size={48} />
                <h3>No jobs posted yet</h3>
                <p>Start by posting your first job opportunity</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    resetForm();
                    setEditingJob(null);
                    setShowJobModal(true);
                  }}
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="jobs-list">
                {myJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    className="job-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="job-header">
                      <div className="job-info">
                        <h3 className="job-title">{job.title}</h3>
                        <div className="job-meta">
                          <span className="company">{job.company}</span>
                          <span className="location">{job.location}</span>
                          <span className={`status ${job.status.toLowerCase()}`}>{job.status}</span>
                        </div>
                      </div>
                      <div className="job-actions">
                        <button 
                          className="action-btn"
                          onClick={() => handleEditJob(job)}
                          title="Edit Job"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-btn danger"
                          onClick={() => handleDeleteJob(job.id)}
                          title="Delete Job"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="job-details">
                      <div className="job-tags">
                        <span className="tag domain">{job.domain}</span>
                        <span className="tag experience">{job.experience_level}</span>
                        {job.is_open_for_referral && (
                          <span className="tag referral">Open for Referrals</span>
                        )}
                      </div>
                      
                      <p className="job-description">
                        {job.description.length > 100 
                          ? `${job.description.substring(0, 100)}...` 
                          : job.description
                        }
                      </p>
                    </div>

                    <div className="job-stats">
                      <div className="stat">
                        <Users size={16} />
                        <span>
                          {referralRequests.filter(r => r.job_id === job.id).length} requests
                        </span>
                      </div>
                      <div className="stat">
                        <Calendar size={16} />
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="job-footer">
                      <a 
                        href={job.job_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                      >
                        <Link size={16} />
                        View Job
                      </a>
                      <button className="btn btn-primary">
                        <Users size={16} />
                        View Requests
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="requests-content"
          >
            <div className="requests-header">
              <div className="requests-stats">
                <div className="stat-item">
                  <span className="stat-label">Pending</span>
                  <span className="stat-value pending">{pendingRequests.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Accepted</span>
                  <span className="stat-value accepted">{acceptedRequests.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Referred</span>
                  <span className="stat-value referred">{referredRequests.length}</span>
                </div>
              </div>
            </div>

            <div className="requests-list">
              {referralRequests.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <h3>No referral requests yet</h3>
                  <p>When students request referrals for your jobs, they'll appear here</p>
                </div>
              ) : (
                referralRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    className="request-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="request-header">
                      <div className="student-info">
                        <div className="student-avatar">
                          <span>{request.student.avatar}</span>
                        </div>
                        <div className="student-details">
                          <h4 className="student-name">{request.student.name}</h4>
                          <p className="student-role">
                            {request.student.role} • {request.student.department}
                          </p>
                          {request.student.current_year && (
                            <p className="student-year">
                              Year {request.student.current_year} • CGPA: {request.student.cgpa || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="request-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(request.status) }}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <div className="request-content">
                      <div className="request-note">
                        <strong>Student's Note:</strong>
                        <p>{request.note}</p>
                      </div>
                      
                      <div className="request-meta">
                        <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                        {request.resume_url && (
                          <a 
                            href={request.resume_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="resume-link"
                          >
                            <FileText size={16} />
                            View Resume
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="request-actions">
                      {request.status === 'PENDING' && (
                        <>
                          <button 
                            className="btn btn-success"
                            onClick={() => handleRequestAction(request.id, 'accept')}
                          >
                            <UserCheck size={16} />
                            Accept
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleRequestAction(request.id, 'decline')}
                          >
                            <UserX size={16} />
                            Decline
                          </button>
                        </>
                      )}
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button className="btn btn-outline">
                        <MessageSquare size={16} />
                        Message
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Job Posting Modal */}
      {showJobModal && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingJob ? 'Edit Job' : 'Post New Job'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowJobModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Job Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer, Data Scientist"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company *</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g., Google, Microsoft"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., San Francisco, CA"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="jobLink">Job Link *</label>
                  <input
                    type="url"
                    id="jobLink"
                    name="jobLink"
                    value={formData.jobLink}
                    onChange={handleInputChange}
                    placeholder="https://company.com/careers/job-id"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="domain">Domain</label>
                  <select
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select Domain</option>
                    {domains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="experienceLevel">Experience Level</label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select Level</option>
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="salary">Salary Range</label>
                  <input
                    type="text"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="e.g., $80,000 - $120,000"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="applicationDeadline">Application Deadline</label>
                  <input
                    type="date"
                    id="applicationDeadline"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Job Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  rows={4}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="eligibility">Eligibility Criteria</label>
                <textarea
                  id="eligibility"
                  name="eligibility"
                  value={formData.eligibility}
                  onChange={handleInputChange}
                  placeholder="e.g., Must be graduating in 2024, CGPA > 7.5"
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information for candidates..."
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isOpenForReferral"
                    checked={formData.isOpenForReferral}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  Open for Referral Requests
                </label>
                <p className="help-text">
                  Allow students to request referrals for this position
                </p>
              </div>
            </form>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowJobModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="spinner"></div>
                    {editingJob ? 'Updating...' : 'Posting...'}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingJob ? 'Update Job' : 'Post Job'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Referral Request Details</h3>
              <button 
                className="modal-close"
                onClick={() => setShowRequestModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="student-details">
                <div className="student-avatar">
                  <span>{selectedRequest.student.avatar}</span>
                </div>
                <div className="student-info">
                  <h4>{selectedRequest.student.name}</h4>
                  <p>{selectedRequest.student.role} • {selectedRequest.student.department}</p>
                  <p>{selectedRequest.student.college}</p>
                  {selectedRequest.student.current_year && (
                    <p>Year {selectedRequest.student.current_year} • CGPA: {selectedRequest.student.cgpa || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="request-details">
                <h4>Student's Note</h4>
                <p>{selectedRequest.note}</p>
              </div>

              {selectedRequest.resume_url && (
                <div className="resume-section">
                  <h4>Resume</h4>
                  <a 
                    href={selectedRequest.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    <FileText size={16} />
                    View Resume
                  </a>
                </div>
              )}

              <div className="request-meta">
                <p><strong>Requested:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> 
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedRequest.status) }}
                  >
                    {selectedRequest.status}
                  </span>
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowRequestModal(false)}
              >
                Close
              </button>
              {selectedRequest.status === 'PENDING' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      handleRequestAction(selectedRequest.id, 'accept');
                      setShowRequestModal(false);
                    }}
                  >
                    <UserCheck size={16} />
                    Accept Request
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      handleRequestAction(selectedRequest.id, 'decline');
                      setShowRequestModal(false);
                    }}
                  >
                    <UserX size={16} />
                    Decline Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 