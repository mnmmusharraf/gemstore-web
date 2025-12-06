import React, { useState } from 'react';
import "../../styles/ProfilePage.css";

function ProfilePage({ currentUser, onBack }) {
  // view | edit
  const [mode, setMode] = useState('view');

  // Map DB fields
  const [displayName, setDisplayName] = useState(
    currentUser?.display_name || currentUser?.displayName || ''
  );
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [bio, setBio] = useState(
    currentUser?.bio ||
      'The greatest man in the world who inspired me the most is prophet Muhammad (sal) ❤️'
  );
  const [isPrivate, setIsPrivate] = useState(currentUser?.is_private || false);

  const avatarUrl = currentUser?.avatar_url || currentUser?.avatarUrl || null;

  // In future, pull these from backend (post count, follower count, following count)
  const postsCount = currentUser?.posts_count ?? 241;
  const followersCount = currentUser?.followers_count ?? 653;
  const followingCount = currentUser?.following_count ?? 132;

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: call backend to save profile changes
    // PUT /api/users/me { displayName, username, email, website, bio, isPrivate }
    alert('Profile saved (hook this to your backend profile update API).');
    setMode('view');
  };

  const handleCancel = () => {
    setDisplayName(currentUser?.display_name || currentUser?.displayName || '');
    setUsername(currentUser?.username || '');
    setEmail(currentUser?.email || '');
    setWebsite(currentUser?.website || '');
    setBio(
      currentUser?.bio ||
        'The greatest man in the world who inspired me the most is prophet Muhammad (sal) ❤️'
    );
    setIsPrivate(currentUser?.is_private || false);
    setMode('view');
  };

  return (
    <div className="profile-root">
      <section className="profile-main">
        {/* HEADER: avatar + username + stats + bio (Instagram style) */}
        <header className="profile-header">
          <div className="profile-avatar-col">
            <div className="profile-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="profile-avatar-img" />
              ) : (
                (displayName || username || 'G')[0].toUpperCase()
              )}
            </div>
            <button
              type="button"
              className="profile-change-photo-btn"
              // TODO: open file picker or navigation to photo upload
              onClick={() => alert('Open change photo dialog (not implemented yet)')}
            >
              Change profile photo
            </button>
          </div>

          <div className="profile-header-info">
            <div className="profile-username-row">
              <span className="profile-username">
                {username || 'username'}
              </span>

              {mode === 'view' && (
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={() => setMode('edit')}
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
              <span>
                <strong>{postsCount}</strong> posts
              </span>
              <span>
                <strong>{followersCount}</strong> followers
              </span>
              <span>
                <strong>{followingCount}</strong> following
              </span>
            </div>

            <div className="profile-name-and-bio">
              <div className="profile-display-name">
                {displayName || '$Musharraf…'}
              </div>
              {bio && <div className="profile-bio-text">{bio}</div>}
              {website && (
                <a
                  className="profile-website"
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {website}
                </a>
              )}
            </div>
          </div>
        </header>

        {/* VIEW MODE: posts grid stub (no preview card) */}
        {mode === 'view' && (
          <div className="profile-content">
            {/* Tabs row (optional, mimic IG: Posts | Reels | Saved, etc.) */}
            <div className="profile-tabs">
              <button className="profile-tab profile-tab-active">Posts</button>
              {/* you can add more tabs later */}
            </div>

            {/* Posts grid (static dummy for now) */}
            <div className="profile-posts-grid">
              {/* TODO: map actual posts from backend */}
              {[1, 2, 3, 4, 5, 6].map((id) => (
                <div key={id} className="profile-post-tile">
                  <span className="profile-post-placeholder">Post {id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDIT MODE: settings form below header */}
        {mode === 'edit' && (
          <div className="profile-form-card">
            <h2 className="profile-form-title">Edit profile</h2>

            <form className="profile-form" onSubmit={handleSave}>
              <div className="profile-form-row">
                <label className="profile-label">Name</label>
                <div className="profile-input-wrap">
                  <input
                    className="profile-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                  <span className="profile-help">
                    This is your public name. You can use your real name or a brand name.
                  </span>
                </div>
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Username</label>
                <div className="profile-input-wrap">
                  <input
                    className="profile-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                  />
                  <span className="profile-help">
                    In most cases, you’ll be able to change your username back to{' '}
                    {currentUser?.username}.
                  </span>
                </div>
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Website</label>
                <div className="profile-input-wrap">
                  <input
                    className="profile-input"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Bio</label>
                <div className="profile-input-wrap">
                  <textarea
                    className="profile-textarea"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share something about yourself or your gemstone business."
                  />
                  <span className="profile-help">
                    Add information about what kind of gemstones you collect or sell.
                  </span>
                </div>
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Email</label>
                <div className="profile-input-wrap">
                  <input
                    className="profile-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  <span className="profile-help">
                    This will be used for account security and notifications.
                  </span>
                </div>
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Account privacy</label>
                <div className="profile-input-wrap profile-toggle-row">
                  <label className="profile-toggle">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                    <span className="profile-toggle-slider" />
                    <span className="profile-toggle-label">Private account</span>
                  </label>
                  <span className="profile-help">
                    When your account is private, only approved followers can see your listings
                    and activity.
                  </span>
                </div>
              </div>

              <div className="profile-form-actions">
                <button type="submit" className="profile-save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}

export default ProfilePage;