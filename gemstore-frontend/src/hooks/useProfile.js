import { useState, useEffect, useCallback } from 'react';
import { getMyListings, getMyFavorites } from '../api/profileService';
import {
  API_BASE_URL,
  getAuthHeaders,
  getAuthHeaderOnly,
  handleResponse
} from '../api/config';

const useProfile = (currentUser, onProfileUpdate) => {
  const [profile, setProfile] = useState({
    displayName: '',
    username: '',
    email: '',
    bio: '',
    website: '',
    avatarUrl:  '',
    privateProfile: false,
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
  });

  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ==================== LOAD PROFILE ====================
  useEffect(() => {
    if (currentUser) {
      setProfile({
        displayName: currentUser. displayName || '',
        username: currentUser. username || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        website: currentUser.website || '',
        avatarUrl: currentUser.avatarUrl || '',
        privateProfile: currentUser.privateProfile || false,
        postsCount: currentUser.postsCount || 0,
        followersCount: currentUser.followersCount || 0,
        followingCount: currentUser.followingCount || 0,
      });
      setLoading(false);
    }
  }, [currentUser]);

  // ==================== FETCH ACTUAL COUNTS ====================
  const fetchFollowCounts = useCallback(async () => {
    if (!currentUser?. id) return;

    try {
      // Fetch followers
      const followersRes = await fetch(
        `${API_BASE_URL}/api/v1/users/${currentUser.id}/followers?page=0&size=1`,
        { headers: getAuthHeaders() }
      );
      const followersData = await handleResponse(followersRes);

      // Fetch following
      const followingRes = await fetch(
        `${API_BASE_URL}/api/v1/users/${currentUser.id}/following?page=0&size=1`,
        { headers: getAuthHeaders() }
      );
      const followingData = await handleResponse(followingRes);

      // Extract counts from response
      const followersCount = followersData.data?.totalElements ??
                             followersData.totalElements ??  0;
      const followingCount = followingData.data?. totalElements ??
                             followingData.totalElements ?? 0;

      setProfile((prev) => ({
        ...prev,
        followersCount,
        followingCount,
      }));
    } catch (err) {
      console.error('Failed to fetch follow counts:', err);
    }
  }, [currentUser?.id]);

  // Fetch counts on mount
  useEffect(() => {
    if (currentUser?.id) {
      fetchFollowCounts();
    }
  }, [currentUser?.id, fetchFollowCounts]);

  // ==================== REFETCH PROFILE ====================
  const refetchProfile = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${currentUser.id}`,
        { headers: getAuthHeaders() }
      );
      const data = await handleResponse(response);
      setProfile(data);

      // Also refetch counts
      await fetchFollowCounts();
    } catch (err) {
      console.error('Failed to refetch profile:', err);
    }
  }, [currentUser?.id, fetchFollowCounts]);

  // ==================== FETCH LISTINGS ====================
  const fetchListings = useCallback(async (page = 0) => {
    setListingsLoading(true);
    try {
      const response = await getMyListings(null, page, 20);
      if (response.success) {
        setListings(response.data?. content || []);
        setProfile((prev) => ({
          ...prev,
          postsCount: response.data?.totalElements || 0,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Failed to load listings');
    } finally {
      setListingsLoading(false);
    }
  }, []);

  // ==================== FETCH FAVORITES ====================
  const fetchFavorites = useCallback(async (page = 0) => {
    setFavoritesLoading(true);
    try {
      const response = await getMyFavorites(page, 20);
      if (response.success) {
        setFavorites(response.data?. content || []);
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  // Load listings on mount
  useEffect(() => {
    if (currentUser?.id) {
      fetchListings();
    }
  }, [currentUser?.id, fetchListings]);

  // ==================== UPDATE PROFILE ====================
  const updateProfile = async (formData) => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          displayName: formData. displayName,
          bio: formData.bio,
          website: formData.website,
          privateProfile: formData.privateProfile,
        }),
      });

      const data = await handleResponse(response);

      setProfile((prev) => ({
        ...prev,
        displayName: data. displayName || prev.displayName,
        bio: data.bio || '',
        website: data.website || '',
        privateProfile: data.privateProfile || false,
      }));

      if (onProfileUpdate) {
        onProfileUpdate(data);
      }

      setSuccess('Profile updated successfully');
      return true;
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ==================== UPLOAD AVATAR ====================
  const uploadAvatar = async (file) => {
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
        method: 'POST',
        headers: getAuthHeaderOnly(),
        body: formData,
      });

      const data = await handleResponse(response);

      setProfile((prev) => ({
        ...prev,
        avatarUrl: data.avatarUrl,
      }));

      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, avatarUrl: data.avatarUrl });
      }

      setSuccess('Profile photo updated');
      return true;
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError(err.message || 'Failed to upload photo');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ==================== REMOVE AVATAR ====================
  const removeAvatar = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (! response.ok && response.status !== 204) {
        throw new Error('Failed to remove photo');
      }

      setProfile((prev) => ({
        ...prev,
        avatarUrl:  '',
      }));

      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, avatarUrl: '' });
      }

      setSuccess('Profile photo removed');
      return true;
    } catch (err) {
      console.error('Failed to remove avatar:', err);
      setError(err.message || 'Failed to remove photo');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ==================== UPDATE COUNTS (for modal callbacks) ====================
  const updateFollowCount = useCallback((type, count) => {
    setProfile((prev) => ({
      ...prev,
      [`${type}Count`]: count,
    }));
  }, []);

  // ==================== HELPERS ====================
  const clearError = () => setError('');
  const clearSuccess = () => setSuccess('');

  return {
    profile,
    listings,
    favorites,
    loading,
    listingsLoading,
    favoritesLoading,
    saving,
    error,
    success,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    fetchListings,
    fetchFavorites,
    fetchFollowCounts,
    updateFollowCount,
    clearError,
    clearSuccess,
    refetchProfile,
  };
};

export default useProfile;