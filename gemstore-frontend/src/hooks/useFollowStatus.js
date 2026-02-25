import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders, handleResponse } from '../api/config';

const useFollowStatus = (userId, currentUser) => {
  const [followStatus, setFollowStatus] = useState('NONE'); // 'NONE' | 'PENDING' | 'ACTIVE'
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');

  // Derived states
  const isFollowing = followStatus === 'ACTIVE';
  const isPending = followStatus === 'PENDING';

  // Clear error
  const clearError = useCallback(() => setError(''), []);

  // Fetch follow status (exposed as a callable function)
  const fetchFollowStatus = useCallback(async () => {
    if (!userId || ! currentUser?. id) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${userId}/follow/status`,
        { headers: getAuthHeaders() }
      );
      const data = await handleResponse(response);
      setFollowStatus(data.data?.status || 'NONE');
    } catch (err) {
      console.log('Follow status check failed:', err);
      setFollowStatus('NONE');
    }
  }, [userId, currentUser?.id]);

  // Fetch follow status on mount
  useEffect(() => {
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  // Toggle follow/unfollow
  const toggleFollow = useCallback(async () => {
    if (!currentUser?. id || !userId) return false;

    setFollowLoading(true);
    setError('');
    const prevStatus = followStatus;

    // Optimistic update
    const optimistic = prevStatus === 'ACTIVE' ?  'NONE' : prevStatus === 'PENDING' ? 'NONE' : 'PENDING';
    setFollowStatus(optimistic);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${userId}/follow/toggle`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
      const data = await handleResponse(response);

      const isFollowingNow = data.data?.isFollowing;
      const isPendingNow = data.data?.isPending;

      // Set final status
      if (isFollowingNow) {
        setFollowStatus(isPendingNow ? 'PENDING' : 'ACTIVE');
      } else {
        setFollowStatus('NONE');
      }

      return true;
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      setFollowStatus(prevStatus);
      setError('Failed to update follow status');
      return false;
    } finally {
      setFollowLoading(false);
    }
  }, [userId, currentUser?. id, followStatus]);

  return {
    // State
    followStatus,
    followLoading,
    
    // Derived
    isFollowing,
    isPending,
    
    // Error
    error,
    clearError,
    
    // Actions
    toggleFollow,
    fetchFollowStatus,
  };
};

export default useFollowStatus;