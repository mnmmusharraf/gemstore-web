import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, getAuthHeaders, handleResponse } from '../../api/config';
import LoadingSpinner from '../common/LoadingSpinner';
import './FollowListModal.css';

const FollowListModal = ({
  type,
  userId,
  onClose,
  onUserClick,
  currentUserId 
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followStatus, setFollowStatus] = useState({});
  const [busy, setBusy] = useState({});

  const isFollowers = type === 'followers';
  const title = isFollowers ?  'Followers' : 'Following';

  // Fetch the list based on type
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Different endpoints for followers vs following
      const endpoint = isFollowers
        ? `${API_BASE_URL}/api/v1/users/${userId}/followers`  // People who follow this user
        : `${API_BASE_URL}/api/v1/users/${userId}/following`; // People this user follows

      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });

      const result = await handleResponse(response);

      // Handle different response structures
      let userList = result.data?. content || result.data || result || [];

      // Ensure it's an array
      if (!Array.isArray(userList)) {
        userList = [];
      }

      // For followers:  Backend should already filter to only ACTIVE followers
      // But if not, we can filter here (if status field is available)
      if (isFollowers) {
        userList = userList. filter(u => {
          // Only show accepted/active followers, not pending requests
          return u. followStatus !== 'PENDING' && u. status !== 'PENDING';
        });
      }

      setUsers(userList);

      // Fetch follow status for each user (to show follow/following button)
      if (currentUserId && userList.length > 0) {
        const statuses = {};

        await Promise.allSettled(
          userList.slice(0, 50).map(async (u) => {
            if (u.id === currentUserId) return;

            try {
              const res = await fetch(
                `${API_BASE_URL}/api/v1/users/${u.id}/follow/status`,
                { headers: getAuthHeaders() }
              );
              const data = await handleResponse(res);
              statuses[u.id] = data.data?.status || 'NONE';
            } catch {
              statuses[u.id] = 'NONE';
            }
          })
        );

        setFollowStatus(statuses);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [userId, isFollowers, currentUserId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toggle follow/unfollow
  const handleToggleFollow = async (targetUserId) => {
    if (! currentUserId || targetUserId === currentUserId) return;

    setBusy((p) => ({ ...p, [targetUserId]: true }));
    const prev = followStatus[targetUserId] || 'NONE';

    // Optimistic update
    const optimistic = prev === 'ACTIVE' ? 'NONE' : 'PENDING';
    setFollowStatus((m) => ({ ...m, [targetUserId]: optimistic }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${targetUserId}/follow/toggle`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
      const result = await handleResponse(response);

      const isFollowing = Boolean(result.data?. isFollowing);
      const isPending = Boolean(result.data?.isPending);

      const finalStatus = isFollowing
        ? isPending ?  'PENDING' : 'ACTIVE'
        : 'NONE';

      setFollowStatus((m) => ({ ...m, [targetUserId]: finalStatus }));

      // If we unfollowed from "Following" list, remove from list
      if (! isFollowers && ! isFollowing) {
        setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      setFollowStatus((m) => ({ ...m, [targetUserId]: prev }));
    } finally {
      setBusy((p) => {
        const n = { ...p };
        delete n[targetUserId];
        return n;
      });
    }
  };

  // Remove a follower (only available for own profile's followers)
  const handleRemoveFollower = async (followerId) => {
    if (!currentUserId || userId !== currentUserId) return;

    setBusy((p) => ({ ...p, [followerId]:  true }));

    try {
      await fetch(
        `${API_BASE_URL}/api/v1/users/followers/${followerId}/remove`,
        {
          method: 'DELETE',
          headers:  getAuthHeaders(),
        }
      );

      // Remove from list
      setUsers((prev) => prev.filter((u) => u.id !== followerId));
    } catch (err) {
      console.error('Failed to remove follower:', err);
    } finally {
      setBusy((p) => {
        const n = { ... p };
        delete n[followerId];
        return n;
      });
    }
  };

  const getButtonContent = (uid) => {
    if (busy[uid]) return <span className="btn-spinner-small" />;

    const status = followStatus[uid] || 'NONE';

    if (status === 'ACTIVE') return 'Following';
    if (status === 'PENDING') return 'Requested';
    return 'Follow';
  };

  const getButtonClass = (uid) => {
    const status = followStatus[uid] || 'NONE';

    if (status === 'ACTIVE') return 'modal-follow-btn following';
    if (status === 'PENDING') return 'modal-follow-btn pending';
    return 'modal-follow-btn';
  };

  // Close modal when clicking overlay
  const handleOverlayClick = (e) => {
    if (e. target === e.currentTarget) {
      onClose();
    }
  };

  // Handle user click - navigate to profile
  const handleUserClick = (uid) => {
    onClose();
    onUserClick?.(uid);
  };

  return (
    <div className="follow-modal-overlay" onClick={handleOverlayClick}>
      <div className="follow-modal">
        {/* Header */}
        <header className="follow-modal-header">
          <div className="follow-modal-title">{title}</div>
          <button
            className="follow-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Content */}
        <div className="follow-modal-content">
          {loading ? (
            <div className="follow-modal-loading">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="follow-modal-error">
              <p>{error}</p>
              <button onClick={fetchUsers}>Try again</button>
            </div>
          ) : users.length === 0 ? (
            <div className="follow-modal-empty">
              {isFollowers ? (
                <>
                  <div className="empty-icon">👥</div>
                  <div className="empty-title">No followers yet</div>
                  <div className="empty-text">
                    When people follow you, you'll see them here.
                  </div>
                </>
              ) : (
                <>
                  <div className="empty-icon">👤</div>
                  <div className="empty-title">Not following anyone</div>
                  <div className="empty-text">
                    When you follow people, you'll see them here.
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="follow-modal-list">
              {users.map((user) => (
                <div key={user. id} className="follow-modal-item">
                  {/* User Info */}
                  <div
                    className="follow-modal-user"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <div className="follow-modal-avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" />
                      ) : (
                        <div className="avatar-fallback">
                          {(user.username || 'U')[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="follow-modal-info">
                      <div className="follow-modal-username">{user.username}</div>
                      {user.displayName && (
                        <div className="follow-modal-name">{user.displayName}</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {user.id !== currentUserId && (
                    <div className="follow-modal-actions">
                      <button
                        className={getButtonClass(user.id)}
                        onClick={() => handleToggleFollow(user.id)}
                        disabled={Boolean(busy[user. id])}
                      >
                        {getButtonContent(user.id)}
                      </button>

                      {/* Show Remove button only for own profile's followers */}
                      {isFollowers && userId === currentUserId && (
                        <button
                          className="modal-remove-btn"
                          onClick={() => handleRemoveFollower(user. id)}
                          disabled={Boolean(busy[user.id])}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}

                  {/* Show "You" badge for current user */}
                  {user.id === currentUserId && (
                    <div className="follow-modal-you">You</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;