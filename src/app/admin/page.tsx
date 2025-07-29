"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  Users,
  Building2,
  Shield,
  Settings,
  TrendingUp,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  MessageSquare,
  Video,
  Globe,
  Lock,
  Unlock,
  Home,
  LogOut,
  Bell,
  BarChart3,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Flag,
  Megaphone,
  Database,
  Menu,
} from "lucide-react";
import "../../styles/admin.scss";
import "../../styles/dashboard.scss";
import "../../styles/sidebar.scss";

export default function AdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "verification"
    | "colleges"
    | "insights"
    | "moderation"
    | "announcements"
  >("overview");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle click outside to close mobile sidebar
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".sidebar") && !target.closest(".mobile-menu-btn")) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Get user data from session
  const userName = session?.user?.name || "User";
  const userRole = session?.user?.role || "Admin";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Connections", href: "/dashboard/connections" },
    { icon: Search, label: "Explore", href: "/dashboard/explore" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: Calendar, label: "Calls", href: "/dashboard/calls" },
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
    { icon: BarChart3, label: "Insights", href: "/insights" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Shield, label: "Admin", href: "/admin" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "var(--primary)",
    },
    {
      title: "Pending Approvals",
      value: "23",
      change: "+5",
      trend: "up",
      icon: AlertCircle,
      color: "var(--warning)",
    },
    {
      title: "Active Colleges",
      value: "156",
      change: "+3%",
      trend: "up",
      icon: Building2,
      color: "var(--success)",
    },
    {
      title: "Platform Health",
      value: "98.5%",
      change: "+0.2%",
      trend: "up",
      icon: TrendingUp,
      color: "var(--info)",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "user_registered",
      user: "Sarah Wilson",
      college: "MIT",
      role: "Student",
      time: "2 minutes ago",
      status: "pending",
    },
    {
      id: 2,
      type: "user_approved",
      user: "Mike Johnson",
      college: "Harvard",
      role: "Alumni",
      time: "15 minutes ago",
      status: "approved",
    },
    {
      id: 3,
      type: "college_added",
      user: "Admin",
      college: "Stanford University",
      time: "1 hour ago",
      status: "completed",
    },
    {
      id: 4,
      type: "user_rejected",
      user: "John Doe",
      college: "Unknown",
      role: "Student",
      time: "2 hours ago",
      status: "rejected",
    },
  ];

  const pendingUsersData = [
    {
      id: 1,
      name: "Sarah Wilson",
      email: "sarah.wilson@mit.edu",
      college: "MIT",
      role: "Student",
      department: "Computer Science",
      batch: "2024",
      submittedAt: "2024-01-15 10:30",
      verificationMethod: "Email Domain",
    },
    {
      id: 2,
      name: "Alex Chen",
      email: "alex.chen@harvard.edu",
      college: "Harvard",
      role: "Alumni",
      department: "Business",
      batch: "2020",
      submittedAt: "2024-01-15 09:15",
      verificationMethod: "Email Domain",
    },
    {
      id: 3,
      name: "Emily Brown",
      email: "emily.brown@stanford.edu",
      college: "Stanford",
      role: "Professor",
      department: "Engineering",
      batch: "N/A",
      submittedAt: "2024-01-15 08:45",
      verificationMethod: "Manual Verification",
    },
  ];

  const colleges = [
    {
      id: 1,
      name: "MIT",
      domain: "mit.edu",
      status: "active",
      users: 847,
      admins: 3,
      crossCollegeConnections: false,
      joined: "2023-12-01",
    },
    {
      id: 2,
      name: "Harvard University",
      domain: "harvard.edu",
      status: "active",
      users: 623,
      admins: 2,
      crossCollegeConnections: true,
      joined: "2023-11-15",
    },
    {
      id: 3,
      name: "Stanford University",
      domain: "stanford.edu",
      status: "active",
      users: 456,
      admins: 2,
      crossCollegeConnections: false,
      joined: "2023-10-20",
    },
    {
      id: 4,
      name: "UC Berkeley",
      domain: "berkeley.edu",
      status: "pending",
      users: 0,
      admins: 1,
      crossCollegeConnections: false,
      joined: "2024-01-10",
    },
  ];

  useEffect(() => {
    if (activeTab === "verification") {
      setPendingLoading(true);
      setPendingError(null);
      fetch("/api/users?status=pending")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch pending users");
          return res.json();
        })
        .then((data) => {
          setPendingUsers(data.users || []);
        })
        .catch((err) => {
          setPendingError(err.message || "Error fetching pending users");
        })
        .finally(() => setPendingLoading(false));
    }
  }, [activeTab]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
        return <UserCheck size={16} />;
      case "user_approved":
        return <CheckCircle size={16} />;
      case "user_rejected":
        return <XCircle size={16} />;
      case "college_added":
        return <Building2 size={16} />;
      default:
        return <Eye size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "var(--success)";
      case "pending":
        return "var(--warning)";
      case "approved":
        return "var(--success)";
      case "rejected":
        return "var(--destructive)";
      case "completed":
        return "var(--info)";
      default:
        return "var(--muted)";
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      setPendingUsers((prev: any[]) =>
        prev.map((u) => (u.id === userId ? { ...u, _loading: "approve" } : u))
      );
      const res = await fetch(`/api/users/${userId}/approve`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to approve user");
      setPendingUsers((prev: any[]) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Failed to approve user");
      setPendingUsers((prev: any[]) =>
        prev.map((u) => (u.id === userId ? { ...u, _loading: undefined } : u))
      );
    }
  };

  const handleRejectUser = async (userId: number) => {
    try {
      setPendingUsers((prev: any[]) =>
        prev.map((u) => (u.id === userId ? { ...u, _loading: "reject" } : u))
      );
      const res = await fetch(`/api/users/${userId}/reject`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to reject user");
      setPendingUsers((prev: any[]) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Failed to reject user");
      setPendingUsers((prev: any[]) =>
        prev.map((u) => (u.id === userId ? { ...u, _loading: undefined } : u))
      );
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Simple Icon Sidebar */}
      <div className={`sidebar icon-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">CC</h2>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`nav-item icon-nav-item ${
                  item.href === "/admin" ? "active" : ""
                }`}
                title={item.label}
              >
                <Icon size={24} />
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn icon-logout-btn"
            title="Logout"
            onClick={() => signOut({ callbackUrl: "/auth" })}
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="user-info">
            <div className="avatar">
              <span>{userInitials}</span>
            </div>
            <div className="user-details">
              <span className="name">{userName}</span>
              <span className="role">{userRole}</span>
            </div>
          </div>
          <div className="top-bar-right">
            {/* Space for future actions on the right */}
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <div className="admin-page">
            <div className="admin-header">
              <div className="header-content">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">
                  Manage user verification, college access, and platform
                  settings
                </p>
              </div>
              <div className="header-actions">
                <button className="btn btn-secondary">
                  <Download size={16} />
                  Export Data
                </button>
                <button className="btn btn-primary">
                  <Plus size={16} />
                  Add College
                </button>
              </div>
            </div>

            <div className="admin-tabs">
              <button
                className={`tab ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <TrendingUp size={18} />
                <span>Overview</span>
              </button>
              <button
                className={`tab ${
                  activeTab === "verification" ? "active" : ""
                }`}
                onClick={() => setActiveTab("verification")}
              >
                <Shield size={18} />
                <span>Verification</span>
              </button>
              <button
                className={`tab ${activeTab === "colleges" ? "active" : ""}`}
                onClick={() => setActiveTab("colleges")}
              >
                <Building2 size={18} />
                <span>Colleges</span>
              </button>
              <button
                className={`tab ${activeTab === "insights" ? "active" : ""}`}
                onClick={() => setActiveTab("insights")}
              >
                <BarChart3 size={18} />
                <span>Insights</span>
              </button>
              <button
                className={`tab ${activeTab === "moderation" ? "active" : ""}`}
                onClick={() => setActiveTab("moderation")}
              >
                <Flag size={18} />
                <span>Moderation</span>
              </button>
              <button
                className={`tab ${
                  activeTab === "announcements" ? "active" : ""
                }`}
                onClick={() => setActiveTab("announcements")}
              >
                <Megaphone size={18} />
                <span>Announcements</span>
              </button>
            </div>

            <div className="admin-content">
              {activeTab === "overview" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overview-content"
                >
                  {/* Stats Grid */}
                  <div className="stats-grid">
                    {stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div key={index} className="stat-card">
                          <div
                            className="stat-icon"
                            style={{ backgroundColor: stat.color }}
                          >
                            <Icon size={24} />
                          </div>
                          <div className="stat-info">
                            <h3 className="stat-value">{stat.value}</h3>
                            <p className="stat-title">{stat.title}</p>
                            <span className={`stat-change ${stat.trend}`}>
                              {stat.change}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recent Activity */}
                  <div className="activity-section">
                    <div className="section-header">
                      <h2>Recent Activity</h2>
                      <button className="btn btn-outline">View All</button>
                    </div>
                    <div className="activity-list">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="activity-item">
                          <div className="activity-icon">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="activity-content">
                            <div className="activity-header">
                              <span className="activity-user">
                                {activity.user}
                              </span>
                              <span className="activity-time">
                                {activity.time}
                              </span>
                            </div>
                            <p className="activity-description">
                              {activity.type === "user_registered" &&
                                `${activity.user} registered as ${activity.role} from ${activity.college}`}
                              {activity.type === "user_approved" &&
                                `${activity.user} was approved`}
                              {activity.type === "user_rejected" &&
                                `${activity.user} was rejected`}
                              {activity.type === "college_added" &&
                                `${activity.college} was added`}
                            </p>
                            <span
                              className="activity-status"
                              style={{
                                backgroundColor: getStatusColor(
                                  activity.status
                                ),
                              }}
                            >
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "verification" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="verification-content"
                >
                  <div className="content-header">
                    <div className="search-filters">
                      <div className="search-container">
                        <Search size={16} />
                        <input
                          type="text"
                          placeholder="Search pending users..."
                          className="search-input"
                        />
                      </div>
                      <button className="btn btn-outline">
                        <Filter size={16} />
                        Filters
                      </button>
                    </div>
                    <div className="verification-stats">
                      <span className="stat-badge pending">
                        {pendingUsers.length} Pending
                      </span>
                    </div>
                  </div>

                  <div className="table-container">
                    {pendingLoading ? (
                      <div>Loading pending users...</div>
                    ) : pendingError ? (
                      <div style={{ color: "red" }}>{pendingError}</div>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>College</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Verification Method</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingUsers.map((user) => (
                            <tr key={user.id}>
                              <td>
                                <div className="user-cell">
                                  <div className="user-avatar">
                                    {user.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </div>
                                  <div className="user-info">
                                    <span className="user-name">
                                      {user.name}
                                    </span>
                                    <span className="user-email">
                                      {user.email}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {user.colleges?.name || user.college || "-"}
                              </td>
                              <td>
                                <span className="role-badge">{user.role}</span>
                              </td>
                              <td>{user.department || "-"}</td>
                              <td>
                                <span className="verification-badge">
                                  {user.verificationMethod || "-"}
                                </span>
                              </td>
                              <td>
                                {user.created_at
                                  ? user.created_at.split("T")[0]
                                  : "-"}
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    className="action-btn approve"
                                    onClick={() => handleApproveUser(user.id)}
                                    title="Approve"
                                    disabled={user._loading === "approve"}
                                  >
                                    {user._loading === "approve" ? (
                                      "..."
                                    ) : (
                                      <CheckCircle size={16} />
                                    )}
                                  </button>
                                  <button
                                    className="action-btn reject"
                                    onClick={() => handleRejectUser(user.id)}
                                    title="Reject"
                                    disabled={user._loading === "reject"}
                                  >
                                    {user._loading === "reject" ? (
                                      "..."
                                    ) : (
                                      <XCircle size={16} />
                                    )}
                                  </button>
                                  <button className="action-btn">
                                    <Eye size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "colleges" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="colleges-content"
                >
                  <div className="content-header">
                    <div className="search-filters">
                      <div className="search-container">
                        <Search size={16} />
                        <input
                          type="text"
                          placeholder="Search colleges..."
                          className="search-input"
                        />
                      </div>
                      <button className="btn btn-outline">
                        <Filter size={16} />
                        Filters
                      </button>
                    </div>
                    <button className="btn btn-primary">
                      <Plus size={16} />
                      Add College
                    </button>
                  </div>

                  <div className="colleges-grid">
                    {colleges.map((college) => (
                      <div key={college.id} className="college-card">
                        <div className="college-header">
                          <div className="college-info">
                            <h3 className="college-name">{college.name}</h3>
                            <span className="college-domain">
                              {college.domain}
                            </span>
                          </div>
                          <div className="college-status">
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(college.status),
                              }}
                            >
                              {college.status}
                            </span>
                          </div>
                        </div>
                        <div className="college-stats">
                          <div className="stat">
                            <span className="stat-label">Users</span>
                            <span className="stat-value">{college.users}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Admins</span>
                            <span className="stat-value">{college.admins}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Cross-College</span>
                            <span className="stat-value">
                              {college.crossCollegeConnections
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </div>
                        </div>
                        <div className="college-actions">
                          <button className="btn btn-outline">
                            <Eye size={16} />
                            View
                          </button>
                          <button className="btn btn-secondary">
                            <Edit size={16} />
                            Edit
                          </button>
                          <button className="btn btn-destructive">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "insights" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="insights-content"
                >
                  <div className="insights-grid">
                    <div className="insight-card">
                      <h3>User Distribution by Role</h3>
                      <div className="insight-data">
                        <div className="data-item">
                          <span className="label">Students</span>
                          <span className="value">1,847</span>
                        </div>
                        <div className="data-item">
                          <span className="label">Alumni</span>
                          <span className="value">756</span>
                        </div>
                        <div className="data-item">
                          <span className="label">Professors</span>
                          <span className="value">244</span>
                        </div>
                      </div>
                    </div>

                    <div className="insight-card">
                      <h3>Platform Activity</h3>
                      <div className="insight-data">
                        <div className="data-item">
                          <span className="label">Total Connections</span>
                          <span className="value">12,456</span>
                        </div>
                        <div className="data-item">
                          <span className="label">Messages Sent</span>
                          <span className="value">45,789</span>
                        </div>
                        <div className="data-item">
                          <span className="label">Scheduled Calls</span>
                          <span className="value">1,234</span>
                        </div>
                      </div>
                    </div>

                    <div className="insight-card">
                      <h3>Verification Status</h3>
                      <div className="insight-data">
                        <div className="data-item">
                          <span className="label">Approved</span>
                          <span className="value success">2,824</span>
                        </div>
                        <div className="data-item">
                          <span className="label">Pending</span>
                          <span className="value warning">23</span>
                        </div>
                        <div className="data-item">
                          <span className="label">Rejected</span>
                          <span className="value destructive">12</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "moderation" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="moderation-content"
                >
                  <div className="moderation-grid">
                    <div className="moderation-card">
                      <div className="card-header">
                        <h3>Platform Settings</h3>
                      </div>
                      <div className="setting-list">
                        <div className="setting-item">
                          <div className="setting-info">
                            <span className="setting-label">Resume Upload</span>
                            <span className="setting-description">
                              Allow users to upload resumes
                            </span>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                        <div className="setting-item">
                          <div className="setting-info">
                            <span className="setting-label">
                              Call Scheduling
                            </span>
                            <span className="setting-description">
                              Enable video call scheduling
                            </span>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                        <div className="setting-item">
                          <div className="setting-info">
                            <span className="setting-label">Chat Access</span>
                            <span className="setting-description">
                              Allow direct messaging
                            </span>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="moderation-card">
                      <div className="card-header">
                        <h3>Flagged Content</h3>
                      </div>
                      <div className="flagged-content">
                        <div className="empty-state">
                          <Flag size={48} />
                          <p>No flagged content at the moment</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "announcements" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="announcements-content"
                >
                  <div className="content-header">
                    <h2>Broadcast Messages</h2>
                    <button className="btn btn-primary">
                      <Plus size={16} />
                      Create Announcement
                    </button>
                  </div>

                  <div className="announcements-grid">
                    <div className="announcement-card">
                      <div className="announcement-header">
                        <h3>Alumni Meetup 2024</h3>
                        <span className="announcement-status active">
                          Active
                        </span>
                      </div>
                      <p className="announcement-content">
                        Join us for the annual alumni meetup on March 15th,
                        2024. Network with fellow alumni and share your
                        experiences.
                      </p>
                      <div className="announcement-meta">
                        <span>Sent to: All Colleges</span>
                        <span>Views: 1,234</span>
                      </div>
                    </div>

                    <div className="announcement-card">
                      <div className="announcement-header">
                        <h3>Job Fair Registration</h3>
                        <span className="announcement-status scheduled">
                          Scheduled
                        </span>
                      </div>
                      <p className="announcement-content">
                        Register now for the upcoming job fair featuring top
                        companies from various industries.
                      </p>
                      <div className="announcement-meta">
                        <span>Sent to: MIT, Harvard</span>
                        <span>Scheduled: Tomorrow 10:00 AM</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
