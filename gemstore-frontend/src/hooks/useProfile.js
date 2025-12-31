import { useState, useEffect } from 'react';
import { getAuthToken, removeAuthToken} from '../api/config';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const useProfile = (currentUser, onProfileUpdate) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
    followingCount:  0,
  });

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // const getAuthToken = () => {
  //   return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  // };

  const handleUnauthorized = () => {
    removeAuthToken();
    window.location.href = '/login';
  }

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      const profileData = mapProfileData(data);
      setProfile(profileData);

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);

      // Fallback to currentUser prop
      if (currentUser) {
        setProfile(mapProfileData(currentUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
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
        handleUnauthorized();
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      const updatedProfile = {
        ...profile,
        displayName: updatedUser.displayName || formData.displayName,
        website: updatedUser.website || formData.website,
        bio: updatedUser.bio || formData.bio,
        privateProfile: updatedUser.privateProfile ?? formData.privateProfile,
      };

      setProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
      onProfileUpdate?.(updatedUser);

      return true; // Success
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      return false; // Failed
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    setSaving(true);
    setError(null);

    try {
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
        },
        body: formDataUpload,
      });

      if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload avatar');
      }

      const data = await response.json();
      setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl || null }));
      setSuccess('Avatar updated successfully!');
      onProfileUpdate?.({ ...profile, avatarUrl: data.avatarUrl || null });

    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeAvatar = async () => {
    setSaving(true);
    setError(null);

    try {
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
        handleUnauthorized();
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error('Failed to remove avatar');
      }

      setProfile(prev => ({ ...prev, avatarUrl: null }));
      setSuccess('Avatar removed successfully!');
      onProfileUpdate?.({ ...profile, avatarUrl: null });

    } catch (err) {
      console.error('Error removing avatar:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  // Fetch on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    saving,
    error,
    success,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    clearError,
    clearSuccess,
  };
};

// Helper function to map API response
const mapProfileData = (data) => ({
  displayName: data.displayName || data.display_name || '',
  username: data.username || '',
  email: data.email || '',
  website: data.website || '',
  bio: data.bio || '',
  privateProfile: data.privateProfile || data.private_profile || false,
  avatarUrl: data.avatarUrl || data.avatar_url || null,
  postsCount: data.postsCount || data.posts_count || 0,
  followersCount: data.followersCount || data.followers_count || 0,
  followingCount: data.followingCount || data.following_count || 0,
});

export default useProfile;