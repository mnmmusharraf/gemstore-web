import React from 'react';

const ProfileHeader = ({
  profile,
  saving,
  mode,
  onEditClick,
  onBack,
  onAvatarChange,
  onAvatarRemove,
}) => {
  const handleAvatarChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = e.target?. files?.[0];
      if (! file) return;

      if (! file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      onAvatarChange(file);
    };

    input.click();
  };

  const handleAvatarRemove = () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      onAvatarRemove();
    }
  };

  return (
    <header className="profile-header">
      <div className="profile-avatar-col">
        <div className="profile-avatar">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.username}
              className="profile-avatar-img"
            />
          ) : (
            <span className="profile-avatar-placeholder">
              {(profile.displayName || profile.username || 'G')[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="profile-avatar-actions">
          <button
            type="button"
            className="profile-change-photo-btn"
            onClick={handleAvatarChange}
            disabled={saving}
          >
            {saving ? 'Uploading...' : 'Change photo'}
          </button>
          {profile.avatarUrl && (
            <button
              type="button"
              className="profile-remove-photo-btn"
              onClick={handleAvatarRemove}
              disabled={saving}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="profile-header-info">
        <div className="profile-username-row">
          <span className="profile-username">
            {profile.username || 'username'}
          </span>

          {profile.privateProfile && (
            <span className="profile-private-badge">🔒 Private</span>
          )}

          {mode === 'view' && (
            <button
              type="button"
              className="profile-edit-btn"
              onClick={onEditClick}
            >
              Edit profile
            </button>
          )}

          {onBack && (
            <button
              type="button"
              className="profile-back-btn"
              onClick={onBack}
            >
              Back
            </button>
          )}
        </div>

        <div className="profile-stats">
          <span><strong>{profile.postsCount}</strong> posts</span>
          <span><strong>{profile.followersCount}</strong> followers</span>
          <span><strong>{profile.followingCount}</strong> following</span>
        </div>

        <div className="profile-name-and-bio">
          <div className="profile-display-name">
            {profile.displayName || profile.username}
          </div>
          {profile.bio && <div className="profile-bio-text">{profile.bio}</div>}
          {profile.website && (
            <a
              className="profile-website"
              href={profile.website. startsWith('http') ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noreferrer"
            >
              {profile.website. replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;