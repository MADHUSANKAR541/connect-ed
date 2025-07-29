'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Check, 
  X, 
  Users, 
  MessageSquare, 
  Calendar,
  Eye,
  MoreVertical,
  Filter,
  CheckCheck
} from 'lucide-react';
import '../../../styles/notifications.scss';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [filter, page]);

  const loadNotifications = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        unread: filter === 'unread' ? 'true' : 'false',
      });

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (response.ok) {
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notificationIds.includes(notification.id)
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CONNECTION_REQUEST':
        return <Users size={16} />;
      case 'MESSAGE':
        return <MessageSquare size={16} />;
      case 'CALL_REQUEST':
        return <Calendar size={16} />;
      case 'CALL_ACCEPTED':
        return <Check size={16} />;
      case 'CALL_REJECTED':
        return <X size={16} />;
      case 'PROFILE_VIEW':
        return <Eye size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'CONNECTION_REQUEST':
        return 'var(--primary)';
      case 'MESSAGE':
        return 'var(--success)';
      case 'CALL_REQUEST':
        return 'var(--warning)';
      case 'CALL_ACCEPTED':
        return 'var(--success)';
      case 'CALL_REJECTED':
        return 'var(--destructive)';
      case 'PROFILE_VIEW':
        return 'var(--info)';
      default:
        return 'var(--muted)';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-content">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated with your network activity</p>
        </div>
        <div className="header-actions">
          <div className="filter-controls">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setFilter('all');
                setPage(1);
              }}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => {
                setFilter('unread');
                setPage(1);
              }}
            >
              Unread
            </button>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button className="btn btn-outline" onClick={markAllAsRead}>
              <CheckCheck size={16} />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-content">
        {loading && page === 1 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} />
            <h3>No notifications</h3>
            <p>You're all caught up! New notifications will appear here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                </div>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="action-btn"
                      onClick={() => markAsRead([notification.id])}
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="load-more">
            <button className="btn btn-outline" onClick={loadMore}>
              Load More
            </button>
          </div>
        )}

        {loading && page > 1 && (
          <div className="loading-more">
            <div className="spinner"></div>
            <p>Loading more...</p>
          </div>
        )}
      </div>
    </div>
  );
} 