import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders, handleResponse } from '../api/config';

const useFollowStatus = (userId, currentUser) => {
  const [followStatus, setFollowStatus] = useState('NONE'); // 'NONE' | 'PENDING' | 'ACTIVE'
  const [followLoading, setFollowLoading] = useState(false);

  // Fetch follow status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      if (!userId || !currentUser?. id) return;

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
    };

    fetchStatus();
  }, [userId, currentUser?.id]);

  // Toggle follow/unfollow
  const toggleFollow = useCallback(async () => {
    if (!currentUser?. id || !userId) return false;

    setFollowLoading(true);
    const prevStatus = followStatus;

    // Optimistic update
    const optimistic = prevStatus === 'ACTIVE' ? 'NONE' : prevStatus === 'PENDING' ? 'NONE' : 'PENDING';
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

      const isFollowingNow = data.data?. isFollowing;
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
      return false;
    } finally {
      setFollowLoading(false);
    }
  }, [userId, currentUser?.id, followStatus]);

  return {
    followStatus,
    followLoading,
    toggleFollow,
  };
};

export default useFollowStatus;