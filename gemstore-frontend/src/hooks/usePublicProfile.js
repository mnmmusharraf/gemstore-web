import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, getAuthHeaders, handleResponse } from '../api/config';
import useFollowStatus from './useFollowStatus';

const usePublicProfile = (userId, currentUser) => {
  // Profile state
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);

  // Error state
  const [error, setError] = useState('');

  // Derived states
  const isOwnProfile = currentUser?.id === parseInt(userId);

  // Reuse follow hook
  const {
    followStatus,
    isFollowing,
    isPending,
    followLoading,
    fetchFollowStatus,
    toggleFollow:  baseToggleFollow,
    error: followError,
    clearError: clearFollowError,
  } = useFollowStatus(userId, currentUser);

  // Clear error
  const clearError = useCallback(() => {
    setError('');
    clearFollowError();
  }, [clearFollowError]);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!userId || isOwnProfile) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      setProfile(data.data || data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  }, [userId, isOwnProfile]);

  // Fetch user's listings
  const fetchListings = useCallback(async () => {
    if (!userId || isOwnProfile) return;

    setListingsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/listings/seller/${userId}? page=0&size=20`,
        { headers: getAuthHeaders() }
      );
      const data = await handleResponse(response);
      setListings(data. data?.content || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setListings([]);
    } finally {
      setListingsLoading(false);
    }
  }, [userId, isOwnProfile]);

  // Toggle follow with profile update
  const toggleFollow = useCallback(async () => {
    const success = await baseToggleFollow();

    if (success) {
      // Update follower count locally
      setProfile((prev) => {
        if (! prev) return prev;
        const wasFollowing = followStatus === 'ACTIVE';
        return {
          ...prev,
          followersCount: wasFollowing
            ? Math.max(0, (prev. followersCount || 1) - 1)
            : (prev.followersCount || 0) + 1,
        };
      });
    }

    return success;
  }, [baseToggleFollow, followStatus]);

  // Refresh all data
  const refresh = useCallback(() => {
    fetchProfile();
    fetchListings();
    fetchFollowStatus();
  }, [fetchProfile, fetchListings, fetchFollowStatus]);

  // Initial data fetch
  useEffect(() => {
    if (userId && !isOwnProfile) {
      fetchProfile();
      fetchListings();
      fetchFollowStatus();
    }
  }, [userId, isOwnProfile, fetchProfile, fetchListings, fetchFollowStatus]);

  return {
    // Data
    profile,
    listings,

    // Loading states
    loading,
    listingsLoading,
    followLoading,

    // Follow state
    followStatus,
    isFollowing,
    isPending,

    // Computed
    isOwnProfile,

    // Error
    error:  error || followError,
    clearError,

    // Actions
    toggleFollow,
    refresh,
  };
};

export default usePublicProfile;