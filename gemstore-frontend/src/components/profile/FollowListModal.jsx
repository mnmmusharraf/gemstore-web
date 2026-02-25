import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import useFollowList from '../../hooks/useFollowList';
import './FollowListModal.css';

const FollowListModal = ({
  type,
  userId,
  currentUserId,
  onClose,
  onUserClick,
  onCountChange,
}) => {
  const {
    users,
    loading,
    error,
    followStatus,
    busy,
    isFollowers,
    fetchUsers,
    toggleFollow,
    removeFollower,
  } = useFollowList({ type, userId, currentUserId, onCountChange });

  const title = isFollowers ? 'Followers' : 'Following';

  const getBtnText = (id) => {
    if (busy[id]) return <span className="btn-spinner-small" />;
    const status = followStatus[id] || 'NONE';
    if (status === 'ACTIVE') return 'Following';
    if (status === 'PENDING') return 'Requested';
    return 'Follow';
  };

  const getBtnClass = (id) => {
    const status = followStatus[id] || 'NONE';
    if (status === 'ACTIVE') return 'modal-follow-btn following';
    if (status === 'PENDING') return 'modal-follow-btn pending';
    return 'modal-follow-btn';
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleUserClick = (uid) => {
    onClose();
    onUserClick?.(uid);
  };

  return (
    <div className="follow-modal-overlay" onClick={handleOverlayClick}>
      <div className="follow-modal">
        <header className="follow-modal-header">
          <div className="follow-modal-title">{title}</div>
          <button
            className="follow-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="follow-modal-content">
          {loading ?  (
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
                <div key={user.id} className="follow-modal-item">
                  <div
                    className="follow-modal-user"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <div className="follow-modal-avatar">
                      {user.avatarUrl ?  (
                        <img src={user.avatarUrl} alt="" />
                      ) : (
                        <div className="avatar-fallback">
                          {(user.username || 'U')[0]. toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="follow-modal-info">
                      <div className="follow-modal-username">
                        {user.username}
                      </div>
                      {user.displayName && (
                        <div className="follow-modal-name">
                          {user.displayName}
                        </div>
                      )}
                    </div>
                  </div>

                  {user.id !== currentUserId ?  (
                    <div className="follow-modal-actions">
                      <button
                        className={getBtnClass(user.id)}
                        onClick={() => toggleFollow(user.id)}
                        disabled={Boolean(busy[user.id])}
                      >
                        {getBtnText(user.id)}
                      </button>

                      {isFollowers && userId === currentUserId && (
                        <button
                          className="modal-remove-btn"
                          onClick={() => removeFollower(user.id)}
                          disabled={Boolean(busy[user. id])}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ) : (
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