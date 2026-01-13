import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, getAuthHeaders, handleResponse } from '../../api/config';
import LoadingSpinner from '../common/LoadingSpinner';
import './NotificationsSection.css';

const NotificationsSection = ({ currentUser, onUserClick, onNotificationRead }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState('');

  /* ================= FETCH NOTIFICATIONS ================= */

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/notifications?page=0&size=50`,
        { headers: getAuthHeaders() }
      );

      const result = await handleResponse(response);
      setNotifications(result.data?.content || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const fetchFollowRequests = useCallback(async () => {
    if (!currentUser?.id) return;

    setRequestsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/follow-requests?page=0&size=20`,
        { headers: getAuthHeaders() }
      );

      const result = await handleResponse(response);
      setFollowRequests(result.data?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchFollowRequests();
    }
  }, [activeTab, fetchFollowRequests]);

  /* ================= ACTIONS ================= */

  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `${API_BASE_URL}/api/v1/notifications/${notificationId}/read`,
        { method: 'POST', headers: getAuthHeaders() }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      onNotificationRead?.(1);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(
        `${API_BASE_URL}/api/v1/notifications/read-all`,
        { method: 'POST', headers: getAuthHeaders() }
      );

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

      onNotificationRead?.(unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FILTERING ================= */

  const filteredNotifications = (() => {
    if (activeTab === 'follows') {
      return notifications.filter(
        (n) => n.type === 'FOLLOW' || n.type === 'FOLLOW_ACCEPTED'
      );
    }
    if (activeTab === 'likes') {
      return notifications.filter((n) => n.type === 'LIKE');
    }
    return notifications;
  })();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleUserProfileClick = (userId) => {
    if (userId !== currentUser?.id) {
      onUserClick?.(userId);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="notifications-section">
      <header className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </header>

      <div className="notifications-tabs">
        {['all', 'requests', 'follows', 'likes'].map((tab) => (
          <button
            key={tab}
            className={`notifications-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'requests' && followRequests.length > 0 && (
              <span className="tab-badge">{followRequests.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="notifications-content">
        {loading ? (
          <LoadingSpinner message="Loading notifications..." />
        ) : error ? (
          <div className="notifications-error">
            <p>{error}</p>
            <button onClick={fetchNotifications}>Retry</button>
          </div>
        ) : activeTab === 'requests' ? (
          <FollowRequestsList
            requests={followRequests}
            loading={requestsLoading}
            onUserClick={handleUserProfileClick}
          />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                currentUserId={currentUser?.id}
                onUserClick={handleUserProfileClick}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= ITEM ================= */

const NotificationItem = ({ notification, currentUserId, onUserClick, onMarkAsRead }) => {
  const { id, actor, message, isRead, createdAt } = notification;

  const handleClick = () => {
    if (!isRead) onMarkAsRead(id);
    if (actor?.id && actor.id !== currentUserId) {
      onUserClick(actor.id);
    }
  };

  return (
    <div className={`notification-item ${!isRead ? 'unread' : ''}`} onClick={handleClick}>
      <div className="notification-content">
        <p>
          <strong>{actor?.username}</strong> {message}
        </p>
        <span>{formatTimeAgo(new Date(createdAt))}</span>
      </div>
      {!isRead && <span className="unread-dot" />}
    </div>
  );
};

/* ================= HELPERS ================= */

const FollowRequestsList = ({ requests, loading, onUserClick }) => {
  if (loading) return <LoadingSpinner message="Loading requests..." />;
  if (!requests.length) return <EmptyState tab="requests" />;

  return requests.map((r) => (
    <div key={r.id} onClick={() => onUserClick(r.id)}>
      {r.username}
    </div>
  ));
};

const EmptyState = ({ tab }) => (
  <div className="notifications-empty">
    <h3>No {tab} notifications</h3>
  </div>
);

const formatTimeAgo = (date) => {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export default NotificationsSection;
