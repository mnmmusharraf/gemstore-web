import React, { useState, useEffect } from 'react';
import "../../styles/ProfilePage.css";

// API base URL - adjust to your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function ProfilePage({ currentUser, onBack, onProfileUpdate }) {
  // view | edit
  const [mode, setMode] = useState('view');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({
    displayName: '',
    username: '',
    email: '',
    website: '',
    bio: '',
    privateProfile: false,
    avatarUrl: null,
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
  });

  // Edit form state (separate from display to allow cancel)
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    website: '',
    bio: '',
    privateProfile: false,
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const getAuthToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated.  Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();

      // Map backend response to frontend state
      const profileData = {
        displayName: data.displayName || '',
        username: data.username || '',
        email: data.email || '',
        website: data.website || '',
        bio: data.bio || '',
        privateProfile: data.privateProfile || false,
        avatarUrl: data.avatarUrl || null,
        postsCount: data.postsCount || 0,
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
      };

      setProfile(profileData);
      setFormData({
        displayName: profileData.displayName,
        username: profileData.username,
        email: profileData.email,
        website: profileData.website,
        bio: profileData.bio,
        privateProfile: profileData.privateProfile,
      });

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);

      // Fallback to currentUser prop if API fails
      if (currentUser) {
        const fallbackData = {
          displayName: currentUser.displayName || currentUser.display_name || '',
          username: currentUser.username || '',
          email: currentUser.email || '',
          website: currentUser.website || '',
          bio: currentUser.bio || '',
          privateProfile: currentUser.privateProfile || currentUser.private_profile || false,
          avatarUrl: currentUser.avatarUrl || currentUser.avatar_url || null,
          postsCount: currentUser.postsCount || currentUser.posts_count || 0,
          followersCount: currentUser.followersCount || currentUser.followers_count || 0,
          followingCount: currentUser.followingCount || currentUser.following_count || 0,
        };
        setProfile(fallbackData);
        setFormData({
          displayName: fallbackData.displayName,
          username: fallbackData.username,
          email: fallbackData.email,
          website: fallbackData.website,
          bio: fallbackData.bio,
          privateProfile: fallbackData.privateProfile,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH', // Use PATCH for partial update (matches your backend)
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          website: formData.website,
          bio: formData.bio,
          privateProfile: formData.privateProfile,
        }),
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();

      // Update local state
      const updatedProfile = {
        ...profile,
        displayName: updatedUser.displayName || formData.displayName,
        website: updatedUser.website || formData.website,
        bio: updatedUser.bio || formData.bio,
        privateProfile: updatedUser.privateProfile ?? formData.privateProfile,
      };

      setProfile(updatedProfile);
      setMode('view');
      setSuccess('Profile updated successfully!');

      // Notify parent component of profile update
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current profile values
    setFormData({
      displayName: profile.displayName,
      username: profile.username,
      email: profile.email,
      website: profile.website,
      bio: profile.bio,
      privateProfile: profile.privateProfile,
    });
    setError(null);
    setMode('view');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = async () => {
    // Create file input dynamically
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      try {
        setSaving(true);
        setError(null);
        const token = getAuthToken();

        if (!token) {
          throw new Error('Not authenticated. Please log in.');
        }

        const formDataUpload = new FormData();
        formDataUpload.append('avatar', file);

        const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData - browser sets it with boundary
          },
          body: formDataUpload,
        });

        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to upload avatar');
        }

        const data = await response.json();

        // Update avatar in state
        setProfile(prev => ({
          ...prev,
          avatarUrl: data.avatarUrl || null,
        }));

        setSuccess('Avatar updated successfully!');

        if (onProfileUpdate) {
          onProfileUpdate({ ...profile, avatarUrl: data.avatarUrl || null });
        }

      } catch (err) {
        console.error('Error uploading avatar:', err);
        setError(err.message);
      } finally {
        setSaving(false);
      }
    };

    input.click();
  };

  const handleRemoveAvatar = async () => {
    if (!profile.avatarUrl) return;

    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error('Failed to remove avatar');
      }

      // Update avatar in state
      setProfile(prev => ({
        ...prev,
        avatarUrl: null,
      }));

      setSuccess('Avatar removed successfully!');

      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, avatarUrl: null });
      }

    } catch (err) {
      console.error('Error removing avatar:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="profile-root">
        <div className="profile-loading">
          <div className="profile-spinner"></div>
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-root">
      <section className="profile-main">
        {/* Success message */}
        {success && (
          <div className="profile-success">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)}>×</button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="profile-error">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* HEADER:  avatar + username + stats + bio (Instagram style) */}
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
                  onClick={handleRemoveAvatar}
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
                <strong>{profile.postsCount}</strong> posts
              </span>
              <span>
                <strong>{profile.followersCount}</strong> followers
              </span>
              <span>
                <strong>{profile.followingCount}</strong> following
              </span>
            </div>

            <div className="profile-name-and-bio">
              <div className="profile-display-name">
                {profile.displayName || profile.username}
              </div>
              {profile.bio && <div className="profile-bio-text">{profile.bio}</div>}
              {profile.website && (
                <a
                  className="profile-website"
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </header>

        {/* VIEW MODE: posts grid */}
        {mode === 'view' && (
          <div className="profile-content">
            <div className="profile-tabs">
              <button className="profile-tab profile-tab-active">
                <span className="profile-tab-icon">📷</span> Posts
              </button>
              <button className="profile-tab">
                <span className="profile-tab-icon">🔖</span> Saved
              </button>
            </div>

            <div className="profile-posts-grid">
              {profile.postsCount === 0 ? (
                <div className="profile-no-posts">
                  <div className="profile-no-posts-icon">💎</div>
                  <span>No posts yet</span>
                  <p>When you list gemstones, they will appear here. </p>
                </div>
              ) : (
                // TODO: Fetch and map actual posts from backend
                [1, 2, 3, 4, 5, 6].map((id) => (
                  <div key={id} className="profile-post-tile">
                    <span className="profile-post-placeholder">Post {id}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* EDIT MODE: settings form */}
        {mode === 'edit' && (
          <div className="profile-form-card">
            <h2 className="profile-form-title">Edit profile</h2>

            <form className="profile-form" onSubmit={handleSave}>
              <div className="profile-form-row">
                <label className="profile-label">Name</label>
                <div className="profile-input-wrap">
                  <input
                    className="profile-input"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Your name"
                    maxLength={150}
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
                    className="profile-input profile-input-disabled"
                    value={formData.username}
                    placeholder="username"
                    maxLength={200}
                    disabled
                  />
                  <span className="profile-help">
                    Username changes are currently disabled. Contact support to change your username.
                  </span>
                </div>
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Website</label>
                <div className="profile-input-wrap">
                  <input
                    className="profile-input"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Bio</label>
                <div className="profile-input-wrap">
                  <textarea
                    className="profile-textarea"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Share something about yourself or your gemstone business."
                    maxLength={2000}
                  />
                  <span className="profile-help">
                    {formData.bio.length}/2000 characters
                  </span>
                </div>
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Email</label>
                <div className="profile-input-wrap">
                  <input
                    className="profile-input profile-input-disabled"
                    type="email"
                    value={formData.email}
                    placeholder="you@example.com"
                    disabled
                  />
                  <span className="profile-help">
                    Email changes require verification. Contact support to change your email.
                  </span>
                </div>
              </div>

              <div className="profile-form-row">
                <label className="profile-label">Account privacy</label>
                <div className="profile-input-wrap profile-toggle-row">
                  <label className="profile-toggle">
                    <input
                      type="checkbox"
                      checked={formData.privateProfile}
                      onChange={(e) => handleInputChange('privateProfile', e.target.checked)}
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
                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
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