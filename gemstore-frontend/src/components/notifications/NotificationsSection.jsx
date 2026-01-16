import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, getAuthHeaders, handleResponse } from '../../api/config';
import { connectNotificationSocket, disconnectNotificationSocket } from '../../api/notificationSocket';
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
  const [requestsCount, setRequestsCount] = useState(0);

  // Unread counts by category
  const likesUnreadCount = notifications. filter(
    (n) => ! n.isRead && String(n?. type || '').toUpperCase().includes('LIKE')
  ).length;

  const followsUnreadCount = notifications. filter((n) => {
    if (n.isRead) return false;
    const type = String(n?.type || '').toUpperCase();
    return type === 'FOLLOW' || type === 'FOLLOW_ACCEPTED';
  }).length;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ================= WebSocket Connection ================= */

  useEffect(() => {
    if (! currentUser?.id) return;

    connectNotificationSocket((payload) => {
      if (!payload?.id) return;

      setNotifications((prev) => {
        const existingIndex = prev.findIndex((n) => n.id === payload.id);
        if (existingIndex === -1) return [payload, ...prev];

        const next = [... prev];
        next[existingIndex] = { ...next[existingIndex], ... payload };
        return next;
      });
    });

    return () => disconnectNotificationSocket();
  }, [currentUser?.id]);

  /* ================= Fetch Requests Count ================= */

  const fetchRequestsCount = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/users/follow-requests/count`,
        { headers: getAuthHeaders() }
      );
      const result = await handleResponse(res);
      setRequestsCount(result.data?. count || 0);
    } catch (e) {
      console.error('Failed to fetch requests count:', e);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchRequestsCount();
    const interval = setInterval(fetchRequestsCount, 30000);
    return () => clearInterval(interval);
  }, [fetchRequestsCount]);

  /* ================= Fetch Notifications ================= */

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?. id) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/notifications?page=0&size=50`,
        { headers: getAuthHeaders() }
      );
      const result = await handleResponse(response);
      setNotifications(result. data?. content || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [currentUser?. id]);

  const fetchFollowRequests = useCallback(async () => {
    if (!currentUser?.id) return;

    setRequestsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/follow-requests?page=0&size=20`,
        { headers: getAuthHeaders() }
      );
      const result = await handleResponse(response);
      setFollowRequests(result. data?.content || []);
    } catch (err) {
      console.error('Failed to fetch follow requests:', err);
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

  /* ================= Mark As Read Actions ================= */

  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `${API_BASE_URL}/api/v1/notifications/${notificationId}/read`,
        { method: 'POST', headers: getAuthHeaders() }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ... n, isRead:  true } : n))
      );

      onNotificationRead?.(1);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(
        `${API_BASE_URL}/api/v1/notifications/read-all`,
        { method: 'POST', headers: getAuthHeaders() }
      );

      const count = notifications.filter((n) => !n.isRead).length;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onNotificationRead?.(count);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const markCategoryAsRead = async (category) => {
    const getType = (n) => String(n?.type || '').toUpperCase();

    const unreadInCategory = notifications.filter((n) => {
      if (n.isRead) return false;
      const type = getType(n);

      if (category === 'follows') {
        return type === 'FOLLOW' || type === 'FOLLOW_ACCEPTED';
      }
      if (category === 'likes') {
        return type.includes('LIKE');
      }
      return false;
    });

    if (unreadInCategory.length === 0) return;

    // Optimistic UI update
    const unreadIds = new Set(unreadInCategory.map((n) => n.id));
    setNotifications((prev) =>
      prev.map((n) => (unreadIds.has(n.id) ? { ...n, isRead: true } :  n))
    );
    onNotificationRead?.(unreadInCategory. length);

    // API calls in background
    try {
      await Promise.allSettled(
        unreadInCategory. map((n) =>
          fetch(`${API_BASE_URL}/api/v1/notifications/${n. id}/read`, {
            method: 'POST',
            headers: getAuthHeaders(),
          })
        )
      );
    } catch (err) {
      console.error('Failed to mark category as read:', err);
    }
  };

  /* ================= Follow Request Actions ================= */

  const acceptFollowRequest = async (userId) => {
    if (!userId) return;
    setRequestActionLoading((prev) => ({ ...prev, [userId]:  'accept' }));

    try {
      await fetch(
        `${API_BASE_URL}/api/v1/users/follow-requests/${userId}/accept`,
        { method: 'POST', headers: getAuthHeaders() }
      );
      setFollowRequests((prev) => prev.filter((r) => r.id !== userId));
      setRequestsCount((c) => Math.max(0, c - 1));
      fetchNotifications();
    } catch (err) {
      console.error('Failed to accept request:', err);
    } finally {
      setRequestActionLoading((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  const rejectFollowRequest = async (userId) => {
    if (! userId) return;
    setRequestActionLoading((prev) => ({ ...prev, [userId]: 'reject' }));

    try {
      await fetch(
        `${API_BASE_URL}/api/v1/users/follow-requests/${userId}/reject`,
        { method: 'POST', headers: getAuthHeaders() }
      );
      setFollowRequests((prev) => prev.filter((r) => r.id !== userId));
      setRequestsCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console. error('Failed to reject request:', err);
    } finally {
      setRequestActionLoading((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  /* ================= Filtering ================= */

  const filteredNotifications = (() => {
    const getType = (n) => String(n?. type || '').toUpperCase();

    if (activeTab === 'follows') {
      return notifications.filter((n) => {
        const type = getType(n);
        return type === 'FOLLOW' || type === 'FOLLOW_ACCEPTED';
      });
    }
    if (activeTab === 'likes') {
      return notifications.filter((n) => getType(n).includes('LIKE'));
    }
    // 'all' tab - exclude FOLLOW_REQUEST (shown in requests tab)
    return notifications.filter((n) => getType(n) !== 'FOLLOW_REQUEST');
  })();

  const handleUserProfileClick = (userId) => {
    if (userId !== currentUser?.id) {
      onUserClick?.(userId);
    }
  };

  const handleBadgeClick = (e, tab) => {
    e.stopPropagation();
    if (tab === 'follows' || tab === 'likes') {
      markCategoryAsRead(tab);
    }
  };

  /* ================= Render ================= */

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
            {tab. charAt(0).toUpperCase() + tab.slice(1)}

            {tab === 'requests' && requestsCount > 0 && (
              <span className="tab-badge">{requestsCount}</span>
            )}
            {tab === 'follows' && followsUnreadCount > 0 && (
              <span
                className="tab-badge clickable-badge"
                onClick={(e) => handleBadgeClick(e, 'follows')}
                title="Click to mark all as read"
              >
                {followsUnreadCount}
              </span>
            )}
            {tab === 'likes' && likesUnreadCount > 0 && (
              <span
                className="tab-badge clickable-badge"
                onClick={(e) => handleBadgeClick(e, 'likes')}
                title="Click to mark all as read"
              >
                {likesUnreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="notifications-content">
        {activeTab === 'requests' ?  (
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
        ) : error ?  (
          <div className="notifications-error">
            <p>{error}</p>
            <button onClick={fetchNotifications}>Retry</button>
          </div>
        ) : filteredNotifications.length === 0 ?  (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="notifications-list">
            {filteredNotifications. map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                currentUserId={currentUser?. id}
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

/* ================= NOTIFICATION ITEM ================= */

const NotificationItem = ({ notification, currentUserId, onUserClick, onMarkAsRead }) => {
  const { id, type, actor, listing, message, isRead, createdAt } = notification;

  const handleClick = () => {
    if (!isRead) onMarkAsRead(id);
    if (actor?. id && actor.id !== currentUserId) {
      onUserClick(actor.id);
    }
  };

  const getIcon = () => {
    const notifType = String(type || '').toUpperCase();
    switch (notifType) {
      case 'LIKE':
        return '❤️';
      case 'FOLLOW': 
        return '👤';
      case 'FOLLOW_ACCEPTED':
        return '✅';
      case 'COMMENT':
        return '💬';
      case 'MENTION':
        return '@';
      default:
        return '🔔';
    }
  };

  const getMessage = () => {
    const notifType = String(type || '').toUpperCase();
    switch (notifType) {
      case 'LIKE':
        return (
          <>
            <strong>{actor?.username}</strong> liked your listing
            {listing?.title && <span className="listing-ref"> "{listing.title}"</span>}
          </>
        );
      case 'FOLLOW':
        return (
          <>
            <strong>{actor?.username}</strong> started following you
          </>
        );
      case 'FOLLOW_ACCEPTED':
        return (
          <>
            <strong>{actor?. username}</strong> accepted your follow request
          </>
        );
      case 'COMMENT':
        return (
          <>
            <strong>{actor?.username}</strong> commented on your listing
            {listing?.title && <span className="listing-ref"> "{listing.title}"</span>}
          </>
        );
      default:
        return message || 'New notification';
    }
  };

  const timeAgo = createdAt ? formatTimeAgo(new Date(createdAt)) : '';

  return (
    <div className={`notification-item ${!isRead ? 'unread' :  ''}`} onClick={handleClick}>
      <div className="notification-avatar">
        {actor?. avatarUrl ? (
          <img src={actor.avatarUrl} alt={actor.username} />
        ) : (
          <span className="avatar-placeholder">
            {actor?. username?.[0]?.toUpperCase() || '?'}
          </span>
        )}
      </div>

      <div className="notification-content">
        <p className="notification-message">{getMessage()}</p>
        <span className="notification-time">{timeAgo}</span>
      </div>

      <div className="notification-icon">{getIcon()}</div>

      {listing?.primaryImageUrl && (
        <div className="notification-thumbnail">
          <img src={listing.primaryImageUrl} alt={listing. title} />
        </div>
      )}

      {!isRead && <div className="unread-dot" />}
    </div>
  );
};

/* ================= FOLLOW REQUESTS LIST ================= */

const FollowRequestsList = ({ requests, loading, onUserClick, onAccept, onReject, actionLoading }) => {
  if (loading) return <LoadingSpinner message="Loading requests..." />;
  if (! requests. length) return <EmptyState tab="requests" />;

  return (
    <div className="follow-requests-list">
      {requests.map((r) => {
        const userId = r.id;
        const username = r.username || 'Unknown';
        const displayName = r.displayName || r.name || '';
        const avatarUrl = r. avatarUrl;
        const initial = username[0]?.toUpperCase() || 'U';
        const isAccepting = actionLoading?.[userId] === 'accept';
        const isRejecting = actionLoading?.[userId] === 'reject';
        const isBusy = Boolean(actionLoading?.[userId]);

        return (
          <div key={userId} className="follow-request-item">
            <div className="request-user" onClick={() => onUserClick(userId)}>
              <div className="request-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={username} />
                ) : (
                  <span className="avatar-placeholder">{initial}</span>
                )}
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
                {isAccepting ?  'Accepting.. .' : 'Accept'}
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

/* ================= EMPTY STATE ================= */

const EmptyState = ({ tab }) => {
  const content = {
    all: {
      icon: '🔔',
      title: 'No notifications yet',
      message: 'When you get notifications, they will show up here.',
    },
    requests: {
      icon: '👥',
      title: 'No follow requests',
      message: 'When someone requests to follow you, it will appear here.',
    },
    follows: {
      icon: '👤',
      title:  'No follow notifications',
      message:  'When someone follows you, it will appear here.',
    },
    likes: {
      icon: '❤️',
      title: 'No likes yet',
      message: 'When someone likes your listings, it will appear here.',
    },
  };

  const { icon, title, message } = content[tab] || content. all;

  return (
    <div className="notifications-empty">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
};

/* ================= HELPER FUNCTION ================= */

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
};

export default NotificationsSection;