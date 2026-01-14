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
  const [requestActionLoading, setRequestActionLoading] = useState({});
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

  const acceptFollowRequest = async (userId) => {
    if (!userId) return;
    setRequestActionLoading((prev) => ({ ...prev, [userId]: 'accept' }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/follow-requests/${userId}/accept`,
        { method: 'POST', headers: getAuthHeaders() }
      );
      await handleResponse(response);
      setFollowRequests((prev) => prev.filter((r) => r.id !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setRequestActionLoading((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  const rejectFollowRequest = async (userId) => {
    if (!userId) return;
    setRequestActionLoading((prev) => ({ ...prev, [userId]: 'reject' }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/follow-requests/${userId}/reject`,
        { method: 'POST', headers: getAuthHeaders() }
      );
      await handleResponse(response);
      setFollowRequests((prev) => prev.filter((r) => r.id !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setRequestActionLoading((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
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
        {activeTab === 'requests' ? (
          <FollowRequestsList
            requests={followRequests}
            loading={requestsLoading}
            onUserClick={handleUserProfileClick}
            onAccept={acceptFollowRequest}
            onReject={rejectFollowRequest}
            actionLoading={requestActionLoading}
          />
        ) : loading ? (
          <LoadingSpinner message="Loading notifications..." />
        ) : error ? (
          <div className="notifications-error">
            <p>{error}</p>
            <button onClick={fetchNotifications}>Retry</button>
          </div>
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

const FollowRequestsList = ({ requests, loading, onUserClick, onAccept, onReject, actionLoading }) => {
  if (loading) return <LoadingSpinner message="Loading requests..." />;
  if (!requests.length) return <EmptyState tab="requests" />;

  return (
    <div className="follow-requests-list">
      {requests.map((r) => {
        const userId = r.id;
        const username = r.username || 'Unknown';
        const displayName = r.displayName || r.name || '';
        const initial = username[0]?.toUpperCase() || 'U';
        const isAccepting = actionLoading?.[userId] === 'accept';
        const isRejecting = actionLoading?.[userId] === 'reject';
        const isBusy = Boolean(actionLoading?.[userId]);

        return (
          <div key={userId} className="follow-request-item">
            <div className="request-user" onClick={() => onUserClick(userId)}>
              <div className="request-avatar" aria-hidden="true">
                <div className="avatar-placeholder">{initial}</div>
              </div>
              <div className="request-info">
                <span className="request-username">{username}</span>
                {displayName && <span className="request-name">{displayName}</span>}
              </div>
            </div>

            <div className="request-actions">
              <button
                type="button"
                className="accept-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept?.(userId);
                }}
                disabled={isBusy}
              >
                {isAccepting ? 'Accepting...' : 'Accept'}
              </button>
              <button
                type="button"
                className="reject-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject?.(userId);
                }}
                disabled={isBusy}
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
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
